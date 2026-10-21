import { sanityClient } from "./client";
import { LATEST_ARTICLES_QUERY } from "./queries";
import type { LatestArticleSummary } from "./types";

const articleRevalidateSeconds = 300;

export async function getLatestArticles(): Promise<LatestArticleSummary[]> {
  if (!sanityClient) return [];

  return sanityClient.fetch<LatestArticleSummary[]>(
    LATEST_ARTICLES_QUERY,
    {},
    { next: { revalidate: articleRevalidateSeconds } },
  );
}
