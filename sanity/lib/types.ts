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
  ageGroups: AgeGroup[];
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
