import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "Úvod | MUDr. Barna Miloš, Ph.D.",
  description:
    "Profesní profil, informace o ordinaci a pacientské materiály MUDr. Barna Miloš, Ph.D.",
};

const destinations = [
  {
    href: "/o-lekari",
    eyebrow: "Profesní profil",
    title: "O lékaři",
    description:
      "Představení lékaře, jeho odborné zaměření a profesní zkušenosti.",
  },
  {
    href: "/navody",
    eyebrow: "Návody",
    title: "Pacientské materiály",
    description: "Prohlédněte si témata a vyberte si materiál, který hledáte.",
  },
  {
    href: "/pruvodce",
    eyebrow: "Průvodce",
    title: "Najít správné téma",
    description:
      "Popište, co vás zajímá, nebo vyberte téma z připraveného přehledu.",
  },
  {
    href: "/clanky",
    eyebrow: "Články",
    title: "Informace o léčbě",
    description: "Delší články připravované ordinací a určené pacientům.",
  },
  {
    href: "/kontakt",
    eyebrow: "Kontakt",
    title: "Kontaktujte ordinaci",
    description: "Získejte kontaktní informace a možnosti spojení s ordinací.",
  },
];

export default function HomePage() {
  return (
    <Layout>
      <section className="overflow-hidden rounded-3xl bg-teal-900 text-white">
        <div className="grid items-end md:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <div className="px-6 pt-10 sm:px-10 sm:pt-14 md:self-center md:py-16 lg:px-14 lg:py-20">
            <h1 className="font-serif-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              <span className="block text-2xl text-teal-200 sm:text-3xl">
                MUDr.
              </span>
              Miloš Barna
              <span className="block text-2xl text-teal-200 sm:text-3xl">
                Ph.D.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-teal-50">
              Profesní informace, přehled ordinace a pacientské materiály na
              jednom místě.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/kontakt"
                className="inline-flex min-h-11 items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Kontakt
              </Link>
              <Link
                href="/o-lekari"
                className="inline-flex min-h-11 items-center rounded-xl border border-teal-300/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                O lékaři
              </Link>
              <a
                href="https://www.barnamedical.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-bold text-teal-100 underline decoration-teal-400 underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Web Barna Medical
                <span aria-hidden="true" className="ml-1">
                  ↗
                </span>
              </a>
            </div>
          </div>

          {/* Arched portrait, sitting flush on the bottom edge of the panel */}
          <div className="px-6 pt-10 sm:px-10 md:px-0 md:pr-10 md:pt-12 lg:pr-14">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[999px] bg-teal-800 ring-1 ring-inset ring-teal-300/30">
              <Image
                src="/milos/milos_barna_ml.jpeg"
                alt="Portrét MUDr. Barna Miloš, Ph.D."
                fill
                priority
                sizes="(max-width: 768px) 80vw, 30vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Vyberte, co hledáte
          </p>
          <h2 className="font-serif-display mt-2 text-3xl text-slate-800">
            Informace pro pacienty i návštěvníky
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {destinations.map((destination) => (
            <li key={destination.href}>
              <Link
                href={destination.href}
                className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md group"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                  {destination.eyebrow}
                </p>
                <h3 className="font-serif-display mt-2 text-2xl text-slate-800 group-hover:text-teal-800">
                  {destination.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {destination.description}
                </p>
                <span className="mt-4 inline-block text-sm font-bold text-teal-800 group-hover:underline">
                  Otevřít →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
          Barna Medical · Praha
        </p>
        <h2 className="font-serif-display mt-2 text-2xl text-slate-800">
          Léčba a operační péče
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
          Pokud se chystáte na léčbu nebo zákrok v Barna Medical, informace o
          klinice a její péči najdete na jejím hlavním webu.
        </p>
        <a
          href="https://www.barnamedical.cz/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-900"
        >
          Informace na webu Barna Medical
          <span aria-hidden="true" className="ml-2">
            ↗
          </span>
        </a>
      </section>
    </Layout>
  );
}
