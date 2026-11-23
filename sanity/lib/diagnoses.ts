import { sanityClient } from "./client.ts";
import { getSanityContentCacheTags } from "./cache-tags.ts";
import {
  DIAGNOSES_QUERY,
  DIAGNOSIS_QUERY,
  LATEST_DIAGNOSES_QUERY,
} from "./queries.ts";
import type {
  DiagnosisSummary,
  LatestDiagnosisSummary,
  PublishedDiagnosis,
} from "./types.ts";

export const diagnosisRevalidateSeconds = 300;

type DeduplicableDiagnosis = {
  slug: string;
  summary?: string | null;
};

function deduplicateBySlug<T extends DeduplicableDiagnosis>(
  diagnoses: readonly T[],
): T[] {
  const unique = new Map<string, T>();
  for (const diagnosis of diagnoses) {
    const current = unique.get(diagnosis.slug);
    if (!current || (!current.summary && diagnosis.summary)) {
      unique.set(diagnosis.slug, diagnosis);
    }
  }
  return Array.from(unique.values());
}

export async function getDiagnoses(): Promise<DiagnosisSummary[]> {
  if (!sanityClient) return [];

  const diagnoses = await sanityClient.fetch<DiagnosisSummary[]>(
    DIAGNOSES_QUERY,
    {},
    {
      next: {
        revalidate: diagnosisRevalidateSeconds,
        tags: getSanityContentCacheTags("diagnosis"),
      },
    },
  );
  return deduplicateBySlug(diagnoses);
}

export async function getDiagnosisBySlug(
  slug: string,
): Promise<PublishedDiagnosis | null> {
  if (!sanityClient) return null;

  const diagnosis = await sanityClient.fetch<PublishedDiagnosis | null>(
    DIAGNOSIS_QUERY,
    { slug },
    {
      next: {
        revalidate: diagnosisRevalidateSeconds,
        tags: getSanityContentCacheTags("diagnosis", slug),
      },
    },
  );
  if (!diagnosis) return null;

  return {
    ...diagnosis,
    relatedDiagnoses: deduplicateBySlug(diagnosis.relatedDiagnoses).slice(0, 3),
  };
}

export async function getLatestDiagnoses(): Promise<LatestDiagnosisSummary[]> {
  if (!sanityClient) return [];

  const diagnoses = await sanityClient.fetch<LatestDiagnosisSummary[]>(
    LATEST_DIAGNOSES_QUERY,
    {},
    {
      next: {
        revalidate: diagnosisRevalidateSeconds,
        tags: getSanityContentCacheTags("diagnosis"),
      },
    },
  );
  return deduplicateBySlug(diagnoses);
}
