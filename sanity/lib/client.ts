import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const readToken = process.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = Boolean(projectId && dataset);

export const sanityClient =
  projectId && dataset
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2026-10-20",
        perspective: "published",
        token: readToken,
        useCdn: false,
      })
    : null;
