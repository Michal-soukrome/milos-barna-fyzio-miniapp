import type { Metadata } from "next";
import Image from "next/image";
import PageContainer from "@/components/PageContainer";
import { Timeline, type TimelineItem } from "@/components/Timeline";

export const metadata: Metadata = {
  title: "O mně | Miloš Barna",
  description:
    "Jsem Miloš Barna, lékař. Přečtěte si, jak vám mohu pomoci před zákrokem i po něm.",
};

const careSections = [
  {
    title: "Před zákrokem",
    text: "Pomohu vám zorientovat se v tom, co vás čeká. Na webu najdete praktické informace a pokyny, ke kterým se můžete vrátit.",
  },
  {
    title: "Po zákroku",
    text: "Rady a tipy můžete mít po ruce i doma. Pokud se informace na webu liší od toho, co jsme probrali osobně, řiďte se naším domluveným postupem.",
  },
];

// TODO: nahraďte zástupné údaje skutečnými. Řaďte od nejnovějšího.
const timeline: TimelineItem[] = [
  {
    years: "2018–dosud",
    kind: "Praxe",
    title: "[Pozice / obor]",
    place: "[Pracoviště, město]",
    note: "[Krátký popis náplně práce, volitelné.]",
  },
  {
    years: "2016",
    kind: "Akreditace",
    title: "[Název akreditace nebo specializační zkoušky]",
    place: "[Vydávající instituce]",
  },
  {
    years: "2014",
    kind: "Certifikát",
    title: "[Název certifikátu / kurzu]",
    place: "[Vydávající instituce]",
  },
  {
    years: "2011–2014",
    kind: "Vzdělání",
    title: "Ph.D. – [studijní obor]",
    place: "[Univerzita, fakulta]",
  },
  {
    years: "2005–2011",
    kind: "Vzdělání",
    title: "MUDr. – Všeobecné lékařství",
    place: "[Univerzita, fakulta]",
  },
];

export default function AboutPage() {
  return (
    <PageContainer>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr] md:items-center">
          <Image
            src="/milos/milos_barna_ml.jpeg"
            alt="Miloš Barna"
            width={426}
            height={640}
            priority
            className="h-auto w-full rounded-2xl object-cover"
          />
          <div>
            <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800 sm:text-5xl">
              MUDr. Barna Miloš, Ph.D.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Jsem lékař a pomáhám lidem zorientovat se v péči před zákrokem i
              po něm. Záleží mi na tom, abyste věděli, co vás čeká a kam se
              obrátit, když potřebujete další informace.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {careSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="font-serif-display text-xl text-slate-800">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="font-serif-display text-2xl text-slate-800 sm:text-3xl">
            Vzdělání a praxe
          </h2>
          <Timeline items={timeline} />
        </div>
      </section>
    </PageContainer>
  );
}