export const SANITY_CACHE_TAGS = {
  patientGuides: "sanity:patient-guides",
  diagnoses: "sanity:diagnoses",
  articles: "sanity:articles",
} as const;

export type SanityPublicContentType = "article" | "diagnosis" | "patientGuide";

export function isSanityContentSlug(value: string): boolean {
  return value.length <= 96 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function getSanityContentCacheTags(
  type: SanityPublicContentType,
  slug?: string,
): string[] {
  const tags = [getCollectionCacheTag(type)];
  if (slug && isSanityContentSlug(slug)) {
    tags.push(getDocumentCacheTag(type, slug));
  }
  return tags;
}

export function getSanityRevalidationTags(
  type: SanityPublicContentType,
  slugs: readonly string[],
): string[] {
  return Array.from(
    new Set([
      getCollectionCacheTag(type),
      ...slugs.map((slug) => getDocumentCacheTag(type, slug)),
    ]),
  );
}

function getCollectionCacheTag(type: SanityPublicContentType): string {
  switch (type) {
    case "patientGuide":
      return SANITY_CACHE_TAGS.patientGuides;
    case "diagnosis":
      return SANITY_CACHE_TAGS.diagnoses;
    case "article":
      return SANITY_CACHE_TAGS.articles;
  }
}

function getDocumentCacheTag(
  type: SanityPublicContentType,
  slug: string,
): string {
  const documentType = type === "patientGuide" ? "patient-guide" : type;
  return `sanity:${documentType}:${slug}`;
}
