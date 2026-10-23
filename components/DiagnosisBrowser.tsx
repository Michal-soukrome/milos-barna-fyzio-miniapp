"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import AsidePanel from "./AsidePanel";

export type BrowserDiagnosis = {
  _id: string;
  slug: string;
  title: string;
  summary?: string | null;
};

export type BrowserGroup = {
  key: string;
  label: string;
  diagnoses: BrowserDiagnosis[];
};

// "Kotník" -> "kotnik", so patients can search without Czech diacritics.
const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function diagnosesCount(n: number) {
  if (n === 0) return "Nenalezena žádná diagnóza";
  if (n === 1) return "Nalezena 1 diagnóza";
  if (n >= 2 && n <= 4) return `Nalezeny ${n} diagnózy`;
  return `Nalezeno ${n} diagnóz`;
}

export default function DiagnosisBrowser({
  groups,
}: {
  groups: BrowserGroup[];
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  // Precompute the searchable text once per diagnosis.
  const indexed = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        diagnoses: group.diagnoses.map((diagnosis) => ({
          diagnosis,
          haystack: normalize(`${diagnosis.title} ${diagnosis.summary ?? ""}`),
        })),
      })),
    [groups],
  );

  const tokens = useMemo(
    () => normalize(query).split(/\s+/).filter(Boolean),
    [query],
  );
  const isSearching = tokens.length > 0;

  // Every token must match (AND). Groups with no matches are dropped.
  const filteredGroups: BrowserGroup[] = useMemo(() => {
    if (!isSearching) return groups;
    return indexed
      .map((group) => ({
        key: group.key,
        label: group.label,
        diagnoses: group.diagnoses
          .filter(({ haystack }) =>
            tokens.every((token) => haystack.includes(token)),
          )
          .map(({ diagnosis }) => diagnosis),
      }))
      .filter((group) => group.diagnoses.length > 0);
  }, [groups, indexed, tokens, isSearching]);

  const total = filteredGroups.reduce(
    (sum, group) => sum + group.diagnoses.length,
    0,
  );

  return (
    <>
      <div className="mt-10" role="search">
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Vyhledejte diagnózu nebo obtíž
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Např. bolest paty nebo kotníku"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-800 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
            >
              Smazat
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {isSearching ? diagnosesCount(total) : ""}
        </p>
        {isSearching && total > 0 && (
          <p className="mt-2 text-sm text-slate-500" aria-hidden="true">
            {diagnosesCount(total)}
          </p>
        )}
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
          <p>
            Pro zadaný dotaz jsme nenašli žádnou zveřejněnou diagnózu. Zkuste
            <button
              type="button"
              onClick={() => setQuery("")}
              className="ml-1 text-teal-800 underline"
            >
              nové hledání
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          {/* Aside: on mobile it sits above the content, on lg it moves to the right */}
          <AsidePanel
            className="order-first lg:order-2"
            aria-label="Navigace podle kategorie diagnóz"
          >
            <nav
              id="diagnosis-category-navigation"
              className="lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Podle kategorie
              </p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {filteredGroups.map((group) => (
                  <li key={group.key}>
                    <a
                      href={`#diagnosis-category-${group.key}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:border-teal-600 hover:bg-teal-50 lg:border-transparent lg:bg-transparent lg:py-2"
                    >
                      <span>
                        {group.label}{" "}
                        <span className="text-teal-600 italic font-light">
                          ({group.diagnoses.length})
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </AsidePanel>

          {/* Main content */}
          <div className="space-y-12 lg:order-1">
            {filteredGroups.map((group) => (
              <section
                key={group.key}
                id={`diagnosis-category-${group.key}`}
                className="scroll-mt-24"
                aria-labelledby={`diagnosis-category-${group.key}-heading`}
              >
                <h2
                  id={`diagnosis-category-${group.key}-heading`}
                  className="font-serif-display mb-5 border-b border-slate-200 pb-2 text-2xl text-slate-800"
                >
                  {group.label}
                </h2>
                <ul className="divide-y divide-slate-200 border-y border-slate-200">
                  {group.diagnoses.map((diagnosis) => (
                    <li key={diagnosis._id}>
                      <Link
                        href={`/diagnozy/${diagnosis.slug}`}
                        className="group flex items-center justify-between gap-4 px-2 py-3 transition-colors hover:bg-teal-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
                      >
                        <span className="min-w-0">
                          <span className="block text-lg font-semibold text-teal-800 group-hover:underline">
                            {diagnosis.title}
                          </span>
                          {diagnosis.summary && (
                            <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-slate-600">
                              {diagnosis.summary}
                            </span>
                          )}
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-teal-600 transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
