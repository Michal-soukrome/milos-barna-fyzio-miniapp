import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import {
  getSanityRevalidationTags,
  isSanityContentSlug,
  type SanityPublicContentType,
} from "@/sanity/lib/cache-tags";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret?.trim()) {
    console.error("Sanity revalidation is disabled: webhook secret is missing.");
    return NextResponse.json(
      { error: "Revalidation is not configured." },
      { status: 500 },
    );
  }

  let parsed: Awaited<ReturnType<typeof parseBody<unknown>>>;
  try {
    parsed = await parseBody<unknown>(request, secret);
  } catch (error) {
    console.error(
      "Sanity webhook payload could not be parsed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Invalid webhook payload." },
      { status: 400 },
    );
  }

  if (parsed.isValidSignature !== true) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  if (!isRecord(parsed.body) || !isPublicContentType(parsed.body._type)) {
    return NextResponse.json(
      { error: "Unsupported webhook document type." },
      { status: 400 },
    );
  }

  const slugs = getWebhookSlugs(parsed.body);
  if (!slugs || slugs.length === 0) {
    return NextResponse.json(
      { error: "Webhook must include the previous or current document slug." },
      { status: 400 },
    );
  }

  const tags = getSanityRevalidationTags(parsed.body._type, slugs);
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags });
}

function getWebhookSlugs(
  payload: Record<string, unknown>,
): string[] | null {
  const values = [payload.beforeSlug, payload.afterSlug];
  const slugs: string[] = [];

  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" || !isSanityContentSlug(value)) return null;
    slugs.push(value);
  }

  return Array.from(new Set(slugs));
}

function isPublicContentType(
  value: unknown,
): value is SanityPublicContentType {
  return (
    value === "patientGuide" || value === "diagnosis" || value === "article"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
