import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";

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
    text: "Pokyny a cvičení můžete mít po ruce i doma. Pokud se informace na webu liší od toho, co jsme probrali osobně, řiďte se naším domluveným postupem.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              O mně
            </p>
            <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800 sm:text-5xl">
              Miloš Barna
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Jsem lékař a pomáhám lidem zorientovat se v péči před zákrokem i
              po něm. Záleží mi na tom, abyste věděli, co vás čeká a kam se
              obrátit, když potřebujete další informace.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Na tomto webu sdílím praktické pokyny, cvičení a články, ke
              kterým se můžete vrátit, kdykoli je potřebujete.
            </p>
            <Link
              href="/navody"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              Najít pokyny
            </Link>
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
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-serif-display text-xl text-slate-800">
              Jak se mnou zůstat v kontaktu
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pokud máte otázku k péči nebo pokynům, obraťte se na mě nebo na
              ordinaci.
            </p>
            <Link
              href="/kontakt"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              Kontakt
            </Link>
          </section>
        </div>
      </section>
    </Layout>
  );
}
