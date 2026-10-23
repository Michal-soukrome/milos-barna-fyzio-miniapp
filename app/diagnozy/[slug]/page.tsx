import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AsidePanel from "@/components/AsidePanel";
import Layout from "@/components/Layout";
import MedicalBody from "@/components/MedicalBody";
import { getDiagnosisBySlug, getDiagnoses } from "@/sanity/lib/diagnoses";
import { getDiagnosisCategoryLabel } from "@/sanity/lib/diagnosis-categories";
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

  const categoryLabel = getDiagnosisCategoryLabel(diagnosis.category);

  return (
    <Layout>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article
          aria-labelledby="diagnosis-title"
          className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10"
        >
          {categoryLabel && (
            <p className="text-sm font-semibold text-teal-700">
              {categoryLabel}
            </p>
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
          <AsidePanel aria-labelledby="related-diagnoses-title">
            <h2
              id="related-diagnoses-title"
              className="font-serif-display mt-2 text-2xl text-slate-800"
            >
              Další diagnózy z kategorie{" "}
              <span className="lowercase italic">'{categoryLabel}'</span>
            </h2>
            <ul className="mt-5 divide-y divide-slate-200">
              {diagnosis.relatedDiagnoses.map((relatedDiagnosis) => (
                <li key={relatedDiagnosis._id} className="py-4 first:pt-0">
                  <Link
                    href={`/diagnozy/${relatedDiagnosis.slug}`}
                    className="group block"
                  >
                    <span className="font-serif-display mt-1 block text-lg leading-snug text-slate-800 group-hover:text-teal-800 group-hover:underline">
                      {relatedDiagnosis.title}
                    </span>
                    {relatedDiagnosis.summary && (
                      <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                        {relatedDiagnosis.summary}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/diagnozy"
              className="mt-5 inline-flex text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
            >
              Všechny diagnózy
            </Link>
          </AsidePanel>
        )}
      </div>
    </Layout>
  );
}
