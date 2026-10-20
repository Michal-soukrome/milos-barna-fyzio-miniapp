import type { PortableTextBlock } from "@portabletext/types";

export type AgeGroup = "child" | "adult" | "senior";

export type PatientGuideSection = {
  heading: string;
  text: string;
};

export type PatientGuideSummary = {
  _id: string;
  title: string;
  slug: string;
  bodyPart: string;
  symptoms: string[];
  summary: string;
};

export type PatientGuide = PatientGuideSummary & {
  ageGroups: AgeGroup[];
  sections: PatientGuideSection[];
  warningSigns: string[];
  isDemo: boolean;
  medicalReviewed: boolean;
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: "Dítě",
  adult: "Dospělý",
  senior: "Senior",
};

export type ArticleSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
};

export type PublishedArticle = ArticleSummary & {
  body: PortableTextBlock[];
};
