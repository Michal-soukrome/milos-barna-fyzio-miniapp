"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AGE_GROUP_LABELS,
  GUIDE_CONTEXT_LABELS,
  GUIDE_CONTEXTS,
  type AgeGroup,
  type GuideContext,
  type PatientGuideSummary,
} from "@/sanity/lib/types";
import {
  matchPatientGuides,
  PATIENT_NAVIGATOR_NO_MATCH,
} from "@/sanity/lib/patient-guide-matcher";

const ageGroups: AgeGroup[] = ["child", "adult", "senior"];

const STEPS = ["age", "bodyPart", "symptoms", "context", "results"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  age: "Věková skupina",
  bodyPart: "Oblast",
  symptoms: "Příznaky",
  context: "Situace",
  results: "Výsledek",
};

/* ---------- styling constants ---------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2";
const primaryBtn = `min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
const secondaryBtn = `min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`;
const linkBtn = `text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950 ${focusRing} rounded`;
const actionBar =
  "sticky bottom-0 z-10 -mx-5 mt-6 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none";

/* ---------- helpers ---------- */

function guideCountLabel(count: number) {
  if (count === 1) return "1 rada";
  if (count >= 2 && count <= 4) return `${count} rady a tipy`;
  return `${count} rad a tipů`;
}

/**
 * Filters guides by age group. Guides without any age information are treated
 * as suitable for everyone.
 * ASSUMPTION: PatientGuideSummary exposes `ageGroups?: AgeGroup[]`. If the
 * field is named differently in your Sanity schema, change it here only.
 */
function guidesForAge(
  topics: PatientGuideSummary[],
  ageGroup: AgeGroup | null,
) {
  if (!ageGroup) return topics;
  return topics.filter((topic) => {
    const groups = (topic as unknown as { ageGroups?: AgeGroup[] }).ageGroups;
    return !groups || groups.length === 0 || groups.includes(ageGroup);
  });
}

/* ---------- small presentational components ---------- */

