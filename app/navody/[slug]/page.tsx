import { notFound } from "next/navigation";
import { getTopicBySlug, topics } from "@/lib/content";
import PatientConfigurator from "@/components/PatientConfigurator";

export const metadata = {
  title: "Pacientský průvodce | MUDr. Barna Miloš, Ph.D.",
};

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return notFound();

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <div
        role="status"
        className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"
      >
        Ukázkový obsah: pokyny a varovné příznaky nejsou dokončené ani určené
        pro klinické použití. Před zveřejněním je musí ověřit lékař.
      </div>
      <div className="mb-1 text-sm text-slate-500">{topic.bodyPart}</div>
      <h1 className="font-serif-display text-3xl leading-tight">
        {topic.title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
        Odpovězte na několik krátkých otázek a zobrazíme vám informace, které se
        vás týkají.
      </p>

      <PatientConfigurator topic={topic} />

      <p className="mt-6 text-xs text-slate-500">
        Tato stránka poskytuje pouze obecné informace a nenahrazuje osobní
        lékařské vyšetření. Pokud se cokoli neshoduje s tím, co vám bylo řečeno
        osobně, řiďte se pokyny svého lékaře a s dotazy se obraťte na ordinaci.
      </p>
    </main>
  );
}
