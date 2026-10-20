import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ARTICLE_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";
import { sanityClient } from "@/sanity/lib/client";
import { ArticleSummary, PublishedArticle } from "@/sanity/lib/types";
import { getArticleBodyPartLabel } from "@/sanity/lib/article-taxonomy";

export const metadata: Metadata = {
  title: "Zdravotní téma | Miloš Barna",
};

export const revalidate = 300;

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 leading-8 text-slate-700">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif-display mb-3 mt-8 text-2xl text-slate-800">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-lg font-bold text-slate-800">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-5 border-l-4 border-teal-600 pl-4 italic text-slate-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700">
        {children}
      </ol>
    ),
  },
};

export async function generateStaticParams() {
  if (!sanityClient) return [];

  const articles = await sanityClient.fetch<ArticleSummary[]>(
    ARTICLES_QUERY,
    {},
    { next: { revalidate } },
  );
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!sanityClient) return notFound();

  const [article, articles] = await Promise.all([
    sanityClient.fetch<PublishedArticle | null>(
      ARTICLE_QUERY,
      { slug },
      { next: { revalidate } },
    ),
    sanityClient.fetch<ArticleSummary[]>(
      ARTICLES_QUERY,
      {},
      { next: { revalidate } },
    ),
  ]);
  if (!article) return notFound();

  const relatedArticles = getRelatedArticles(article, articles);

  return (
    <Layout>
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {getArticleBodyPartLabel(article.bodyPart) && (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                {getArticleBodyPartLabel(article.bodyPart)}
              </span>
            )}
            <time
              dateTime={article.publishedAt}
              className="text-sm font-semibold text-teal-700"
            >
              {new Date(article.publishedAt).toLocaleDateString("cs-CZ")}
            </time>
          </div>
          <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800">
            {article.title}
          </h1>
          <p className="mt-4 border-b border-slate-200 pb-6 text-lg leading-relaxed text-slate-600">
            {article.excerpt}
          </p>
          <div className="mt-8">
            <PortableText
              value={article.body}
              components={portableTextComponents}
            />
          </div>
          <p className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            Tyto informace nenahrazují osobní
            lékařské vyšetření ani pokyny vašeho lékaře.
          </p>
        </article>

        <aside
          aria-label={relatedArticles.title}
          className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Pro další čtení
          </p>
          <h2 className="font-serif-display mt-2 text-2xl text-slate-800">
            {relatedArticles.title}
          </h2>

          {relatedArticles.articles.length > 0 ? (
            <ul className="mt-5 divide-y divide-slate-200">
              {relatedArticles.articles.map((relatedArticle) => (
                <li key={relatedArticle._id} className="py-4 first:pt-0">
                  <Link
                    href={`/clanky/${relatedArticle.slug}`}
                    className="group block"
                  >
                    <span className="text-xs font-semibold text-teal-700">
                      {new Date(relatedArticle.publishedAt).toLocaleDateString(
                        "cs-CZ",
                      )}
                    </span>
                    <span className="font-serif-display mt-1 block text-lg leading-snug text-slate-800 group-hover:text-teal-800">
                      {relatedArticle.title}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                      {relatedArticle.excerpt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Další témata se zobrazí po jejich odborné kontrole a zveřejnění.
            </p>
          )}

          <Link
            href="/clanky"
            className="mt-5 inline-flex text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
          >
            Všechna témata
          </Link>
        </aside>
      </div>
    </Layout>
  );
}

function getRelatedArticles(
  article: PublishedArticle,
  articles: ArticleSummary[],
): { title: string; articles: ArticleSummary[] } {
  const currentCategories = new Set(
    (article.categories ?? []).map((category) =>
      normalizeCategory(category),
    ),
  );
  const candidates = articles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate, index) => ({
      article: candidate,
      index,
      sharedCategoryCount: (candidate.categories ?? []).filter((category) =>
        currentCategories.has(normalizeCategory(category)),
      ).length,
      sameBodyPart:
        Boolean(article.bodyPart) && candidate.bodyPart === article.bodyPart,
    }));
  const matching = candidates
    .filter(
      (candidate) => candidate.sharedCategoryCount > 0 || candidate.sameBodyPart,
    )
    .sort(
      (a, b) =>
        b.sharedCategoryCount - a.sharedCategoryCount ||
        Number(b.sameBodyPart) - Number(a.sameBodyPart) ||
        a.index - b.index,
    );

  if (matching.length > 0) {
    return {
      title: "Související témata",
      articles: matching.slice(0, 3).map(({ article: related }) => related),
    };
  }

  return {
    title: "Další témata",
    articles: candidates
      .slice(0, 3)
      .map(({ article: related }) => related),
  };
}

function normalizeCategory(category: string) {
  return category.trim().toLocaleLowerCase("cs-CZ");
}
