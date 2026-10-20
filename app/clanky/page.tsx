import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";
import { isSanityConfigured, sanityClient } from "@/sanity/lib/client";
import { ArticleSummary } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Články ordinace | MUDr. Barna Miloš, Ph.D.",
  description: "Odborně zkontrolované články a příprava na léčbu.",
};

export const revalidate = 300;

export default async function ArticlesPage() {
  const articles =
    sanityClient &&
    (await sanityClient.fetch<ArticleSummary[]>(
      ARTICLES_QUERY,
      {},
      { next: { revalidate } },
    ));

  return (
    <Layout>
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          Pacientské informace
        </p>
        <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800">
          Články
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Delší články připravuje ordinace a před zveřejněním je lékařsky
          kontroluje.
        </p>

        {!isSanityConfigured ? (
          <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
            Články budou dostupné po připojení Sanity CMS.
          </p>
        ) : articles?.length ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <li key={article._id}>
                <Link
                  href={`/clanky/${article.slug}`}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md"
                >
                  <p className="text-xs font-semibold text-teal-700">
                    {new Date(article.publishedAt).toLocaleDateString("cs-CZ")}
                  </p>
                  <h2 className="font-serif-display mt-2 text-2xl leading-tight text-slate-800 group-hover:text-teal-800">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {article.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Zatím zde nejsou zveřejněné žádné články.
          </p>
        )}
      </section>
    </Layout>
  );
}
