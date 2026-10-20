export const ARTICLE_BODY_PARTS = [
  { value: "noha-a-hlezno", label: "Noha a hlezno" },
  { value: "koleno", label: "Koleno" },
  { value: "zapesti-a-ruka", label: "Zápěstí a ruka" },
  { value: "obecne", label: "Obecné" },
] as const;

export type ArticleBodyPart = (typeof ARTICLE_BODY_PARTS)[number]["value"];

export function getArticleBodyPartLabel(bodyPart?: string | null) {
  return ARTICLE_BODY_PARTS.find((part) => part.value === bodyPart)?.label;
}
