import type { PortableTextBlock } from "@portabletext/types";

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
