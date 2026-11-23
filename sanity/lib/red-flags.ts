/**
 * PLACEHOLDER. A clinician must approve the patterns and patient-facing
 * notice before this check is relied on in production.
 */
const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const RED_FLAG_PATTERNS: RegExp[] = [
  /dusn|nemohu dychat|nemuzu dychat|zadychat/,
  /bolest\w* (na )?hrud/,
  /bezvedom|omdlel|omdlev|zkolaboval/,
  /necitliv|ochrnut|nemohu (hybat|pohnout)|nemuzu (hybat|pohnout)/,
  /modraj|zmodral|zmodra|zbledl\w* prst/,
  /silne krvac|nezastavi se krev|otevrena zlomenin/,
  /horecka|horecn/,
];

export function findRedFlag(text: string): boolean {
  const normalized = normalize(text);
  return RED_FLAG_PATTERNS.some((pattern) => pattern.test(normalized));
}
