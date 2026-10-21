"use client";

import Link from "next/link";
import { useState } from "react";
import type { PatientGuideSummary } from "@/sanity/lib/types";
import { findMatchingPatientGuide } from "@/sanity/lib/patient-guide-text";

export default function TopicMatcher({
  topics,
}: {
  topics: PatientGuideSummary[];
}) {
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<PatientGuideSummary | null>(null);
  const [error, setError] = useState("");

  function findTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const match = findMatchingPatientGuide(situation, topics);

    if (!match) {
      setResult(null);
      setError(
        "Nenašli jsme vhodné téma. Zkuste popis upřesnit nebo vyberte téma ručně.",
      );
      return;
    }

    setResult(match);
  }

  return (
    <section className="mb-10 rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
            Napište, co hledáte
          </h2>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Popište téma nebo situaci a najdeme související návod. Text se zpracuje
        pouze ve vašem prohlížeči a neodesílá se na server ani do externí AI
        služby. Nástroj pouze doporučí existující materiál a nevytváří
        zdravotní rady. Neuvádějte jméno ani jiné údaje, které by vás mohly
        identifikovat.
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
          placeholder="Například: co mohu cvičit po operaci kolene"
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={!situation.trim()}
            className="min-h-11 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Vyhledat
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
            Doporučený návod
          </p>
          <h3 className="font-serif-display mt-1 text-xl text-slate-800">
            {result.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
          <p className="mt-3 text-xs text-slate-500">
            Vybráno podle slov ve vašem popisu.
          </p>
          <Link
            href={`/navody/${result.slug}`}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800"
          >
            Otevřít návod
          </Link>
        </div>
      )}
    </section>
  );
}
