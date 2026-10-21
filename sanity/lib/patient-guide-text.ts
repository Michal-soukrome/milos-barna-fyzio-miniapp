import type { PatientGuideSummary } from "./types";

export function normalizePatientGuideText(value: string) {
  return value
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function findMatchingPatientGuide(
  situation: string,
  topics: PatientGuideSummary[],
) {
  const words = [
    ...new Set(
      normalizePatientGuideText(situation)
        .split(/\s+/)
        .filter((word) => word.length > 2),
    ),
  ];
  let best: { topic: PatientGuideSummary; score: number } | null = null;

  for (const topic of topics) {
    const searchable = normalizePatientGuideText(
      `${topic.title} ${topic.bodyPart} ${topic.summary} ${topic.symptoms.join(" ")}`,
    );
    const score = words.reduce(
      (total, word) => total + (searchable.includes(word) ? 1 : 0),
      0,
    );
    if (score > (best?.score ?? 0)) best = { topic, score };
  }

  return best?.score ? best.topic : null;
}
