import type { AgeGroup, GuideContext, PatientGuideSummary } from "./types";

export type PatientGuideAnswers = {
  ageGroup: AgeGroup | null;
  bodyPart: string | null;
  symptoms: string[] | null;
  contexts: GuideContext[] | null;
  contextUnknown?: boolean;
};

export type PartialPatientGuideAnswers = {
  ageGroup?: AgeGroup | null;
  bodyPart?: string | null;
  symptoms?: string[];
  contexts?: GuideContext[];
};

export type PatientGuideMatchResult =
  { status: "match"; guides: PatientGuideSummary[] } | { status: "no-match" };

export const PATIENT_NAVIGATOR_NO_MATCH = {
  copy: "Nenašli jsme zveřejněnou radu ani tip odpovídající všem vybraným údajům. To nevylučuje žádné onemocnění.",
  contactHref: "/kontakt",
  libraryHref: "/poradna",
  emergencyNumbers: ["155", "112"],
} as const;

/**
 * How many guides can still be reached. Unset, null or empty answers
 * are treated as "not decided yet", not as "unknown". Uses the same
 * rules as matchPatientGuides for everything that is set.
 */
export function countReachableGuides(
  guides: readonly PatientGuideSummary[],
  {
    ageGroup,
    bodyPart,
    symptoms = [],
    contexts = [],
  }: PartialPatientGuideAnswers,
): number {
  return guides.filter(
    (guide) =>
      guide.reviewed === true &&
      (!ageGroup || guide.ageGroups.includes(ageGroup)) &&
      (!bodyPart || guide.bodyPart === bodyPart) &&
      symptoms.every((symptom) => guide.symptoms.includes(symptom)) &&
      (contexts.length === 0 ||
        contexts.some((context) => guide.contexts.includes(context))),
  ).length;
}

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
    answers.contextUnknown === true ||
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
