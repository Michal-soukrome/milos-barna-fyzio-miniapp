import Link from "next/link";
import { topics } from "@/lib/content";
import TopicMatcher from "@/components/TopicMatcher";

export default function ConfiguratorPage() {
  return (
    <main className="min-h-screen">
      <div className="dashboard-grid mx-auto max-w-7xl gap-8 px-5 py-7 sm:px-8 sm:py-10">
        <aside className="mb-7 sm:mb-0">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Pacientský průvodce
            </p>
            <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
              Najděte správný materiál
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Vyberte téma podle popisu nebo procházejte materiály ručně.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Další možnosti
            </p>
            <nav aria-label="Možnosti ordinace" className="flex flex-col gap-2">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800"
              >
                Knihovna materiálů
              </Link>
              <Link
                href="/contact"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800"
              >
                Kontaktovat ordinaci
              </Link>
            </nav>
          </div>
        </aside>

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Začít
          </p>
          <h2 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800">
            Vyberte téma, které se vás týká
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
            Vybereme materiál, který odpovídá vašemu popisu. Průvodce zobrazuje
            pouze předem připravené informace ordinace.
          </p>

          <TopicMatcher />

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Nebo vyberte ručně
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/t/${topic.slug}`}
                  className="group flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                      {topic.bodyPart}
                    </span>
                    <span className="text-lg text-teal-700 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <span className="font-serif-display text-xl leading-tight text-slate-800">
                    {topic.title}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-slate-500">
                    {topic.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
