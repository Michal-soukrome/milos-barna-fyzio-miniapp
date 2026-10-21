export const MIN_REVIEWED_SUMMARY_CHARACTERS = 20;
export const MIN_REVIEWED_BODY_CHARACTERS = 200;

const SYSTEM_FIELDS = new Set([
  "_createdAt",
  "_id",
  "_rev",
  "_type",
  "_updatedAt",
  "reviewed",
]);

export type ReviewableContentType = "article" | "diagnosis" | "patientGuide";

export function getReviewedContentSignature(value: unknown): string {
  if (!isRecord(value)) return "";

  return JSON.stringify(
    Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SYSTEM_FIELDS.has(key))
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

export function getPortableTextContent(value: unknown): string {
  if (!Array.isArray(value)) return "";

  const text = value.flatMap((block) => {
    if (!isRecord(block) || !Array.isArray(block.children)) return [];

    return block.children.flatMap((child) =>
      isRecord(child) && typeof child.text === "string" ? [child.text] : [],
    );
  });

  return normalizeText(text.join(" "));
}

export function getLegacyGuideContent(value: unknown): string {
  if (!Array.isArray(value)) return "";

  const text = value.flatMap((section) =>
    isRecord(section) && typeof section.text === "string"
      ? [section.text]
      : [],
  );

  return normalizeText(text.join(" "));
}

export function getReviewedContentIssues(
  type: ReviewableContentType,
  value: unknown,
): string[] {
  if (!isRecord(value)) {
    return ["Doplňte obsah dokumentu."];
  }

  const summaryField = type === "article" ? "excerpt" : "summary";
  const summaryLabel = type === "article" ? "úvodní shrnutí" : "krátký popis";
  const summary = value[summaryField];
  const issues: string[] = [];

  if (!hasMeaningfulText(summary, MIN_REVIEWED_SUMMARY_CHARACTERS)) {
    issues.push(`Doplňte smysluplný ${summaryLabel} (alespoň 20 znaků).`);
  }

  const bodyText = [
    getPortableTextContent(value.body),
    ...(type === "patientGuide" ? [getLegacyGuideContent(value.sections)] : []),
  ]
    .filter(Boolean)
    .join(" ");

  if (!hasMeaningfulText(bodyText, MIN_REVIEWED_BODY_CHARACTERS)) {
    issues.push(
      "Doplňte alespoň 200 znaků ověřeného textového obsahu bez zástupného textu.",
    );
  }

  if (type === "patientGuide") {
    if (!hasEntries(value.ageGroups)) {
      issues.push("Vyberte alespoň jednu věkovou skupinu.");
    }
    if (!hasEntries(value.contexts)) {
      issues.push("Vyberte alespoň jednu situaci, pro kterou návod platí.");
    }
    if (
      !hasMeaningfulText(
        getStringArrayContent(value.warningSigns),
        MIN_REVIEWED_SUMMARY_CHARACTERS,
      )
    ) {
      issues.push("Doplňte konkrétní varovné příznaky.");
    }
  }

  return issues;
}

export function hasMeaningfulText(
  value: unknown,
  minimumCharacters: number,
): value is string {
  if (typeof value !== "string") return false;

  const text = normalizeText(value);
  return (
    text.length >= minimumCharacters && !containsPlaceholderText(text)
  );
}

function getStringArrayContent(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return normalizeText(
    value.filter((item): item is string => typeof item === "string").join(" "),
  );
}

function hasEntries(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function containsPlaceholderText(value: string): boolean {
  return (
    /\b(?:bude|budou)\s+dopln(?:ěn|ěna|ěno|ěny|ěné)\b/iu.test(value) ||
    /\b(?:placeholder|todo)\b/iu.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
