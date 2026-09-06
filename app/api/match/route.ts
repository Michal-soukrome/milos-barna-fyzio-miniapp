import { NextRequest, NextResponse } from "next/server";
import { topics } from "@/lib/content";

const MAX_SITUATION_LENGTH = 500;

type MatchResult = { slug: string };

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

  const apiKey = process.env.OPENAI_API_KEY;
  const result = apiKey
    ? await matchWithAi(situation, apiKey)
    : matchLocally(situation);

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
    reason: apiKey
      ? "Téma vybrané z materiálů schválených ordinací."
      : "Téma vybrané podle slov ve vašem popisu.",
    source: apiKey ? "ai" : "local",
  });
}

async function matchWithAi(
  situation: string,
  apiKey: string,
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

    if (!response.ok) return null;
    const payload = await response.json();
    const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
    const slug = typeof parsed.slug === "string" ? parsed.slug : null;

    if (!slug || !topics.some((topic) => topic.slug === slug)) return null;
    return { slug };
  } catch {
    return matchLocally(situation);
  }
}

function matchLocally(situation: string): MatchResult | null {
  const words = normalize(situation)
    .split(/\s+/)
    .filter((word) => word.length > 2);
  let best: { topic: (typeof topics)[number]; score: number } | null = null;

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
  return { slug: best.topic.slug };
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ů/g, "u");
}
