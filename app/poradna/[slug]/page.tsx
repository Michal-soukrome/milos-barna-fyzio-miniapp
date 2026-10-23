import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AsidePanel from "@/components/AsidePanel";
import PageContainer from "@/components/PageContainer";
import PatientGuideBody from "@/components/PatientGuideBody";
import GuideShareButton from "@/components/GuideShareButton";
import {
  getPatientGuideBySlug,
  getPatientGuideSummaries,
} from "@/sanity/lib/patient-guides";
import { normalizePatientGuideText } from "@/sanity/lib/patient-guide-text";
import type { PatientGuideSummary } from "@/sanity/lib/types";

export const metadata = {
  title: "Pokyny pro pacienty | MUDr. Barna Miloš, Ph.D.",
};

export const revalidate = 300;

export async function generateStaticParams() {
  const topics = await getPatientGuideSummaries();
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default async function PatientGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, topics] = await Promise.all([
    getPatientGuideBySlug(slug),
    getPatientGuideSummaries(),
  ]);
  if (!topic) return notFound();
  const relatedGuides = getRelatedGuides(topic, topics);

  const followUpLink =
    topic.slug === "post-op-wound-care"
      ? {
          href: "https://www.barnamedical.cz/kontakt/?utm_source=mudrbarna.cz&utm_medium=referral&utm_campaign=poradna",
          label: "Kontaktovat Barna Medical",
        }
      : {
          href: "https://www.barnamedical.cz/sluzby/lecba/rehabilitace-po-urazech-a-operaci?utm_source=mudrbarna.cz&utm_medium=referral&utm_campaign=poradna",
          label: "Rehabilitace po úrazech a operaci",
        };

  return (
    <PageContainer>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article
          aria-labelledby={`poradna-detail-${slug}`}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10 h-fit"
        >
          <span className="mb-1 text-xs font-semibold text-teal-700">
            {topic.bodyPart}
          </span>
          <h1
            id={`poradna-detail-${slug}`}
            className="font-serif-display text-3xl leading-tight"
          >
            {topic.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {topic.summary}
          </p>

          {topic.warningSigns.length > 0 && (
            <aside className="mt-8 rounded-xl border border-rose-300 bg-rose-50 p-5 text-rose-950">
              <h2 className="font-serif-display text-xl">
                Kdy kontaktovat lékaře?
              </h2>
              <p className="mt-2 text-sm leading-relaxed">
                Pokud se vás týká některý z těchto varovných příznaků,
                kontaktujte svého lékaře a nespoléhejte se pouze na tyto obecné
                pokyny.
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed">
                {topic.warningSigns.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={followUpLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-xl border border-rose-400 px-4 py-2.5 text-sm font-semibold text-rose-950 transition-colors hover:bg-white"
                >
                  {followUpLink.label}
                  <ExternalLink aria-hidden="true" className="ml-1 h-4 w-4" />
                </a>
              </div>
            </aside>
          )}

          <PatientGuideBody body={topic.body} legacySections={topic.sections} />

          <p className="mt-6 text-xs text-slate-500">
            Tato stránka poskytuje pouze obecné informace a nenahrazuje osobní
            lékařské vyšetření. Pokud se cokoli neshoduje s tím, co vám bylo
            řečeno osobně a řiďte se pokyny svého lékaře.
          </p>
          <div className="mt-5">
            <GuideShareButton topic={topic} />
          </div>
        </article>

        {relatedGuides.length > 0 && (
          <AsidePanel aria-labelledby="related-guides-title">
            <h2
              id="related-guides-title"
              className="font-serif-display mt-2 text-2xl text-slate-800"
            >
              Související
            </h2>

            <ul className="mt-5 divide-y divide-slate-200">
              {relatedGuides.map((relatedGuide) => (
                <li key={relatedGuide._id} className="py-4 first:pt-0">
                  <Link
                    href={`/poradna/${relatedGuide.slug}`}
                    className="group block"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-teal-700">
                        {relatedGuide.bodyPart}
                      </span>
                    </span>
                    <span className="font-serif-display mt-1 block text-lg leading-snug text-slate-800 group-hover:text-teal-800 group-hover:underline">
                      {relatedGuide.title}
                    </span>

                    <span className="mt-2 block min-w-0 truncate text-sm leading-relaxed text-slate-600">
                      {relatedGuide.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/poradna"
              className="mt-5 inline-flex text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
            >
              Všechny rady a tipy
            </Link>
          </AsidePanel>
        )}
      </div>
    </PageContainer>
  );
}

function getRelatedGuides(
  topic: PatientGuideSummary,
  topics: PatientGuideSummary[],
) {
  const currentSymptoms = new Set(
    topic.symptoms.map(normalizePatientGuideText).filter(Boolean),
  );

  return topics
    .filter((candidate) => candidate.slug !== topic.slug)
    .map((candidate, index) => ({
      guide: candidate,
      index,
      sharedSymptomCount: [
        ...new Set(
          candidate.symptoms.map(normalizePatientGuideText).filter(Boolean),
        ),
      ].filter((symptom) => currentSymptoms.has(symptom)).length,
      sharedAgeGroupCount: candidate.ageGroups.filter((ageGroup) =>
        topic.ageGroups.includes(ageGroup),
      ).length,
      sameBodyPart:
        normalizePatientGuideText(candidate.bodyPart) ===
        normalizePatientGuideText(topic.bodyPart),
    }))
    .filter(
      (candidate) => candidate.sharedSymptomCount > 0 || candidate.sameBodyPart,
    )
    .sort(
      (a, b) =>
        b.sharedSymptomCount - a.sharedSymptomCount ||
        Number(b.sameBodyPart) - Number(a.sameBodyPart) ||
        b.sharedAgeGroupCount - a.sharedAgeGroupCount ||
        a.index - b.index,
    )
    .slice(0, 3)
    .map(({ guide }) => guide);
}
