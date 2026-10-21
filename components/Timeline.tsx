import type { ReactNode } from "react";

export type TimelineKind = "Vzdělání" | "Praxe" | "Akreditace" | "Certifikát";

export type TimelineItem = {
  /** "2011" or "2005–2011" or "2018–dosud" (ending in "dosud" marks it as current) */
  years: string;
  title: string;
  place?: string;
  note?: string;
  kind: TimelineKind;
};

const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const icons: Record<TimelineKind, ReactNode> = {
  Vzdělání: (
    <svg {...svg}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12.5V17c3 2.5 9 2.5 12 0v-4.5" />
      <path d="M22 10v5" />
    </svg>
  ),
  Praxe: (
    <svg {...svg}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  ),
  Akreditace: (
    <svg {...svg}>
      <path d="m12 3 2.4 1.8 3-.2 1 2.8 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-1 2.8-3-.2L12 21l-2.4-1.8-3 .2-1-2.8-2.4-1.8.9-2.9-.9-2.9 2.4-1.8 1-2.8 3 .2L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Certifikát: (
    <svg {...svg}>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5 7 21l5-3 5 3-1.5-7.5" />
    </svg>
  ),
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="mt-10">
      {items.map((item) => {
        const current = /dosud/i.test(item.years);

        return (
          <li
            key={`${item.years}-${item.title}`}
            className="grid grid-cols-[5.5rem_2.5rem_1fr] gap-x-3 sm:grid-cols-[8rem_2.5rem_1fr] sm:gap-x-5"
          >
            {/* Years */}
            <p className="font-serif-display flex h-10 items-center justify-end whitespace-nowrap text-base text-teal-800 tabular-nums sm:text-xl">
              {item.years}
            </p>

            {/* Marker + connecting line */}
            <div className="flex flex-col items-center">
              <span
                className={
                  current
                    ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white ring-4 ring-teal-100"
                    : "flex size-10 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700"
                }
              >
                {icons[item.kind]}
              </span>
              <span
                aria-hidden="true"
                className="my-1.5 w-0.5 flex-1 rounded-full bg-teal-100 [li:last-child_&]:hidden"
              />
            </div>

            {/* Content */}
            <div className="pb-10 [li:last-child_&]:pb-0">
              <h3 className="flex min-h-10 items-center text-lg font-bold leading-snug text-slate-800">
                {item.title}
              </h3>
              {item.place && (
                <p className="text-sm text-slate-600">{item.place}</p>
              )}
              <p className="mt-2">
                <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  {item.kind}
                </span>
                {current && (
                  <span className="ml-2 inline-block rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Současnost
                  </span>
                )}
              </p>
              {item.note && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}