"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AGE_GROUP_LABELS,
  AgeGroup,
  BODY_PARTS,
  Topic,
  topics,
} from "@/lib/content";
import TopicActions from "@/components/TopicActions";

const AGE_GROUPS: AgeGroup[] = ["child", "adult", "senior"];

export default function Console() {
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Topic | null>(null);
  const skipInitialUrlSync = useRef(true);

  useEffect(() => {
    function readFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const urlBodyPart = params.get("bodyPart");
      const urlAge = params.get("age");

      setBodyPart(BODY_PARTS.includes(urlBodyPart ?? "") ? urlBodyPart : null);
      setAge(
        AGE_GROUPS.includes(urlAge as AgeGroup) ? (urlAge as AgeGroup) : null,
      );
      setQuery(params.get("q") ?? "");
    }

    readFiltersFromUrl();
    window.addEventListener("popstate", readFiltersFromUrl);
    return () => window.removeEventListener("popstate", readFiltersFromUrl);
  }, []);

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

  if (selected) {
    return (
      <div className="min-h-screen px-5 py-6 sm:px-8">
        <button
          onClick={() => setSelected(null)}
          className="mx-auto mb-5 block max-w-4xl text-sm font-semibold text-[var(--clinical-deep)] hover:text-[var(--ink)]"
        >
          ← Zpět na přehled materiálů
        </button>
        <main className="mx-auto max-w-4xl rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(18,50,71,0.08)] sm:p-10">
          <TopicActions topic={selected} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="dashboard-grid mx-auto max-w-7xl gap-8 px-5 py-7 sm:px-8 sm:py-10">
        <aside className="mb-7 sm:mb-0">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--clinical)]">
              Knihovna
            </p>
            <h1 className="font-serif-display text-3xl leading-tight text-[var(--navy)]">
              Pomůcky pro pacienty
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
              Vyberte téma a sdílejte ověřené pokyny přes QR kód nebo e-mailem.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_12px_30px_rgba(18,50,71,0.05)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Filtrovat podle oblasti
              </p>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="text-xs font-semibold text-[var(--clinical-deep)] underline decoration-[var(--clinical-soft)] underline-offset-4 transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
              >
                Vymazat filtry
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
              {BODY_PARTS.map((part) => (
                <FilterChip
                  key={part}
                  label={part}
                  active={bodyPart === part}
                  disabled={bodyPart !== part && !hasBodyPartResults(part)}
                  onClick={() => setBodyPart(bodyPart === part ? null : part)}
                />
              ))}
            </div>
            <div className="my-4 border-t border-[var(--line)]" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
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

        <main>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--clinical)]">
                Dostupné materiály
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {filtered.length} {filtered.length === 1 ? "téma" : "témat"} k
                dispozici
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <span className="pointer-events-none absolute left-3 top-2.5 text-[var(--ink-soft)]">
                ⌕
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hledat příznak nebo téma…"
                className="w-full rounded-xl border border-[var(--line)] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-[var(--clinical)] focus:shadow-[0_0_0_3px_var(--clinical-soft)]"
              />
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((t) => (
              <li key={t.slug} className="topic-card">
                <div className="flex min-h-52 w-full flex-col rounded-2xl border border-[var(--line)] bg-white p-4 text-left shadow-[0_8px_24px_rgba(18,50,71,0.04)] transition-all hover:-translate-y-0.5 hover:border-[var(--clinical)] hover:shadow-[0_14px_30px_rgba(8,126,139,0.12)] sm:p-5">
                  <Link
                    href={`/t/${t.slug}`}
                    className="group flex flex-1 flex-col rounded-xl p-1 text-left focus-visible:ring-2 focus-visible:ring-[var(--clinical)]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-[var(--clinical-soft)] px-2.5 py-1 text-xs font-bold text-[var(--clinical-deep)]">
                        {t.bodyPart}
                      </span>
                      <span className="text-lg text-[var(--clinical)] transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                    <span className="font-serif-display text-xl leading-tight text-[var(--navy)] group-hover:text-[var(--clinical-deep)]">
                      {t.title}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {t.summary}
                    </span>
                  </Link>
                  <div className="mt-3 flex items-center gap-3">
                    <Link href={`/t/${t.slug}`} className="min-h-11 w-full">
                      <button className="min-h-11 w-full rounded-xl bg-[var(--clinical-deep)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--clinical-deep)] focus-visible:ring-2 focus-visible:ring-[var(--clinical)] focus-visible:ring-offset-2">
                        Více informací
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(t)}
                      className="min-h-11 w-full rounded-xl bg-[var(--clinical)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--clinical-deep)] focus-visible:ring-2 focus-visible:ring-[var(--clinical)] focus-visible:ring-offset-2"
                    >
                      Sdílet
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--ink-soft)] sm:col-span-2">
                Žádné téma neodpovídá filtru. Zkuste některý zrušit.
              </li>
            )}
          </ul>
        </main>
      </div>
    </div>
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
          ? "border-[var(--clinical)] bg-[var(--clinical-soft)] font-semibold text-[var(--clinical-deep)]"
          : "border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--clinical)] hover:text-[var(--clinical-deep)]"
      }`}
    >
      {label}
    </button>
  );
}

function matchesFilters(
  topic: Topic,
  bodyPart: string | null,
  age: AgeGroup | null,
  query: string,
) {
  if (bodyPart && topic.bodyPart !== bodyPart) return false;
  if (age && !topic.ageGroups.includes(age)) return false;
  if (query.trim()) {
    const normalizedQuery = query.trim().toLowerCase();
    const haystack =
      `${topic.title} ${topic.summary} ${topic.symptoms.join(" ")}`.toLowerCase();
    if (!haystack.includes(normalizedQuery)) return false;
  }
  return true;
}
