const SYSTEM_FIELDS = new Set([
  "_createdAt",
  "_id",
  "_rev",
  "_type",
  "_updatedAt",
  "reviewed",
]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
