import { notFound } from "next/navigation";
import PatientConfigurator from "@/components/PatientConfigurator";
import Layout from "@/components/Layout";
import {
  getPatientGuideBySlug,
  getPatientGuides,
} from "@/sanity/lib/patient-guides";

export const metadata = {
  title: "Pacientský průvodce | MUDr. Barna Miloš, Ph.D.",
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

  return (
    <Layout>
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
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
        <h1 className="font-serif-display text-3xl leading-tight">
          {topic.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          Odpovězte na několik krátkých otázek a zobrazíme vám informace, které
          se vás týkají.
        </p>

        <PatientConfigurator topic={topic} />

        <p className="mt-6 text-xs text-slate-500">
          Tato stránka poskytuje pouze obecné informace a nenahrazuje osobní
          lékařské vyšetření. Pokud se cokoli neshoduje s tím, co vám bylo
          řečeno osobně, řiďte se pokyny svého lékaře a s dotazy se obraťte na
          ordinaci.
        </p>
      </section>
    </Layout>
  );
}
