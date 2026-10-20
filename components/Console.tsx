"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AGE_GROUP_LABELS,
  type AgeGroup,
  type PatientGuide,
} from "@/sanity/lib/types";
import TopicActions from "@/components/TopicActions";
import TopicMatcher from "@/components/TopicMatcher";
import Layout from "@/components/Layout";

const AGE_GROUPS: AgeGroup[] = ["child", "adult", "senior"];

export default function Console({
  topics,
  isSanityConfigured,
}: {
  topics: PatientGuide[];
  isSanityConfigured: boolean;
}) {
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PatientGuide | null>(null);
  const skipInitialUrlSync = useRef(true);
  const shareDialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shareTriggerRef = useRef<HTMLButtonElement>(null);
  const bodyParts = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.bodyPart))),
    [topics],
  );

  useEffect(() => {
    const dialog = shareDialogRef.current;
    if (!dialog) return;

    if (selected && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!selected && dialog.open) {
      dialog.close();
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousDocumentOverflow = documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const bodyPaddingRight =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [selected]);

  useEffect(() => {
    function readFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const urlBodyPart = params.get("bodyPart");
      const urlAge = params.get("age");

      setBodyPart(bodyParts.includes(urlBodyPart ?? "") ? urlBodyPart : null);
      setAge(
        AGE_GROUPS.includes(urlAge as AgeGroup) ? (urlAge as AgeGroup) : null,
      );
      setQuery(params.get("q") ?? "");
    }

    readFiltersFromUrl();
    window.addEventListener("popstate", readFiltersFromUrl);
    return () => window.removeEventListener("popstate", readFiltersFromUrl);
  }, [bodyParts]);

  useEffect(() => {
    if (skipInitialUrlSync.current) {
      skipInitialUrlSync.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (bodyPart) params.set("bodyPart", bodyPart);
    if (age) params.set("age", age);
    if (query.trim()) params.set("q", query.trim());

    const search = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}`,
    );
  }, [bodyPart, age, query]);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      return matchesFilters(t, bodyPart, age, query);
    });
  }, [bodyPart, age, query]);

  const hasBodyPartResults = (part: string) =>
    topics.some((topic) => matchesFilters(topic, part, age, query));
  const hasAgeResults = (group: AgeGroup) =>
    topics.some((topic) => matchesFilters(topic, bodyPart, group, query));
  const hasActiveFilters = Boolean(bodyPart || age || query.trim());

  function clearFilters() {
    setBodyPart(null);
    setAge(null);
    setQuery("");
  }

  if (topics.length === 0) {
    return (
      <Layout>
        <h1 className="font-serif-display mb-4 text-3xl text-slate-800">
          Pokyny a cvičení pro pacienty
        </h1>
        <p
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600"
        >
          {isSanityConfigured
            ? "Zatím nejsou zveřejněné žádné pokyny pro pacienty."
            : "Knihovna pokynů pro pacienty zatím není připojena k CMS."}
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Pokyny a cvičení pro pacienty
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Najděte návod podle své situace, nebo procházejte témata. Konkrétní
          pokyny můžete otevřít také přímo přes odkaz nebo QR kód od lékaře.
        </p>
      </header>

      <div className="space-y-6">
        <TopicMatcher />

        <div className="dashboard-grid gap-8">
          <aside className="mb-7 sm:mb-0">
            <div className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Procházet pokyny
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Zúžte výběr podle oblasti těla nebo věkové skupiny.
              </p>
            </div>

            <div className="md:sticky md:top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Filtrovat podle oblasti
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="text-xs font-semibold text-teal-800 underline decoration-teal-200 underline-offset-4 transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Vymazat filtry
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
                {bodyParts.map((part) => (
                  <FilterChip
                    key={part}
                    label={part}
                    active={bodyPart === part}
                    disabled={bodyPart !== part && !hasBodyPartResults(part)}
                    onClick={() => setBodyPart(bodyPart === part ? null : part)}
                  />
                ))}
              </div>
              <div className="my-4 border-t border-slate-200" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Věková skupina
              </p>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
                {AGE_GROUPS.map((g) => (
                  <FilterChip
                    key={g}
                    label={AGE_GROUP_LABELS[g]}
                    active={age === g}
                    disabled={age !== g && !hasAgeResults(g)}
                    onClick={() => setAge(age === g ? null : g)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-serif-display text-2xl text-slate-800">
                  Všechny návody
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filtered.length} {filtered.length === 1 ? "téma" : "témat"} k
                  dispozici
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
                  ⌕
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Hledat podle tématu, oblasti nebo příznaku"
                  placeholder="Hledat příznak nebo téma…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((t) => (
                <li key={t.slug} className="topic-card">
                  <div className="flex min-h-52 w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md sm:p-5">
                    <Link
                      href={`/navody/${t.slug}`}
                      className="group flex flex-1 flex-col rounded-xl p-1 text-left focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                          {t.bodyPart}
                        </span>
                        <span className="text-lg text-teal-700 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                      <span className="font-serif-display text-xl leading-tight text-slate-800 group-hover:text-teal-800">
                        {t.title}
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-slate-500">
                        {t.summary}
                      </span>
                    </Link>
                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        href={`/navody/${t.slug}`}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                      >
                        Otevřít návod
                      </Link>
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          shareTriggerRef.current = event.currentTarget;
                          setSelected(t);
                        }}
                        className="min-h-11 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                      >
                        Sdílet
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 sm:col-span-2">
                  Žádné téma neodpovídá filtru. Zkuste některý zrušit.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>

      <dialog
        ref={shareDialogRef}
        aria-label={selected ? `Sdílet pokyny: ${selected.title}` : undefined}
        onClose={() => {
          setSelected(null);
          shareTriggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.close();
          }
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60 "
      >
        <div className="p-5 sm:p-7 relative">
          <div className="mb-4 flex justify-end">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => shareDialogRef.current?.close()}
              className="absolute top-2 right-2 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              Zavřít
            </button>
          </div>
          {selected && <TopicActions topic={selected} />}
        </div>
      </dialog>
    </Layout>
  );
}

function FilterChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-teal-600 bg-teal-50 font-semibold text-teal-800"
          : "border-slate-200 bg-white text-slate-500 hover:border-teal-600 hover:text-teal-800"
      }`}
    >
      {label}
    </button>
  );
}

function matchesFilters(
  topic: PatientGuide,
  bodyPart: string | null,
  age: AgeGroup | null,
  query: string,
) {
  if (bodyPart && topic.bodyPart !== bodyPart) return false;
  if (age && !topic.ageGroups.includes(age)) return false;
  if (query.trim()) {
    const normalizedQuery = normalizeSearch(query);
    const haystack = normalizeSearch(
      `${topic.title} ${topic.bodyPart} ${topic.summary} ${topic.symptoms.join(" ")}`,
    );
    if (!haystack.includes(normalizedQuery)) return false;
  }
  return true;
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
