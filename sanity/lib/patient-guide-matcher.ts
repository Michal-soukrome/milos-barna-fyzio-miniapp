import type { AgeGroup, GuideContext, PatientGuideSummary } from "./types";

export type PatientGuideAnswers = {
  ageGroup: AgeGroup | null;
  bodyPart: string | null;
  symptoms: string[] | null;
  contexts: GuideContext[] | null;
};

export type PatientGuideMatchResult =
  | { status: "match"; guides: PatientGuideSummary[] }
  | { status: "no-match" };

export const PATIENT_NAVIGATOR_NO_MATCH = {
  copy:
    "Nenašli jsme zveřejněný návod odpovídající všem vybraným údajům. To nevylučuje žádné onemocnění.",
  contactHref: "/kontakt",
  libraryHref: "/navody",
  emergencyNumbers: ["155", "112"],
} as const;

export function matchPatientGuides(
  guides: readonly PatientGuideSummary[],
  answers: PatientGuideAnswers,
): PatientGuideMatchResult {
  const { ageGroup, bodyPart, symptoms, contexts } = answers;
  if (
    ageGroup === null ||
    bodyPart === null ||
    symptoms === null ||
    contexts === null ||
    symptoms.length === 0 ||
    contexts.length === 0
  ) {
    return { status: "no-match" };
  }

  const matches = guides
    .filter(
      (guide) =>
        guide.reviewed === true &&
        guide.ageGroups.includes(ageGroup) &&
        guide.bodyPart === bodyPart &&
        symptoms.every((symptom) => guide.symptoms.includes(symptom)) &&
        contexts.some((context) => guide.contexts.includes(context)),
    )
    .sort((left, right) => left.title.localeCompare(right.title, "cs"));

  return matches.length > 0
    ? { status: "match", guides: matches }
    : { status: "no-match" };
}
