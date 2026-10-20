import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O lékaři | MUDr. Barna Miloš, Ph.D.",
  description: "Profesní profil MUDr. Barna Miloš, Ph.D.",
};

const profileSections = [
  {
    title: "Profesní medailon",
    text: "[Doplnit profesní medailon MUDr. Barna Miloš, Ph.D.]",
  },
  {
    title: "Odborné zaměření a služby",
    text: "[Doplnit ověřené specializace a nabízené služby.]",
  },
  {
    title: "Vzdělání a profesní zkušenosti",
    text: "[Doplnit ověřené vzdělání, praxi a profesní zkušenosti.]",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr] md:items-center">
          <Image
            src="/milos/milos_barna_ml.jpeg"
            alt="Portrét MUDr. Barna Miloš, Ph.D."
            width={426}
            height={640}
            priority
            className="h-auto w-full rounded-2xl object-cover"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Profesní profil
            </p>
            <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800 sm:text-5xl">
              MUDr. Barna Miloš, Ph.D.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              [Doplnit krátké představení lékaře. Uvést pouze ověřené profesní
              informace.]
            </p>
            <Link
              href="/pruvodce"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              Pacientské materiály
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {profileSections.map((section) => (
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
              Kontakt a další informace
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              [Doplnit veřejné kontaktní údaje a odkazy na profesní profily.]
            </p>
            <Link
              href="/kontakt"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
            >
              Kontaktní údaje
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
