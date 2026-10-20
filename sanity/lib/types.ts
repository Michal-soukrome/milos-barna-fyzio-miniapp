import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageCrop, SanityImageHotspot } from "@sanity/image-url";
import type { ArticleBodyPart } from "./article-taxonomy";

export type AgeGroup = "child" | "adult" | "senior";

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
  symptoms: string[];
  summary: string;
};

export type PatientGuide = PatientGuideSummary & {
  ageGroups: AgeGroup[];
  sections?: PatientGuideSection[];
  body?: PatientGuideBodyBlock[];
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
  bodyPart?: ArticleBodyPart | null;
  categories?: string[];
};

export type PublishedArticle = ArticleSummary & {
  body: PortableTextBlock[];
};
