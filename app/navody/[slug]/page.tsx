import { notFound } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import PatientGuideBody from "@/components/PatientGuideBody";
import {
  getPatientGuideBySlug,
  getPatientGuides,
} from "@/sanity/lib/patient-guides";

export const metadata = {
  title: "Pokyny pro pacienty | MUDr. Barna Miloš, Ph.D.",
};

export const revalidate = 300;

export async function generateStaticParams() {
  const topics = await getPatientGuides();
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getPatientGuideBySlug(slug);
  if (!topic) return notFound();

  const followUpLink =
    topic.slug === "post-op-wound-care"
      ? {
          href: "https://www.barnamedical.cz/kontakt",
          label: "Kontaktovat Barna Medical",
        }
      : {
          href: "https://www.barnamedical.cz/sluzby/lecba/rehabilitace-po-urazech-a-operaci",
          label: "Rehabilitace po úrazech a operaci",
        };

  return (
    <Layout>
      <article
        aria-labelledby="guide-title"
        className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10"
      >
        {topic.isDemo && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"
          >
            Ukázkový obsah: pokyny a varovné příznaky nejsou dokončené ani
            určené pro klinické použití. Před použitím je musí ověřit lékař.
          </div>
        )}
        <div className="mb-1 text-sm text-slate-500">{topic.bodyPart}</div>
        <h1
          id="guide-title"
          className="font-serif-display text-3xl leading-tight"
        >
          {topic.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          {topic.summary}
        </p>

        {!topic.isDemo && topic.warningSigns.length > 0 && (
          <aside className="mt-8 rounded-xl border border-rose-300 bg-rose-50 p-5 text-rose-950">
            <h2 className="font-serif-display text-xl">
              Kdy kontaktovat ordinaci
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Pokud se vás týká některý z těchto varovných příznaků, kontaktujte
              ordinaci a nespoléhejte se pouze na tyto obecné pokyny.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed">
              {topic.warningSigns.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                className="inline-flex min-h-11 items-center rounded-xl bg-rose-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-900"
              >
                Kontaktovat ordinaci
              </Link>
              <a
                href={followUpLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-rose-400 px-4 py-2.5 text-sm font-semibold text-rose-950 transition-colors hover:bg-white"
              >
                {followUpLink.label} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </aside>
        )}

        <PatientGuideBody body={topic.body} legacySections={topic.sections} />

        <p className="mt-6 text-xs text-slate-500">
          Tato stránka poskytuje pouze obecné informace a nenahrazuje osobní
          lékařské vyšetření. Pokud se cokoli neshoduje s tím, co vám bylo
          řečeno osobně, řiďte se pokyny svého lékaře a s dotazy se obraťte na
          ordinaci.
        </p>
      </article>
    </Layout>
  );
}
