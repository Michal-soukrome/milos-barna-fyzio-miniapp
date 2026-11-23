import { sanityClient } from "./client.ts";
import { getSanityContentCacheTags } from "./cache-tags.ts";
import { getDiagnosisBySlug } from "./diagnoses.ts";
import {
  ARTICLE_QUERY,
  REVIEWED_CLINIC_CONTENT_SEARCH_QUERY,
} from "./queries.ts";
import { getPatientGuideBySlug } from "./patient-guides.ts";
import type {
  PatientGuideBodyBlock,
  PublishedArticle,
  PublishedDiagnosis,
} from "./types.ts";

export type ClinicContentKind = "patientGuide" | "diagnosis" | "article";

export type ClinicContentSummary = {
  _id: string;
  kind: ClinicContentKind;
  title: string;
  slug: string;
  bodyPart: string;
  summary: string;
  bodyText: string;
  symptoms: string[];
  contexts: string[];
  category: string;
  categories: string[];
};

export type ApprovedClinicContent = {
  kind: ClinicContentKind;
  title: string;
  slug: string;
  bodyPart: string;
  summary: string;
  text: string;
  warningSigns: string[];
};

const clinicContentRevalidateSeconds = 300;

export async function getReviewedClinicContentSummaries(): Promise<
  ClinicContentSummary[]
> {
  if (!sanityClient) return [];

  return sanityClient.fetch<ClinicContentSummary[]>(
    REVIEWED_CLINIC_CONTENT_SEARCH_QUERY,
    {},
    {
      next: {
        revalidate: clinicContentRevalidateSeconds,
        tags: [
          ...getSanityContentCacheTags("patientGuide"),
          ...getSanityContentCacheTags("diagnosis"),
          ...getSanityContentCacheTags("article"),
        ],
      },
    },
  );
}

export async function getReviewedClinicContent(
  summary: ClinicContentSummary,
): Promise<ApprovedClinicContent | null> {
  switch (summary.kind) {
    case "patientGuide": {
      const guide = await getPatientGuideBySlug(summary.slug);
      if (!guide) return null;
      const bodyText = getPortableTextText(guide.body ?? []);
      const sectionsText = (guide.sections ?? [])
        .map((section) => `${section.heading}\n${section.text}`)
        .join("\n");

      return {
        kind: "patientGuide",
        title: guide.title,
        slug: guide.slug,
        bodyPart: guide.bodyPart,
        summary: guide.summary,
        text: bodyText || sectionsText || guide.summary,
        warningSigns: guide.warningSigns,
      };
    }
    case "diagnosis": {
      const diagnosis = await getDiagnosisBySlug(summary.slug);
      if (!diagnosis) return null;

      return {
        kind: "diagnosis",
        title: diagnosis.title,
        slug: diagnosis.slug,
        bodyPart: diagnosis.bodyPart,
        summary: diagnosis.summary ?? "",
        text:
          getPortableTextText(diagnosis.body ?? []) ||
          diagnosis.summary ||
          "",
        warningSigns: [],
      };
    }
    case "article": {
      if (!sanityClient) return null;
      const article = await sanityClient.fetch<PublishedArticle | null>(
        ARTICLE_QUERY,
        { slug: summary.slug },
        {
          next: {
            revalidate: clinicContentRevalidateSeconds,
            tags: getSanityContentCacheTags("article", summary.slug),
          },
        },
      );
      if (!article) return null;

      return {
        kind: "article",
        title: article.title,
        slug: article.slug,
        bodyPart: article.bodyPart ?? "",
        summary: article.excerpt ?? "",
        text:
          getPortableTextText(article.body) ||
          article.excerpt ||
          "",
        warningSigns: [],
      };
    }
  }
}

function getPortableTextText(
  blocks: PatientGuideBodyBlock[] | PublishedDiagnosis["body"] | PublishedArticle["body"],
): string {
  return (blocks ?? [])
    .map((block) => {
      if (!("children" in block)) return "";
      return block.children.map((child) => child.text).join("");
    })
    .filter(Boolean)
    .join("\n");
}
