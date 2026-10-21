import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageCrop, SanityImageHotspot } from "@sanity/image-url";
import type { ArticleBodyPart } from "./article-taxonomy";

export type AgeGroup = "child" | "adult" | "senior";

export const GUIDE_CONTEXTS = [
  "general",
  "after-surgery",
  "after-fracture",
  "in-cast",
  "using-crutches",
  "after-sprain",
] as const;

export type GuideContext = (typeof GUIDE_CONTEXTS)[number];

export const GUIDE_CONTEXT_LABELS: Record<GuideContext, string> = {
  general: "Obecné obtíže",
  "after-surgery": "Po operaci",
  "after-fracture": "Po potvrzené zlomenině",
  "in-cast": "Při nošení sádry",
  "using-crutches": "Při používání berlí",
  "after-sprain": "Po potvrzeném podvrtnutí",
};

export type PatientGuideSection = {
  heading: string;
  text: string;
};

export type PatientGuideImage = {
  _type: "image";
  _key?: string;
  asset: {
    _ref: string;
    _type: "reference";
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
      };
    };
  };
  alt: string;
  caption?: string;
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;
};

export type PatientGuideBodyBlock = PortableTextBlock | PatientGuideImage;

export type PatientGuideSummary = {
  _id: string;
  title: string;
  slug: string;
  bodyPart: string;
  ageGroups: AgeGroup[];
  contexts: GuideContext[];
  symptoms: string[];
  summary: string;
  reviewed: boolean;
};

export type PatientGuide = PatientGuideSummary & {
  sections?: PatientGuideSection[];
  body?: PatientGuideBodyBlock[];
  warningSigns: string[];
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
  bodyPart?: ArticleBodyPart | null;
  categories?: string[];
};

export type LatestPatientGuideSummary = Pick<
  PatientGuideSummary,
  "_id" | "title" | "slug"
>;

export type PublishedArticle = ArticleSummary & {
  body: PortableTextBlock[];
};

export type DiagnosisSummary = {
  _id: string;
  title: string;
  slug: string;
  bodyPart: ArticleBodyPart;
  category: string;
  summary?: string | null;
};

export type LatestDiagnosisSummary = Pick<
  DiagnosisSummary,
  "_id" | "title" | "slug"
>;

export type PublishedDiagnosis = DiagnosisSummary & {
  body?: PortableTextBlock[] | null;
  relatedDiagnoses: DiagnosisSummary[];
};
