import { checkRateLimit } from "@vercel/firewall";
import { NextRequest, NextResponse } from "next/server.js";
import {
  getPatientGuideBySlug,
  getPatientGuideSummaries,
} from "../../../sanity/lib/patient-guides.ts";
import { findRedFlag } from "../../../sanity/lib/red-flags.ts";
import type { PatientGuideSummary } from "../../../sanity/lib/types.ts";
import {
  getReviewedClinicContent,
  getReviewedClinicContentSummaries,
} from "../../../sanity/lib/clinic-content.ts";
import {
  generateClinicContentExplanation,
  generateGeneralHealthEducation,
  getCloudflareConfig,
  selectRelevantClinicContent,
  selectRelevantGuides,
} from "../../../sanity/lib/match-ai.ts";

const MAX_BODY_BYTES = 2048;
const MAX_QUERY_CHARS = 500;
const NO_STORE = { "Cache-Control": "no-store" };

type MatchGuide = Pick<
  PatientGuideSummary,
  "_id" | "title" | "slug" | "bodyPart" | "summary"
>;
type MatchSource =
  | "llm"
  | "embeddings"
  | "none"
  | "clinic-answer"
  | "general-answer";
type MatchResponse = {
  urgent?: boolean;
  guides?: MatchGuide[];
  answer?: string;
  content?: {
    kind: "patientGuide" | "diagnosis" | "article";
    title: string;
    slug: string;
  };
  reason?: "safety";
  source?: MatchSource;
  error?: string;
  fallback?: boolean;
};

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkMatchRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let rawBody: string;
  try {
    rawBody = await readRequestBody(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return reply({ error: "Požadavek je příliš velký." }, 413);
    }
    console.error(
      "Patient guide match request body could not be read.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return reply({ error: "Požadavek se nepodařilo přečíst." }, 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return reply({ error: "Neplatný požadavek." }, 400);
  }
  const mode = isRecord(payload) ? payload.mode : undefined;
  if (mode !== undefined && mode !== "answer") {
    return reply({ error: "Neplatný požadavek." }, 400);
  }
  const query =
    isRecord(payload) && typeof payload.query === "string"
      ? payload.query.trim()
      : "";
  if (!query || [...query].length > MAX_QUERY_CHARS) {
    return reply({ error: "Neplatný dotaz." }, 400);
  }

  if (findRedFlag(query)) {
    return reply({ urgent: true, guides: [], source: "none" });
  }

  const config = getCloudflareConfig();
  if (!config) {
    return reply(
      { error: "AI vyhledávání není nakonfigurováno.", fallback: true },
      503,
    );
  }

  try {
    if (mode === "answer") {
      const summaries = await getReviewedClinicContentSummaries();
      const selection = await selectRelevantClinicContent(
        config,
        query,
        summaries,
      );
      if (selection.failed) {
        return reply(
          {
            error: "Vyhledávání zveřejněného obsahu není dostupné.",
            fallback: true,
          },
          503,
        );
      }
      const selected = selection.contents[0];

      if (selected) {
        const content = await getReviewedClinicContent(selected);
        if (content) {
          const answer = await generateClinicContentExplanation(
            config,
            query,
            content,
          );
          if (answer) {
            return reply({
              source: "clinic-answer",
              answer,
              content: {
                kind: content.kind,
                title: content.title,
                slug: content.slug,
              },
            });
          }
        }
      }

      const answer = await generateGeneralHealthEducation(config, query);
      return answer
        ? reply({ source: "general-answer", answer })
        : reply({ source: "none", reason: "safety" });
    }

    const guides = await getPatientGuideSummaries();
    if (guides.length === 0) return reply({ guides: [], source: "none" });

    const selection = await selectRelevantGuides(config, query, guides);

    return reply({
      source: selection.source,
      guides: selection.guides.map(
        ({ _id, title, slug, bodyPart, summary }) => ({
          _id,
          title,
          slug,
          bodyPart,
          summary,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Patient AI search or explanation failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return reply(
      { error: "AI vyhledávání selhalo.", fallback: true },
      503,
    );
  }
}

async function checkMatchRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (process.env.VERCEL !== "1") return null;

  try {
    const { rateLimited, error } = await checkRateLimit("patient-guide-match", {
      request,
      timeout: 1000,
    });
    if (error) {
      console.error("Guide-match rate-limit rule unavailable.", error);
      return reply(
        { error: "Vyhledávání je dočasně nedostupné.", fallback: true },
        503,
      );
    }
    if (!rateLimited) return null;
    return reply({ error: "Příliš mnoho požadavků." }, 429);
  } catch (error) {
    console.error(
      "Guide-match rate-limit check failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return reply(
      { error: "Vyhledávání je dočasně nedostupné.", fallback: true },
      503,
    );
  }
}

async function readRequestBody(request: Request): Promise<string> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RequestBodyTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) return "";

  const bytes = new Uint8Array(MAX_BODY_BYTES);
  let bytesRead = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (bytesRead + value.byteLength > MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch (error) {
          console.error(
            "Guide-match request body could not be cancelled after exceeding its size limit.",
            error instanceof Error ? error.name : "Unknown error",
          );
        }
        throw new RequestBodyTooLargeError();
      }
      bytes.set(value, bytesRead);
      bytesRead += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  return new TextDecoder().decode(bytes.subarray(0, bytesRead));
}

class RequestBodyTooLargeError extends Error {}

function reply(body: MatchResponse, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
