import Link from "next/link";
import { topics } from "@/lib/content";

export default function ConfiguratorPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Začít
        </p>
        <h1 className="font-serif-display mt-2 text-4xl leading-tight text-blue-800">
          Vyberte téma, které se vás týká
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300">
          Projdeme spolu několik krátkých otázek a zobrazíme vám relevantní
          informace.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/t/${topic.slug}`}
                className="group flex min-h-36 flex-col rounded-2xl border border-gray-600 bg-white p-5 shadow-[0_8px_24px_rgba(18,50,71,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-[0_14px_30px_rgba(8,126,139,0.12)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-200 px-2.5 py-1 text-xs font-bold text-blue-400">
                    {topic.bodyPart}
                  </span>
                  <span className="text-lg text-blue-600 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <span className="font-serif-display text-xl leading-tight text-blue-800">
                  {topic.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-gray-300">
                  {topic.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
