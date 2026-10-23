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
  countReachableGuides,
  matchPatientGuides,
  PATIENT_NAVIGATOR_NO_MATCH,
  type PartialPatientGuideAnswers,
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
const secondaryBtn = `min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`;
const linkBtn = `min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 ${focusRing}`;
const actionBar =
  "patient-navigator-action-bar sticky bottom-0 z-10 -mx-5 mt-6 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none";

/* ---------- helpers ---------- */

// "Kotník" -> "kotnik", so the symptom filter works without diacritics.
const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function guideCountLabel(count: number) {
  if (count === 1) return "1";
  if (count >= 2 && count <= 4) return `${count}`;
  return `${count}`;
}

// Short label for options: "žádná rada" instead of "0".
function optionCountLabel(count: number) {
  return count === 0 ? "žádná rada" : guideCountLabel(count);
}

/**
 * Only reviewed guides are offered, and the age rule is the same as in the
 * matcher: a guide must list the age group explicitly.
 */
function guidesForAge(
  topics: PatientGuideSummary[],
  ageGroup: AgeGroup | null,
) {
  return topics.filter(
    (topic) =>
      topic.reviewed === true &&
      (!ageGroup || topic.ageGroups.includes(ageGroup)),
  );
}

/* ---------- small presentational components ---------- */

