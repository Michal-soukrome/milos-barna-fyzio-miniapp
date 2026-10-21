import { sanityClient } from "./client";
import {
  DIAGNOSES_QUERY,
  DIAGNOSIS_QUERY,
  LATEST_DIAGNOSES_QUERY,
} from "./queries";
import type {
  DiagnosisSummary,
  LatestDiagnosisSummary,
  PublishedDiagnosis,
} from "./types";

export const diagnosisRevalidateSeconds = 300;

export async function getDiagnoses(): Promise<DiagnosisSummary[]> {
  if (!sanityClient) return [];

  return sanityClient.fetch<DiagnosisSummary[]>(
    DIAGNOSES_QUERY,
    {},
    { next: { revalidate: diagnosisRevalidateSeconds } },
  );
}

export async function getDiagnosisBySlug(
  slug: string,
): Promise<PublishedDiagnosis | null> {
  if (!sanityClient) return null;

  return sanityClient.fetch<PublishedDiagnosis | null>(
    DIAGNOSIS_QUERY,
    { slug },
    { next: { revalidate: diagnosisRevalidateSeconds } },
  );
}

export async function getLatestDiagnoses(): Promise<LatestDiagnosisSummary[]> {
  if (!sanityClient) return [];

  return sanityClient.fetch<LatestDiagnosisSummary[]>(
    LATEST_DIAGNOSES_QUERY,
    {},
    { next: { revalidate: diagnosisRevalidateSeconds } },
  );
}
