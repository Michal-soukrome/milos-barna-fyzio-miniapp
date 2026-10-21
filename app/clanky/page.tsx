import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";
import { isSanityConfigured, sanityClient } from "@/sanity/lib/client";
import { ArticleSummary } from "@/sanity/lib/types";
import { ARTICLE_BODY_PARTS } from "@/sanity/lib/article-taxonomy";

export const metadata: Metadata = {
  title: "Zdravotní témata | Miloš Barna",
  description:
    "Srozumitelné informace o častých potížích a možnostech léčby, přehledně podle oblasti těla.",
};

export const revalidate = 300;

type ArticleGroup = {
  key: string;
  label: string;
  articles: ArticleSummary[];
};

export default async function ArticlesPage() {
  const articles =
    sanityClient &&
    (await sanityClient.fetch<ArticleSummary[]>(
      ARTICLES_QUERY,
      {},
      { next: { revalidate } },
    ));
  const articleGroups = Array.isArray(articles)
    ? groupArticlesByBodyPart(articles)
    : [];

  return (
    <Layout>
      <section>
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Zdravotní témata
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Srozumitelné informace o častých potížích a možnostech léčby,
          přehledně podle oblasti těla. Každý zveřejněný článek prošel lékařskou
          kontrolou.
        </p>

        {!isSanityConfigured ? (
          <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
            Témata budou dostupná po připojení Sanity CMS.
          </p>
        ) : articleGroups.length ? (
          <div className="mt-10 space-y-10">
            {articleGroups.map((group) => (
              <section
                key={group.key}
                aria-labelledby={`body-part-${group.key}`}
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2
                    id={`body-part-${group.key}`}
                    className="font-serif-display text-2xl text-slate-800"
                  >
                    {group.label}
                  </h2>
                  <p className="shrink-0 text-sm text-slate-500">
                    {formatArticleCount(group.articles.length)}
                  </p>
                </div>
                <ul className="grid gap-4 md:grid-cols-2">
                  {group.articles.map((article) => (
                    <li key={article._id}>
                      <Link
                        href={`/clanky/${article.slug}`}
                        className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all  hover:border-teal-600 hover:shadow-md"
                      >
                        <p className="text-xs font-semibold text-teal-700">
                          {new Date(article.publishedAt).toLocaleDateString(
                            "cs-CZ",
                          )}
                        </p>
                        <h3 className="font-serif-display mt-2 text-2xl leading-tight text-slate-800 group-hover:text-teal-800">
                          {article.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                          {article.excerpt}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Zatím zde nejsou zveřejněná žádná témata.
          </p>
        )}
      </section>
    </Layout>
  );
}

function groupArticlesByBodyPart(articles: ArticleSummary[]) {
  const groups: ArticleGroup[] = ARTICLE_BODY_PARTS.map(({ value, label }) => ({
    key: value,
    label,
    articles: articles.filter((article) => article.bodyPart === value),
  })).filter((group) => group.articles.length > 0);

  const knownBodyParts = new Set(ARTICLE_BODY_PARTS.map(({ value }) => value));
  const unassignedArticles = articles.filter(
    (article) => !article.bodyPart || !knownBodyParts.has(article.bodyPart),
  );

  if (unassignedArticles.length > 0) {
    groups.push({
      key: "other",
      label: "Další témata",
      articles: unassignedArticles,
    });
  }

  return groups;
}

function formatArticleCount(count: number) {
  const noun = count === 1 ? "článek" : count < 5 ? "články" : "článků";
  return `${count} ${noun}`;
}