function ChoiceRadio({
  name,
  value,
  checked,
  onChange,
  hint,
  disabled,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  hint?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 font-semibold transition-colors focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2 ${
        disabled
          ? "cursor-not-allowed border-slate-200 text-slate-400 opacity-45"
          : checked
            ? "cursor-pointer border-teal-700 bg-teal-50 text-teal-950"
            : "cursor-pointer border-slate-200 text-slate-800 hover:border-teal-700"
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="h-4 w-4 accent-teal-700"
        />
        {children}
      </span>
      {hint && (
        <span className="text-teal-600 italic font-light">({hint})</span>
      )}
    </label>
  );
}

function CheckOption({
  checked,
  onChange,
  count,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  count?: number;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2 ${
        disabled
          ? "cursor-not-allowed border-slate-200 text-slate-400 opacity-60"
          : checked
            ? "cursor-pointer border-teal-700 bg-teal-50 text-teal-950"
            : "cursor-pointer border-slate-200 text-slate-700 hover:border-teal-700"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4 accent-teal-700"
      />
      <span className="flex-1">{children}</span>
      {count !== undefined && (
        <span className="shrink-0 text-xs text-slate-500">
          {count === 0 ? "žádná rada" : count}
        </span>
      )}
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
  const [ageDraft, setAgeDraft] = useState<AgeGroup | "unknown" | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [bodyPartDraft, setBodyPartDraft] = useState<
    string | "__unknown__" | null
  >(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomsUnknown, setSymptomsUnknown] = useState(false);
  const [symptomQuery, setSymptomQuery] = useState("");
  const [selectedContexts, setSelectedContexts] = useState<GuideContext[]>([]);
  const [contextNone, setContextNone] = useState(false);
  const [contextUnknown, setContextUnknown] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const currentStep = STEPS.indexOf(step);
  const selectedAge =
    ageDraft ?? (reached >= 1 ? (ageGroup ?? "unknown") : null);
  const selectedBodyPart =
    bodyPartDraft ?? (reached >= 2 ? (bodyPart ?? "__unknown__") : null);

  /* ----- derived data ----- */

  const ageTopics = useMemo(
    () => guidesForAge(topics, ageGroup),
    [ageGroup, topics],
  );
  const bodyParts = useMemo(
    () =>
      Array.from(new Set(ageTopics.map((topic) => topic.bodyPart))).sort(
        (a, b) => a.localeCompare(b, "cs"),
      ),
    [ageTopics],
  );
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
  const visibleSymptoms = useMemo(() => {
    const tokens = normalize(symptomQuery).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return symptoms;
    return symptoms.filter((symptom) => {
      const haystack = normalize(symptom);
      return tokens.every((token) => haystack.includes(token));
    });
  }, [symptoms, symptomQuery]);

  /**
   * How many guides can still be reached if the given answers were changed.
   * Everything not overridden uses the current answers. Later steps that are
   * not decided yet must be overridden with empty values by the caller.
   */
  function countFor(override: PartialPatientGuideAnswers) {
    return countReachableGuides(topics, {
      ageGroup,
      bodyPart,
      symptoms: selectedSymptoms,
      contexts: selectedContexts,
      ...override,
    });
  }

  const matchResult = matchPatientGuides(topics, {
    ageGroup,
    bodyPart,
    symptoms: symptomsUnknown ? null : selectedSymptoms,
    contexts: selectedContexts,
    contextUnknown,
  });
  const matchCount =
    matchResult.status === "match" ? matchResult.guides.length : 0;

  // The matcher gives no result when any earlier question was skipped.
  const canMatch =
    ageGroup !== null &&
    bodyPart !== null &&
    !symptomsUnknown &&
    selectedSymptoms.length > 0;

  const contextAnswered =
    selectedContexts.length > 0 || contextNone || contextUnknown;

  // How many guides the current symptom selection leads to (context not yet chosen).
  const symptomSelectionCount = countFor({
    symptoms: selectedSymptoms,
    contexts: [],
  });
  const symptomDeadEnd =
    selectedSymptoms.length > 0 && symptomSelectionCount === 0;

  /* ----- focus + scroll to the new step (keyboard / screen reader / mobile) ----- */

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const heading = el.querySelector<HTMLElement>("[data-step-heading]");
    (heading ?? el).focus({ preventScroll: true });
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
      setSymptomQuery("");
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
    setAgeDraft(null);
    const changed = value !== ageGroup;
    if (changed) {
      setAgeGroup(value);
      clearFrom("bodyPart");
    }
    go("bodyPart", changed);
  }

  function chooseBodyPart(value: string | null) {
    setBodyPartDraft(null);
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
    setAgeDraft(null);
    setBodyPartDraft(null);
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
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
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
              href="/poradna"
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

            <ol className="hidden items-center sm:flex">
              {STEPS.map((id, index) => {
                const isCurrent = index === currentStep;
                const done = index <= reached && !isCurrent;
                const circle = isCurrent
                  ? "bg-teal-700 text-white"
                  : done
                    ? "bg-teal-100 text-teal-800"
                    : "bg-slate-100 text-slate-600";
                const inner = (
                  <>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${circle}`}
                    >
                      {done ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-slate-800"
                          : done
                            ? "text-teal-800"
                            : "text-slate-600"
                      }`}
                    >
                      {STEP_LABELS[id]}
                    </span>
                  </>
                );
                return (
                  <li
                    key={id}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    {done ? (
                      <button
                        type="button"
                        onClick={() => setStep(id)}
                        className={`flex items-center gap-2 rounded-lg ${focusRing}`}
                      >
                        {inner}
                      </button>
                    ) : (
                      <span className="flex items-center gap-2">{inner}</span>
                    )}
                    {index < STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`mx-3 h-px flex-1 ${
                          index < reached ? "bg-teal-300" : "bg-slate-200"
                        }`}
                      />
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
            {/* Answers so far, each one editable. On desktop the stepper does this, except on results. */}
            {answerChips.length > 0 && (
              <ul
                aria-label="Váš dosavadní výběr"
                className={`mb-5 flex flex-wrap gap-2 ${
                  step === "results" ? "" : "sm:hidden"
                }`}
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
                <legend
                  data-step-heading
                  tabIndex={-1}
                  className="font-serif-display text-2xl text-slate-800 outline-none"
                >
                  Koho se obtíže týkají?
                </legend>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {ageGroups.map((group) => {
                    const n = countFor({
                      ageGroup: group,
                      bodyPart: null,
                      symptoms: [],
                      contexts: [],
                    });
                    return (
                      <ChoiceRadio
                        name="ageGroup"
                        value={group}
                        key={group}
                        disabled={n === 0}
                        hint={optionCountLabel(n)}
                        checked={selectedAge === group}
                        onChange={() => setAgeDraft(group)}
                      >
                        {AGE_GROUP_LABELS[group]}
                      </ChoiceRadio>
                    );
                  })}
                </div>
                <div className="mt-3 grid gap-3">
                  <ChoiceRadio
                    name="ageGroup"
                    value="unknown"
                    checked={selectedAge === "unknown"}
                    onChange={() => setAgeDraft("unknown")}
                  >
                    Nevím
                  </ChoiceRadio>
                </div>
                <div className={actionBar}>
                  <button
                    type="button"
                    onClick={() =>
                      chooseAgeGroup(
                        selectedAge === "unknown" ? null : selectedAge,
                      )
                    }
                    disabled={selectedAge === null}
                    className={primaryBtn}
                  >
                    Pokračovat
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 2: body part */}
            {step === "bodyPart" && (
              <fieldset>
                <legend
                  data-step-heading
                  tabIndex={-1}
                  className="font-serif-display text-2xl text-slate-800 outline-none"
                >
                  Které oblasti se obtíže týkají?
                </legend>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {bodyParts.map((part) => {
                    const n = countFor({
                      bodyPart: part,
                      symptoms: [],
                      contexts: [],
                    });
                    return (
                      <ChoiceRadio
                        name="bodyPart"
                        value={part}
                        key={part}
                        disabled={n === 0}
                        hint={optionCountLabel(n)}
                        checked={selectedBodyPart === part}
                        onChange={() => setBodyPartDraft(part)}
                      >
                        {part}
                      </ChoiceRadio>
                    );
                  })}
                </div>
                {bodyParts.length === 0 && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600"
                  >
                    Pro tuto věkovou skupinu zatím nejsou zveřejněné rady a
                    tipy. Změňte věkovou skupinu nebo{" "}
                    <Link
                      href="/poradna"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      procházejte rady a tipy
                    </Link>
                    .
                  </div>
                )}
                <div className="mt-3">
                  <ChoiceRadio
                    name="bodyPart"
                    value="__unknown__"
                    checked={selectedBodyPart === "__unknown__"}
                    onChange={() => setBodyPartDraft("__unknown__")}
                  >
                    Nevím, zobrazit všechny oblasti
                  </ChoiceRadio>
                </div>
                <div className={actionBar}>
                  <button
                    type="button"
                    onClick={() =>
                      chooseBodyPart(
                        selectedBodyPart === "__unknown__"
                          ? null
                          : selectedBodyPart,
                      )
                    }
                    disabled={selectedBodyPart === null}
                    className={primaryBtn}
                  >
                    Pokračovat
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 3: symptoms */}
            {step === "symptoms" && (
              <fieldset>
                <legend
                  data-step-heading
                  tabIndex={-1}
                  className="font-serif-display text-2xl text-slate-800 outline-none"
                >
                  Jaké příznaky máte?
                </legend>
                <p className="mt-2 text-sm text-slate-600">
                  Můžete vybrat více příznaků. U každého vidíte, kolik rad a
                  tipů by zůstalo.
                </p>

                {symptoms.length > 8 && (
                  <div className="mt-4">
                    <label htmlFor="symptom-filter" className="sr-only">
                      Hledat příznak
                    </label>
                    <input
                      id="symptom-filter"
                      type="search"
                      value={symptomQuery}
                      onChange={(event) => setSymptomQuery(event.target.value)}
                      placeholder="Hledat příznak"
                      autoComplete="off"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                  </div>
                )}

                {symptoms.length > 0 ? (
                  visibleSymptoms.length > 0 ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {visibleSymptoms.map((symptom) => {
                        const checked = selectedSymptoms.includes(symptom);
                        const n = countFor({
                          symptoms: checked
                            ? selectedSymptoms.filter((s) => s !== symptom)
                            : [...selectedSymptoms, symptom],
                          contexts: [],
                        });
                        return (
                          <CheckOption
                            key={symptom}
                            checked={checked}
                            count={n}
                            disabled={!checked && n === 0}
                            onChange={() => toggleSymptom(symptom)}
                          >
                            {symptom}
                          </CheckOption>
                        );
                      })}
                    </div>
                  ) : (
                    <p
                      role="status"
                      className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"
                    >
                      Žádný příznak neodpovídá hledání. Zkuste jiné slovo.
                    </p>
                  )
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
                      disabled={selectedSymptoms.length === 0 || symptomDeadEnd}
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
                </div>
              </fieldset>
            )}

            {/* STEP 4: context */}
            {step === "context" && (
              <fieldset>
                <legend
                  data-step-heading
                  tabIndex={-1}
                  className="font-serif-display text-2xl text-slate-800 outline-none"
                >
                  Souvisí obtíže s některou z těchto situací?
                </legend>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Rady a tipy po operaci, zlomenině nebo při sádře zobrazíme jen
                  tehdy, když danou situaci vyberete. Můžete zvolit více
                  možností.
                </p>
                {!canMatch && (
                  <p
                    role="status"
                    className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-slate-800"
                  >
                    Některou předchozí otázku jste přeskočili, proto průvodce
                    nemůže najít přesnou shodu. Odpovědi můžete změnit nahoře
                    nebo{" "}
                    <Link href="/poradna" className={linkBtn}>
                      procházet všechny rady a tipy
                    </Link>
                    .
                  </p>
                )}
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {GUIDE_CONTEXTS.map((context) => {
                    const checked = selectedContexts.includes(context);
                    const next = checked
                      ? selectedContexts.filter((c) => c !== context)
                      : [...selectedContexts, context];
                    const n = canMatch ? countFor({ contexts: next }) : 0;
                    return (
                      <CheckOption
                        key={context}
                        checked={checked}
                        count={n}
                        disabled={!checked && n === 0}
                        onChange={() => toggleContext(context)}
                      >
                        {GUIDE_CONTEXT_LABELS[context]}
                      </CheckOption>
                    );
                  })}
                </div>
                <div className="mt-2 grid gap-2 border-t border-slate-200 pt-2 sm:grid-cols-2">
                  {/* The matcher never returns guides for these two answers. */}
                  <CheckOption
                    checked={contextNone}
                    count={0}
                    onChange={chooseNoContext}
                  >
                    Žádná z uvedených situací
                  </CheckOption>
                  <CheckOption
                    checked={contextUnknown}
                    count={0}
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
                    {!canMatch
                      ? "Pokračovat bez přesné shody"
                      : contextAnswered && matchCount > 0
                        ? `Zobrazit rady a tipy (${matchCount})`
                        : "Zobrazit rady a tipy"}
                  </button>
                  {!canMatch && (
                    <Link
                      href="/poradna"
                      className={`${linkBtn} inline-block ml-3`}
                    >
                      Procházet všechny rady a tipy
                    </Link>
                  )}
                </div>
              </fieldset>
            )}

            {/* STEP 5: results */}
            {step === "results" && (
              <section aria-labelledby="navigator-results-title">
                <h2
                  id="navigator-results-title"
                  data-step-heading
                  tabIndex={-1}
                  className="font-serif-display text-2xl text-slate-800 outline-none"
                >
                  {matchResult.status === "match"
                    ? `Nalezeno: ${guideCountLabel(matchCount)}`
                    : "Žádná rada přesně neodpovídá"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Jde o obecné informační materiály, nikoli o diagnózu nebo
                  individuální doporučení. Pokud obtíže přetrvávají nebo se
                  zhoršují, obraťte se na zdravotníka.
                </p>

                {matchResult.status === "match" ? (
                  <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200 space-y-3">
                    {matchResult.guides.map((topic) => {
                      const matched = topic.symptoms.filter((s) =>
                        selectedSymptoms.includes(s),
                      );
                      return (
                        <li key={topic._id}>
                          <Link
                            href={`/poradna/${topic.slug}`}
                            className={`group flex items-center border-x border-slate-200 justify-between gap-4 p-3 transition-colors hover:bg-teal-50/60 ${focusRing}`}
                          >
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold uppercase tracking-wide text-teal-700">
                                {topic.bodyPart}
                              </span>
                              <span className="font-serif-display mt-1 block text-xl leading-snug text-slate-800 group-hover:text-teal-800 group-hover:underline">
                                {topic.title}
                              </span>
                              {topic.summary && (
                                <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-slate-600">
                                  {topic.summary}
                                </span>
                              )}
                              {matched.length > 0 && (
                                <span className="mt-2 block text-xs text-slate-500">
                                  <span className="font-semibold text-slate-600">
                                    Shoduje se:
                                  </span>{" "}
                                  {matched.join(", ")}
                                </span>
                              )}
                              {topic.contexts.length > 0 && (
                                <span className="mt-1 block text-xs text-slate-500">
                                  {topic.contexts
                                    .map(
                                      (context) =>
                                        GUIDE_CONTEXT_LABELS[context],
                                    )
                                    .join(" · ")}
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
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {PATIENT_NAVIGATOR_NO_MATCH.copy}{" "}
                    <Link
                      href={PATIENT_NAVIGATOR_NO_MATCH.contactHref}
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      Napište mi
                    </Link>{" "}
                    nebo si{" "}
                    <Link
                      href={PATIENT_NAVIGATOR_NO_MATCH.libraryHref}
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      prohlédněte rady a tipy
                    </Link>
                    . Případně také můžete formulář{" "}
                    <button
                      type="button"
                      onClick={startOver}
                      className="inline-block font-semibold text-teal-800 underline underline-offset-4"
                    >
                      začít znovu
                    </button>
                    .
                  </div>
                )}
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
