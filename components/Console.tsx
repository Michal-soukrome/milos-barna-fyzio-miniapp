"use client";

import { useMemo, useState } from "react";
import { AGE_GROUP_LABELS, AgeGroup, BODY_PARTS, Topic, topics } from "@/lib/content";
import TopicActions from "@/components/TopicActions";

const AGE_GROUPS: AgeGroup[] = ["child", "adult", "senior"];

export default function Console() {
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Topic | null>(null);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (bodyPart && t.bodyPart !== bodyPart) return false;
      if (age && !t.ageGroups.includes(age)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${t.title} ${t.summary} ${t.symptoms.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bodyPart, age, query]);

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
      <header className="bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--clinical)] text-xl font-bold">+</div>
            <div>
              <div className="text-sm font-bold tracking-[0.18em] text-[#a7dfe2]">ORTHOCARE</div>
              <div className="text-xs text-[#bed0d8]">Materiály pro ordinaci</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[#bed0d8] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#72d4bb]" /> Připraveno k použití
          </div>
        </div>
      </header>

      <div className="dashboard-grid mx-auto max-w-7xl gap-8 px-5 py-7 sm:px-8 sm:py-10">
        <aside className="mb-7 sm:mb-0">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--clinical)]">Knihovna</p>
            <h1 className="font-serif-display text-3xl leading-tight text-[var(--navy)]">Pomůcky pro pacienty</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">Vyberte téma a sdílejte ověřené pokyny přes QR kód nebo e-mailem.</p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_12px_30px_rgba(18,50,71,0.05)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Filtrovat podle oblasti</p>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
              {BODY_PARTS.map((part) => (
                <FilterChip key={part} label={part} active={bodyPart === part} onClick={() => setBodyPart(bodyPart === part ? null : part)} />
              ))}
            </div>
            <div className="my-4 border-t border-[var(--line)]" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Věková skupina</p>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start">
              {AGE_GROUPS.map((g) => (
                <FilterChip key={g} label={AGE_GROUP_LABELS[g]} active={age === g} onClick={() => setAge(age === g ? null : g)} />
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--clinical)]">Dostupné materiály</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{filtered.length} {filtered.length === 1 ? "téma" : "témat"} k dispozici</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <span className="pointer-events-none absolute left-3 top-2.5 text-[var(--ink-soft)]">⌕</span>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hledat příznak nebo téma…" className="w-full rounded-xl border border-[var(--line)] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-[var(--clinical)] focus:shadow-[0_0_0_3px_var(--clinical-soft)]" />
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((t) => (
              <li key={t.slug} className="topic-card">
                <button onClick={() => setSelected(t)} className="group flex min-h-44 w-full flex-col rounded-2xl border border-[var(--line)] bg-white p-5 text-left shadow-[0_8px_24px_rgba(18,50,71,0.04)] transition-all hover:-translate-y-0.5 hover:border-[var(--clinical)] hover:shadow-[0_14px_30px_rgba(8,126,139,0.12)]">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-[var(--clinical-soft)] px-2.5 py-1 text-xs font-bold text-[var(--clinical-deep)]">{t.bodyPart}</span>
                    <span className="text-lg text-[var(--clinical)] transition-transform group-hover:translate-x-1">→</span>
                  </div>
                  <div className="font-serif-display text-xl leading-tight text-[var(--navy)]">{t.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{t.summary}</div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--ink-soft)] sm:col-span-2">Žádné téma neodpovídá filtru. Zkuste některý zrušit.</li>}
          </ul>
        </main>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
        active
          ? "border-[var(--clinical)] bg-[var(--clinical-soft)] font-semibold text-[var(--clinical-deep)]"
          : "border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--clinical)] hover:text-[var(--clinical-deep)]"
      }`}
    >
      {label}
    </button>
  );
}
