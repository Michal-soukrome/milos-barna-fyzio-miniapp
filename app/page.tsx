import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "Miloš Barna | Srozumitelně před zákrokem i po něm",
  description:
    "Jsem lékař Miloš Barna. Sdílím srozumitelné informace a praktické pokyny, které vám pomohou před zákrokem i po něm.",
};

const destinations = [
  {
    href: "/o-lekari",
    eyebrow: "Moje práce",
    title: "O mně",
    description: "Proč připravuji tyto informace a jak vám mohou pomoci.",
  },
  {
    href: "/navody",
    eyebrow: "Před zákrokem i po něm",
    title: "Najít pokyny",
    description:
      "Vyhledejte návod nebo cvičení podle své situace. Odkaz či QR kód ode mě vás zavede přímo ke konkrétním pokynům.",
  },
  {
    href: "/clanky",
    eyebrow: "Lépe se zorientovat",
    title: "Zdravotní témata",
    description:
      "Srozumitelné informace o častých potížích a možnostech léčby, přehledně podle oblasti těla.",
  },
  {
    href: "/kontakt",
    eyebrow: "Kontakt",
    title: "Kontakt",
    description: "Najděte kontaktní údaje a možnosti, jak se na mě obrátit.",
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
              Jsem lékař a pomáhám pacientům zorientovat se před zákrokem i po
              něm. Tady najdete srozumitelné informace a praktické pokyny, ke
              kterým se můžete vrátit, kdykoli je potřebujete.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/navody"
                className="inline-flex min-h-11 items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Najít pokyny
              </Link>
              <Link
                href="/o-lekari"
                className="inline-flex min-h-11 items-center rounded-xl border border-teal-300/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                O mně
              </Link>
            </div>
          </div>

          {/* Arched portrait, sitting flush on the bottom edge of the panel */}
          <div className="px-6 pt-10 sm:px-10 md:px-0 md:pr-10 md:pt-12 lg:pr-14">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[999px] bg-teal-800 ring-1 ring-inset ring-teal-300/30">
              <Image
                src="/milosek/milosek_barna_ml.jpeg"
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

      <div className="space-y-6">
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="font-serif-display mt-2 text-3xl text-slate-800">
              Jak vám mohu pomoci
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {destinations.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all  hover:border-teal-600 hover:shadow-md group"
                >
                  <p className="!hidden text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                    {destination.eyebrow}
                  </p>
                  <h3 className="font-serif-display mt-2 text-2xl text-slate-800 group-hover:text-teal-800">
                    {destination.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {destination.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 group-hover:underline">
                    Otevřít
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
          <h2 className="font-serif-display mt-2 text-2xl text-slate-800">
            Péče v Barna Medical
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Pokud se připravujete na léčbu nebo zákrok v Barna Medical, aktuální
            informace o klinice najdete na jejím webu. Praktické pokyny, které
            vám posílám, otevřete přímo přes odkaz nebo QR kód.
          </p>
          <a
            href="https://www.barnamedical.cz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-900"
          >
            Web Barna Medical
            <ExternalLink aria-hidden="true" className="ml-2 h-4 w-4" />
          </a>
        </section>
      </div>
    </Layout>
  );
}
