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
      <div className="mx-auto max-w-md px-5 py-6">
        <button
          onClick={() => setSelected(null)}
          className="mb-5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          ← Back to list
        </button>
        <TopicActions topic={selected} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <header className="mb-6">
        <h1 className="font-serif-display text-2xl leading-tight">
          Find the right handout
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Pick a topic, then send it to the patient by QR or email.
        </p>
      </header>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: swelling, crutches, wound…"
        className="mb-4 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus-visible:border-[var(--clinical)]"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {BODY_PARTS.map((part) => (
          <FilterChip
            key={part}
            label={part}
            active={bodyPart === part}
            onClick={() => setBodyPart(bodyPart === part ? null : part)}
          />
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {AGE_GROUPS.map((g) => (
          <FilterChip
            key={g}
            label={AGE_GROUP_LABELS[g]}
            active={age === g}
            onClick={() => setAge(age === g ? null : g)}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {filtered.map((t) => (
          <li key={t.slug}>
            <button
              onClick={() => setSelected(t)}
              className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-left transition-colors hover:border-[var(--clinical)]"
            >
              <div className="text-sm text-[var(--ink-soft)]">{t.bodyPart}</div>
              <div className="font-medium">{t.title}</div>
              <div className="mt-0.5 text-sm text-[var(--ink-soft)]">{t.summary}</div>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-lg border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--ink-soft)]">
            No topics match. Try clearing a filter.
          </li>
        )}
      </ul>
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
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-[var(--clinical)] bg-[var(--clinical-soft)] text-[var(--clinical)]"
          : "border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--clinical)]"
      }`}
    >
      {label}
    </button>
  );
}