function ChoiceButton({
  onClick,
  selected,
  hint,
  children,
}: {
  onClick: () => void;
  selected: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition-colors ${focusRing} ${
        selected
          ? "border-teal-700 bg-teal-50 text-teal-950"
          : "border-slate-200 text-slate-800 hover:border-teal-700 hover:bg-teal-50"
      }`}
    >
      <span>{children}</span>
      {hint && (
        <span className="shrink-0 text-xs font-normal text-slate-500">
          {hint}
        </span>
      )}
    </button>
  );
}

function CheckOption({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2 ${
        checked
          ? "border-teal-700 bg-teal-50 text-teal-950"
          : "border-slate-200 text-slate-700 hover:border-teal-700"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-teal-700"
      />
      {children}
    </label>
  );
}

/* ---------- main component ---------- */

export default function PatientNavigator({
  topics,
}: {
  topics: PatientGuideSummary[];
}) {
  const [step, setStep] = useState<Step>("age");
  // Highest step index the person has reached; lets them jump back and forth.
  const [reached, setReached] = useState(0);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomsUnknown, setSymptomsUnknown] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<GuideContext[]>([]);
  const [contextNone, setContextNone] = useState(false);
  const [contextUnknown, setContextUnknown] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const currentStep = STEPS.indexOf(step);

  /* ----- derived data ----- */

  const ageTopics = useMemo(
    () => guidesForAge(topics, ageGroup),
    [ageGroup, topics],
  );
  const bodyPartCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const topic of ageTopics) {
      counts.set(topic.bodyPart, (counts.get(topic.bodyPart) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "cs"),
    );
  }, [ageTopics]);
  // "Nevím" for the area means: offer symptoms from all areas.
  const areaGuides = useMemo(
    () =>
      bodyPart
        ? ageTopics.filter((topic) => topic.bodyPart === bodyPart)
        : ageTopics,
    [ageTopics, bodyPart],
  );
  const symptoms = useMemo(
    () =>
      Array.from(new Set(areaGuides.flatMap((topic) => topic.symptoms))).sort(
        (a, b) => a.localeCompare(b, "cs"),
      ),
    [areaGuides],
  );
  const matchResult = useMemo(
    () =>
      matchPatientGuides(topics, {
        ageGroup,
        bodyPart,
        symptoms: symptomsUnknown ? null : selectedSymptoms,
        contexts: selectedContexts,
        contextUnknown,
      }),
    [
      ageGroup,
      bodyPart,
      contextUnknown,
      selectedContexts,
      selectedSymptoms,
      symptomsUnknown,
      topics,
    ],
  );
  const matchCount =
    matchResult.status === "match" ? matchResult.guides.length : 0;

  const contextAnswered =
    selectedContexts.length > 0 || contextNone || contextUnknown;

  /* ----- focus + scroll to the new step (keyboard / screen reader / mobile) ----- */

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      el.scrollIntoView({ block: "start" });
    }
  }, [step]);

  /* ----- navigation ----- */

  function go(next: Step, truncate = false) {
    const index = STEPS.indexOf(next);
    setStep(next);
    setReached((current) => (truncate ? index : Math.max(current, index)));
  }

  function goBack() {
    const previous = STEPS[Math.max(currentStep - 1, 0)];
    setStep(previous);
  }

  function clearFrom(from: Step) {
    const index = STEPS.indexOf(from);
    if (index <= 1) setBodyPart(null);
    if (index <= 2) {
      setSelectedSymptoms([]);
      setSymptomsUnknown(false);
    }
    if (index <= 3) {
      setSelectedContexts([]);
      setContextNone(false);
      setContextUnknown(false);
    }
  }

  /* ----- answers ----- */

  // Answers below are only reset when an upstream answer really changes,
  // so going back and re-confirming the same choice keeps the rest intact.

  function chooseAgeGroup(value: AgeGroup | null) {
    const changed = value !== ageGroup;
    if (changed) {
      setAgeGroup(value);
      clearFrom("bodyPart");
    }
    go("bodyPart", changed);
  }

  function chooseBodyPart(value: string | null) {
    const changed = value !== bodyPart;
    if (changed) {
      setBodyPart(value);
      clearFrom("symptoms");
    }
    go("symptoms", changed);
  }

  function toggleSymptom(value: string) {
    setSymptomsUnknown(false);
    setSelectedSymptoms((current) =>
      current.includes(value)
        ? current.filter((symptom) => symptom !== value)
        : [...current, value],
    );
  }

  function toggleContext(value: GuideContext) {
    setContextNone(false);
    setContextUnknown(false);
    setSelectedContexts((current) =>
      current.includes(value)
        ? current.filter((context) => context !== value)
        : [...current, value],
    );
  }

  function chooseNoContext() {
    setSelectedContexts([]);
    setContextUnknown(false);
    setContextNone((value) => !value);
  }

  function chooseUnknownContext() {
    setSelectedContexts([]);
    setContextNone(false);
    setContextUnknown((value) => !value);
  }

  function startOver() {
    setAgeGroup(null);
    clearFrom("bodyPart");
    setReached(0);
    setStep("age");
  }

  /* ----- summary of answers (clickable chips) ----- */

  const answerChips: { label: string; step: Step }[] = [];
  if (currentStep > 0) {
    answerChips.push({
      step: "age",
      label: ageGroup ? AGE_GROUP_LABELS[ageGroup] : "Věk neuveden",
    });
  }
  if (currentStep > 1) {
    answerChips.push({
      step: "bodyPart",
      label: bodyPart ?? "Oblast neuvedena",
    });
  }
  if (currentStep > 2) {
    answerChips.push({
      step: "symptoms",
      label:
        symptomsUnknown || selectedSymptoms.length === 0
          ? "Příznaky neuvedeny"
          : selectedSymptoms.join(", "),
    });
  }
  if (currentStep > 3) {
    answerChips.push({
      step: "context",
      label:
        selectedContexts.length > 0
          ? selectedContexts.map((c) => GUIDE_CONTEXT_LABELS[c]).join(", ")
          : contextUnknown
            ? "Situace neznámá"
            : "Bez zvláštní situace",
    });
  }

  /* ----- render ----- */

  return (
    <section className="space-y-5">
      <header>
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Průvodce obtížemi
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-600">
          Odpovězte na čtyři krátké otázky a najděte rady a tipy k vašim
          obtížím. Průvodce neurčuje diagnózu ani naléhavost stavu a nenahrazuje
          vyšetření lékařem.
        </p>
      </header>

      <aside
        role="note"
        className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-950"
      >
        <p>
          <strong>Akutní stav?</strong> Průvodce ho nerozpozná. Při ohrožení
          života volejte{" "}
          <a className="inline-block py-1 font-bold underline" href="tel:155">
            155
          </a>{" "}
          nebo{" "}
          <a className="inline-block py-1 font-bold underline" href="tel:112">
            112
          </a>
          .
        </p>
      </aside>

      {topics.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600"
        >
          <p>
            Průvodce zatím nemá žádné zveřejněné rady a tipy, ze kterých by mohl
            vybírat.
          </p>
          <div className="mt-4">
            <Link
              href="/navody"
              className="font-semibold text-teal-800 underline underline-offset-4"
            >
              Procházet rady a tipy
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Progress: compact on mobile, full stepper from sm up */}
          <nav aria-label="Postup průvodcem">
            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-700">
                Krok {currentStep + 1} z {STEPS.length}: {STEP_LABELS[step]}
              </p>
              <div
                aria-hidden="true"
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className="h-full rounded-full bg-teal-700 transition-[width] motion-reduce:transition-none"
                  style={{
                    width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <ol className="hidden grid-cols-5 gap-2 sm:grid">
              {STEPS.map((id, index) => {
                const isCurrent = index === currentStep;
                const canVisit = index <= reached && !isCurrent;
                const tone = isCurrent
                  ? "border-teal-700 bg-teal-50 text-teal-900"
                  : index <= reached
                    ? "border-teal-200 bg-white text-teal-800"
                    : "border-slate-200 bg-white text-slate-500";
                const content = (
                  <>
                    <span className="mr-2 text-xs">{index + 1}.</span>
                    {STEP_LABELS[id]}
                  </>
                );
                return (
                  <li
                    key={id}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex"
                  >
                    {canVisit ? (
                      <button
                        type="button"
                        onClick={() => setStep(id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold hover:bg-teal-50 ${tone} ${focusRing}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <span
                        className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold ${tone}`}
                      >
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div
            ref={cardRef}
            tabIndex={-1}
            className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm outline-none sm:p-8"
          >
            {/* Answers so far, each one editable */}
            {answerChips.length > 0 && (
              <ul
                aria-label="Váš dosavadní výběr"
                className="mb-5 flex flex-wrap gap-2"
              >
                {answerChips.map((chip) => (
                  <li key={chip.step} className="max-w-full">
                    <button
                      type="button"
                      onClick={() => setStep(chip.step)}
                      aria-label={`Změnit: ${chip.label}`}
                      className={`flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-700 hover:bg-teal-50 ${focusRing}`}
                    >
                      <span className="truncate">{chip.label}</span>
                      <span className="shrink-0 font-normal text-teal-800 underline underline-offset-2">
                        změnit
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* STEP 1: age */}
            {step === "age" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Koho se obtíže týkají?
                </legend>
                <p className="mt-2 text-sm text-slate-600">
                  Stačí věková skupina. Přesný věk ani jiné osobní údaje
                  nepotřebujeme.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {ageGroups.map((group) => (
                    <ChoiceButton
                      key={group}
                      selected={reached >= 1 && ageGroup === group}
                      onClick={() => chooseAgeGroup(group)}
                    >
                      {AGE_GROUP_LABELS[group]}
                    </ChoiceButton>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => chooseAgeGroup(null)}
                    aria-pressed={reached >= 1 && ageGroup === null}
                    className={secondaryBtn}
                  >
                    Nevím
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 2: body part */}
            {step === "bodyPart" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Které oblasti se obtíže týkají?
                </legend>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {bodyPartCounts.map(([part, count]) => (
                    <ChoiceButton
                      key={part}
                      selected={reached >= 2 && bodyPart === part}
                      hint={guideCountLabel(count)}
                      onClick={() => chooseBodyPart(part)}
                    >
                      {part}
                    </ChoiceButton>
                  ))}
                </div>
                {bodyPartCounts.length === 0 && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600"
                  >
                    Pro tuto věkovou skupinu zatím nejsou zveřejněné rady a
                    tipy. Změňte věkovou skupinu nebo{" "}
                    <Link
                      href="/navody"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      procházejte rady a tipy
                    </Link>
                    .
                  </div>
                )}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => chooseBodyPart(null)}
                    aria-pressed={reached >= 2 && bodyPart === null}
                    className={secondaryBtn}
                  >
                    Nevím, zobrazit všechny oblasti
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 3: symptoms */}
            {step === "symptoms" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Jaké příznaky máte?
                </legend>
                <p className="mt-2 text-sm text-slate-600">
                  Můžete vybrat více příznaků. Nabídka vychází z dostupných rad
                  a tipů.
                </p>
                {symptoms.length > 0 ? (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {symptoms.map((symptom) => (
                      <CheckOption
                        key={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                      >
                        {symptom}
                      </CheckOption>
                    ))}
                  </div>
                ) : (
                  <p
                    role="status"
                    className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"
                  >
                    U rad a tipů pro tuto oblast zatím nejsou uvedené konkrétní
                    příznaky. Pokračujte a zobrazí se dostupné rady a tipy.
                  </p>
                )}
                <div className={actionBar}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSymptomsUnknown(false);
                        go("context");
                      }}
                      disabled={selectedSymptoms.length === 0}
                      className={primaryBtn}
                    >
                      {selectedSymptoms.length > 0
                        ? `Pokračovat (vybráno ${selectedSymptoms.length})`
                        : "Pokračovat"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSymptoms([]);
                        setSymptomsUnknown(true);
                        go("context");
                      }}
                      className={secondaryBtn}
                    >
                      Nevím nebo svůj příznak nevidím
                    </button>
                  </div>
                  {selectedSymptoms.length === 0 && symptoms.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Vyberte alespoň jeden příznak, nebo pokračujte bez výběru.
                    </p>
                  )}
                </div>
              </fieldset>
            )}

            {/* STEP 4: context */}
            {step === "context" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Souvisí obtíže s některou z těchto situací?
                </legend>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  rady a tipy po operaci, zlomenině nebo při sádře zobrazíme jen
                  tehdy, když danou situaci vyberete. Můžete zvolit více
                  možností.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {GUIDE_CONTEXTS.map((context) => (
                    <CheckOption
                      key={context}
                      checked={selectedContexts.includes(context)}
                      onChange={() => toggleContext(context)}
                    >
                      {GUIDE_CONTEXT_LABELS[context]}
                    </CheckOption>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 border-t border-slate-200 pt-2 sm:grid-cols-2">
                  <CheckOption checked={contextNone} onChange={chooseNoContext}>
                    Žádná z uvedených situací
                  </CheckOption>
                  <CheckOption
                    checked={contextUnknown}
                    onChange={chooseUnknownContext}
                  >
                    Nevím
                  </CheckOption>
                </div>

                <div className={actionBar}>
                  <button
                    type="button"
                    onClick={() => go("results")}
                    disabled={!contextAnswered}
                    className={`${primaryBtn} w-full sm:w-auto`}
                  >
                    {contextAnswered && matchCount > 0
                      ? `Zobrazit rady a tipy (${matchCount})`
                      : "Zobrazit rady a tipy"}
                  </button>
                  <p
                    aria-live="polite"
                    className="mt-2 min-h-5 text-xs text-slate-500"
                  >
                    {!contextAnswered
                      ? "Vyberte situaci, nebo zvolte „Žádná z uvedených“ či „Nevím“."
                      : matchCount > 0
                        ? `Odpovídá ${guideCountLabel(matchCount)}.`
                        : "Zatím žádná rada přesně neodpovídá. Můžete změnit výběr nebo pokračovat."}
                  </p>
                </div>
              </fieldset>
            )}

            {/* STEP 5: results */}
            {step === "results" && (
              <section aria-labelledby="navigator-results-title">
                <h2
                  id="navigator-results-title"
                  className="font-serif-display text-2xl text-slate-800"
                >
                  {matchResult.status === "match"
                    ? `Nalezeno: ${guideCountLabel(matchCount)}`
                    : "žádná rada přesně neodpovídá"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Jde o obecné informační materiály, nikoli o diagnózu nebo
                  individuální doporučení. Pokud obtíže přetrvávají nebo se
                  zhoršují, obraťte se na zdravotníka.
                </p>

                {matchResult.status === "match" ? (
                  <ul className="mt-5 divide-y divide-slate-200">
                    {matchResult.guides.map((topic) => (
                      <li key={topic._id} className="py-4 first:pt-0">
                        <Link
                          href={`/navody/${topic.slug}`}
                          className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                        >
                          <span className="text-xs font-semibold text-teal-700">
                            {topic.bodyPart}
                          </span>
                          <span className="font-serif-display mt-1 block text-lg leading-snug text-slate-800 group-hover:text-teal-800 group-hover:underline">
                            {topic.title}
                          </span>
                          <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                            {topic.summary}
                          </span>
                          <span className="mt-2 block text-xs font-semibold text-slate-600">
                            {topic.contexts
                              .map((context) => GUIDE_CONTEXT_LABELS[context])
                              .join(" · ")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {PATIENT_NAVIGATOR_NO_MATCH.copy}{" "}
                    <Link
                      href={PATIENT_NAVIGATOR_NO_MATCH.contactHref}
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      Obraťte se na ordinaci
                    </Link>{" "}
                    nebo si{" "}
                    <Link
                      href={PATIENT_NAVIGATOR_NO_MATCH.libraryHref}
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      prohlédněte rady a tipy
                    </Link>
                    . Můžete také upravit svůj výběr výše.
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Link href="/diagnozy" className={linkBtn}>
                    Procházet knihovnu diagnóz
                  </Link>
                  <button type="button" onClick={startOver} className={linkBtn}>
                    Začít znovu
                  </button>
                </div>
              </section>
            )}

            {step !== "age" && (
              <button
                type="button"
                onClick={goBack}
                className={`mt-6 min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
              >
                Zpět
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
