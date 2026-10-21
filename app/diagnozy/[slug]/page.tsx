import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Layout from "@/components/Layout";
import MedicalBody from "@/components/MedicalBody";
import { getDiagnosisBySlug, getDiagnoses } from "@/sanity/lib/diagnoses";
import { getArticleBodyPartLabel } from "@/sanity/lib/article-taxonomy";
import { sanityClient } from "@/sanity/lib/client";
import type { DiagnosisSummary } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Diagnóza | Miloš Barna",
};

export const revalidate = 300;

export async function generateStaticParams() {
  if (!sanityClient) return [];

  const diagnoses = await getDiagnoses();
  return diagnoses.map((diagnosis) => ({ slug: diagnosis.slug }));
}

export default async function DiagnosisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const diagnosis = await getDiagnosisBySlug(slug);
  if (!diagnosis) return notFound();

  const bodyPartLabel = getArticleBodyPartLabel(diagnosis.bodyPart);

  return (
    <Layout>
      <article
        aria-labelledby="diagnosis-title"
        className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10"
      >
        {bodyPartLabel && (
          <p className="text-sm font-semibold text-teal-700">{bodyPartLabel}</p>
        )}
        <h1
          id="diagnosis-title"
          className="font-serif-display mt-2 text-4xl leading-tight text-slate-800"
        >
          {diagnosis.title}
        </h1>
        {diagnosis.summary ? (
          <p className="mt-4 border-b border-slate-200 pb-6 text-lg leading-relaxed text-slate-600">
            {diagnosis.summary}
          </p>
        ) : (
          <p className="mt-4 border-b border-slate-200 pb-6 text-sm leading-relaxed text-slate-500">
            Podrobnější informace k této diagnóze budou doplněny.
          </p>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Odborně zkontroloval MUDr. Miloš Barna.
        </p>
        <div className="mt-8">
          <MedicalBody body={diagnosis.body} />
        </div>
        <p className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          Tyto informace mají obecný charakter a nenahrazují osobní lékařské
          vyšetření ani doporučení vašeho lékaře. Konkrétní léčbu vždy
          konzultujte s odborníkem.
        </p>
      </article>
      {diagnosis.relatedDiagnoses.length > 0 && (
        <section
          aria-labelledby="related-diagnoses-title"
          className="mx-auto mt-8 w-full max-w-4xl"
        >
          <h2
            id="related-diagnoses-title"
            className="font-serif-display text-2xl text-slate-800"
          >
            Další diagnózy ze stejné oblasti
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {diagnosis.relatedDiagnoses.map((relatedDiagnosis) => (
              <li key={relatedDiagnosis._id}>
                <Link
                  href={`/diagnozy/${relatedDiagnosis.slug}`}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-600 hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-teal-700">
                    {getArticleBodyPartLabel(relatedDiagnosis.bodyPart)}
                  </span>
                  <span className="font-serif-display mt-1 block text-xl leading-tight text-slate-800 group-hover:text-teal-800 group-hover:underline">
                    {relatedDiagnosis.title}
                  </span>
                  {relatedDiagnosis.summary && (
                    <span className="mt-3 block text-sm leading-relaxed text-slate-600">
                      {relatedDiagnosis.summary}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  );
}
