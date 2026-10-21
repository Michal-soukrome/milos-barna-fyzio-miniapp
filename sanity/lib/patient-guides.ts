import { sanityClient } from "./client";
import {
  PATIENT_GUIDES_QUERY,
  PATIENT_GUIDE_QUERY,
  PATIENT_GUIDE_SUMMARIES_QUERY,
  LATEST_PATIENT_GUIDES_QUERY,
} from "./queries";
import type {
  LatestPatientGuideSummary,
  PatientGuide,
  PatientGuideSummary,
} from "./types";
export { normalizePatientGuideText } from "./patient-guide-text";

export const patientGuideRevalidateSeconds = 300;

export async function getPatientGuides(): Promise<PatientGuide[]> {
  if (!sanityClient) return [];

  return sanityClient.fetch<PatientGuide[]>(
    PATIENT_GUIDES_QUERY,
    {},
    { next: { revalidate: patientGuideRevalidateSeconds } },
  );
}

export async function getPatientGuideBySlug(
  slug: string,
): Promise<PatientGuide | null> {
  if (!sanityClient) return null;

  return sanityClient.fetch<PatientGuide | null>(
    PATIENT_GUIDE_QUERY,
    { slug },
    { next: { revalidate: patientGuideRevalidateSeconds } },
  );
}

export async function getPatientGuideSummaries(): Promise<
  PatientGuideSummary[]
> {
  if (!sanityClient) return [];

  return sanityClient.fetch<PatientGuideSummary[]>(
    PATIENT_GUIDE_SUMMARIES_QUERY,
    {},
    { next: { revalidate: patientGuideRevalidateSeconds } },
  );
}

export async function getLatestPatientGuideSummaries(): Promise<
  LatestPatientGuideSummary[]
> {
  if (!sanityClient) return [];

  return sanityClient.fetch<LatestPatientGuideSummary[]>(
    LATEST_PATIENT_GUIDES_QUERY,
    {},
    { next: { revalidate: patientGuideRevalidateSeconds } },
  );
}
