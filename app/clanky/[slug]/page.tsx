import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { notFound } from "next/navigation";
import { ARTICLE_QUERY, ARTICLES_QUERY } from "@/sanity/lib/queries";
import { sanityClient } from "@/sanity/lib/client";
import { ArticleSummary, PublishedArticle } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Článek ordinace | MUDr. Barna Miloš, Ph.D.",
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

  const article = await sanityClient.fetch<PublishedArticle | null>(
    ARTICLE_QUERY,
    { slug },
    { next: { revalidate } },
  );
  if (!article) return notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-teal-700">
          {new Date(article.publishedAt).toLocaleDateString("cs-CZ")}
        </p>
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
          Tento článek poskytuje obecné informace a nenahrazuje osobní lékařské
          vyšetření ani pokyny vašeho lékaře.
        </p>
      </article>
    </main>
  );
}
