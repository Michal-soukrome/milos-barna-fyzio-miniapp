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
    href: "/ordinace",
    eyebrow: "Knihovna ordinace",
    title: "Pacientské materiály",
    description:
      "Prohlédněte si témata a vyberte si materiál, který hledáte.",
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
    description:
      "Delší články připravované ordinací a určené pacientům.",
  },
  {
    href: "/kontakt",
    eyebrow: "Kontakt",
    title: "Kontaktujte ordinaci",
    description:
      "Získejte kontaktní informace a možnosti spojení s ordinací.",
  },
];

export default function HomePage() {
  return (
    <Layout>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Vítejte
            </p>
            <h1 className="font-serif-display mt-3 text-4xl leading-tight text-slate-800 sm:text-5xl">
              MUDr. Barna Miloš, Ph.D.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Profesní informace, přehled ordinace a pacientské materiály na
              jednom místě.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/o-lekari"
                className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800"
              >
                O lékaři
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800"
              >
                Kontakt
              </Link>
              <a
                href="https://www.barnamedical.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800"
              >
                Web Barna Medical <span aria-hidden="true" className="ml-1">↗</span>
              </a>
            </div>
          </div>
          <div className="relative min-h-72 bg-teal-50 md:min-h-full">
            <Image
              src="/milos/milos_barna_ml.jpeg"
              alt="Portrét MUDr. Barna Miloš, Ph.D."
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
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
                className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md"
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
                <span className="mt-4 inline-block text-sm font-bold text-teal-800">
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
          <span aria-hidden="true" className="ml-2">↗</span>
        </a>
      </section>
    </Layout>
  );
}
