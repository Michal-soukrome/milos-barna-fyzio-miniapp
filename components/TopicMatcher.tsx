"use client";

import Link from "next/link";
import { useState } from "react";

type MatchResponse = {
  topic: {
    slug: string;
    title: string;
    bodyPart: string;
    summary: string;
  };
  reason: string;
  source: "ai" | "local";
};

export default function TopicMatcher() {
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  async function findTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsMatching(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Téma se nepodařilo najít.");
        return;
      }

      setResult(data);
    } catch {
      setError("Nepodařilo se spojit se serverem. Zkuste to prosím znovu.");
    } finally {
      setIsMatching(false);
    }
  }

  return (
    <section className="mb-10 rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
            Doporučeno
          </p>
          <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
            Popište, co vás trápí
          </h2>
        </div>
        <span className="rounded-full border border-teal-300 px-2.5 py-1 text-xs font-bold text-teal-800">
          AI pomocník
        </span>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
        Z vašeho popisu vybereme nejvhodnější téma z materiálů schválených
        ordinací. AI pouze doporučuje existující stránku a nevytváří zdravotní
        rady.
      </p>

      <form onSubmit={findTopic} className="mt-5">
        <label htmlFor="patient-situation" className="sr-only">
          Popište svou situaci
        </label>
        <textarea
          id="patient-situation"
          value={situation}
          onChange={(event) => setSituation(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Například: moje dítě má sádru a svědí ho to"
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">
            Bez diagnóz a bez nových rad od AI.
          </span>
          <button
            type="submit"
            disabled={isMatching || !situation.trim()}
            className="min-h-11 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isMatching ? "Hledám téma…" : "Doporučit téma"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-slate-800"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-xl border border-teal-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Doporučené téma
          </p>
          <h3 className="font-serif-display mt-1 text-xl text-slate-800">
            {result.topic.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{result.topic.summary}</p>
          <p className="mt-3 text-xs text-slate-500">{result.reason}</p>
          <Link
            href={`/t/${result.topic.slug}`}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800"
          >
            Otevřít průvodce
          </Link>
        </div>
      )}
    </section>
  );
}
