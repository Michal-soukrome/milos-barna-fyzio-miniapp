import { NextRequest, NextResponse } from "next/server";
import { isSanityConfigured } from "@/sanity/lib/client";
import { getPatientGuideSummaries } from "@/sanity/lib/patient-guides";
import type { PatientGuideSummary } from "@/sanity/lib/types";

const MAX_SITUATION_LENGTH = 500;

type MatchResult = { slug: string; source: "ai" | "local" };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const situation =
    typeof body?.situation === "string" ? body.situation.trim() : "";

  if (!situation) {
    return NextResponse.json(
      { error: "Popište prosím svou situaci." },
      { status: 400 },
    );
  }

  if (situation.length > MAX_SITUATION_LENGTH) {
    return NextResponse.json(
      { error: `Popis může mít nejvýše ${MAX_SITUATION_LENGTH} znaků.` },
      { status: 400 },
    );
  }

  if (!isSanityConfigured) {
    return NextResponse.json(
      { error: "Knihovna pokynů pro pacienty není připojena k CMS." },
      { status: 503 },
    );
  }

  let topics: PatientGuideSummary[];
  try {
    topics = await getPatientGuideSummaries();
  } catch (error) {
    console.error(
      "Patient guide query failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Seznam pacientských témat se nepodařilo načíst." },
      { status: 503 },
    );
  }

  if (topics.length === 0) {
    return NextResponse.json(
      { error: "Zatím nejsou zveřejněná žádná pacientská témata." },
      { status: 503 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const result = apiKey
    ? await matchWithAi(situation, apiKey, topics)
    : matchLocally(situation, topics);

  if (!result) {
    return NextResponse.json(
      {
        error:
          "Nenašli jsme vhodné téma. Zkuste popis upřesnit nebo vyberte téma ručně.",
      },
      { status: 404 },
    );
  }

  const topic = topics.find((item) => item.slug === result.slug);
  if (!topic) {
    return NextResponse.json(
      { error: "Nenašli jsme vhodné téma. Vyberte prosím téma ručně." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    topic: {
      slug: topic.slug,
      title: topic.title,
      bodyPart: topic.bodyPart,
      summary: topic.summary,
    },
    reason: result.source === "ai"
      ? "Téma doporučené podle popisu."
      : "Téma vybrané podle slov ve vašem popisu.",
    source: result.source,
  });
}

async function matchWithAi(
  situation: string,
  apiKey: string,
  topics: PatientGuideSummary[],
): Promise<MatchResult | null> {
  const topicCatalog = topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    bodyPart: topic.bodyPart,
    symptoms: topic.symptoms,
    summary: topic.summary,
  }));

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Jsi pouze router. Vyber nejvhodnější slug z dodaného seznamu témat. Nikdy nevytvářej lékařské rady, diagnózy ani nové téma. Pokud nic dobře neodpovídá, vrať null. Odpověz pouze JSON ve tvaru {"slug": string|null}.',
          },
          {
            role: "user",
            content: JSON.stringify({ situation, topics: topicCatalog }),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Topic matching provider returned an error", response.status);
      return matchLocally(situation, topics);
    }
    const payload = await response.json();
    const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
    const slug = typeof parsed.slug === "string" ? parsed.slug : null;

    if (!slug || !topics.some((topic) => topic.slug === slug)) {
      return matchLocally(situation, topics);
    }
    return { slug, source: "ai" };
  } catch (error) {
    console.error("Topic matching provider request failed", error);
    return matchLocally(situation, topics);
  }
}

function matchLocally(
  situation: string,
  topics: PatientGuideSummary[],
): MatchResult | null {
  const words = normalize(situation)
    .split(/\s+/)
    .filter((word) => word.length > 2);
  let best: { topic: PatientGuideSummary; score: number } | null = null;

  for (const topic of topics) {
    const searchable = normalize(
      `${topic.title} ${topic.bodyPart} ${topic.summary} ${topic.symptoms.join(" ")}`,
    );
    const score = words.reduce(
      (total, word) => total + (searchable.includes(word) ? 1 : 0),
      0,
    );
    if (score > (best?.score ?? 0)) best = { topic, score };
  }

  if (!best || best.score === 0) return null;
  return { slug: best.topic.slug, source: "local" };
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ů/g, "u");
}
