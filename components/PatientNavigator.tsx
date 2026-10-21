"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
const stepLabels = [
  "Věková skupina",
  "Oblast",
  "Příznaky",
  "Situace",
  "Výsledek",
];

type Step = "age" | "bodyPart" | "symptoms" | "context" | "results";

export default function PatientNavigator({
  topics,
}: {
  topics: PatientGuideSummary[];
}) {
  const [step, setStep] = useState<Step>("age");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomsUnknown, setSymptomsUnknown] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<GuideContext[]>([]);
  const [contextUnknown, setContextUnknown] = useState(false);

  const bodyParts = useMemo(
    () =>
      Array.from(new Set(topics.map((topic) => topic.bodyPart))).sort((a, b) =>
        a.localeCompare(b, "cs"),
      ),
    [topics],
  );
  const areaGuides = useMemo(
    () => topics.filter((topic) => topic.bodyPart === bodyPart),
    [bodyPart, topics],
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

  function chooseAgeGroup(value: AgeGroup | null) {
    setAgeGroup(value);
    setBodyPart(null);
    setSelectedSymptoms([]);
    setSymptomsUnknown(false);
    setSelectedContexts([]);
    setContextUnknown(false);
    setStep("bodyPart");
  }

  function chooseBodyPart(value: string | null) {
    setBodyPart(value);
    setSelectedSymptoms([]);
    setSymptomsUnknown(false);
    setSelectedContexts([]);
    setContextUnknown(false);
    setStep("symptoms");
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
    setSelectedContexts((current) =>
      current.includes(value)
        ? current.filter((context) => context !== value)
        : [...current, value],
    );
  }

  function startOver() {
    setAgeGroup(null);
    setBodyPart(null);
    setSelectedSymptoms([]);
    setSymptomsUnknown(false);
    setSelectedContexts([]);
    setContextUnknown(false);
    setStep("age");
  }

  const currentStep = [
    "age",
    "bodyPart",
    "symptoms",
    "context",
    "results",
  ].indexOf(step);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Průvodce obtížemi
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Odpovězte na několik krátkých otázek a najděte zveřejněné návody
          odpovídající vašemu výběru. Průvodce neurčuje diagnózu ani naléhavost
          stavu a nenahrazuje vyšetření lékařem.
        </p>
      </header>

      <aside
        role="note"
        className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm leading-relaxed text-rose-950"
      >
        <p className="font-bold">Potřebujete akutní pomoc?</p>
        <p className="mt-1">
          Tento průvodce nerozpoznává akutní stavy. Při bezprostředním ohrožení
          života nebo závažném akutním stavu volejte{" "}
          <a className="font-bold underline" href="tel:155">
            155
          </a>{" "}
          nebo{" "}
          <a className="font-bold underline" href="tel:112">
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
            Průvodce zatím nemá dostupné zveřejněné návody, podle kterých by
            mohl nabídnout výsledek.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
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
          <ol
            aria-label="Postup průvodcem"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {stepLabels.map((label, index) => (
              <li
                key={label}
                aria-current={index === currentStep ? "step" : undefined}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                  index === currentStep
                    ? "border-teal-700 bg-teal-50 text-teal-900"
                    : index < currentStep
                      ? "border-teal-200 bg-white text-teal-800"
                      : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <span className="mr-2 text-xs">{index + 1}.</span>
                {label}
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {step === "age" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Koho se obtíže týkají?
                </legend>
                <p className="mt-2 text-sm text-slate-600">
                  Vyberte věkovou skupinu. Přesný věk ani jiné osobní údaje
                  nepotřebujeme.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {ageGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => chooseAgeGroup(group)}
                      className="min-h-14 rounded-xl border border-slate-200 px-4 py-3 text-left font-semibold text-slate-800 transition-colors hover:border-teal-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      {AGE_GROUP_LABELS[group]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => chooseAgeGroup(null)}
                  className="mt-3 min-h-12 rounded-xl border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  Nevím
                </button>
              </fieldset>
            )}

            {step === "bodyPart" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Které oblasti se obtíže týkají?
                </legend>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {bodyParts.map((part) => (
                    <button
                      key={part}
                      type="button"
                      onClick={() => chooseBodyPart(part)}
                      className="min-h-14 rounded-xl border border-slate-200 px-4 py-3 text-left font-semibold text-slate-800 transition-colors hover:border-teal-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      {part}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => chooseBodyPart(null)}
                  className="mt-3 min-h-12 rounded-xl border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  Nevím
                </button>
                {bodyParts.length === 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    Pro tuto věkovou skupinu zatím nejsou zveřejněné návody.
                    Zkuste{" "}
                    <Link
                      href="/navody"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      procházet rady a tipy
                    </Link>
                    .
                  </div>
                )}
              </fieldset>
            )}

            {step === "symptoms" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Které příznaky chcete zohlednit?
                </legend>
                <p className="mt-2 text-sm text-slate-600">
                  Vyberte jeden nebo více příznaků z nabídky v publikovaných
                  návodech. Výběr pouze pomáhá najít odpovídající materiály.
                </p>
                {symptoms.length > 0 ? (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {symptoms.map((symptom) => {
                      const checked = selectedSymptoms.includes(symptom);
                      return (
                        <label
                          key={symptom}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                            checked
                              ? "border-teal-700 bg-teal-50 text-teal-950"
                              : "border-slate-200 text-slate-700 hover:border-teal-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSymptom(symptom)}
                            className="h-4 w-4 accent-teal-700"
                          />
                          {symptom}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Pro tuto oblast zatím nejsou u návodů uvedené konkrétní
                    příznaky. Můžete pokračovat a zobrazit dostupné návody.
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSymptomsUnknown(false);
                      setStep("context");
                    }}
                    disabled={selectedSymptoms.length === 0}
                    className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Pokračovat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptoms([]);
                      setSymptomsUnknown(true);
                      setStep("context");
                    }}
                    className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Nevím nebo zde svůj příznak nevidím
                  </button>
                </div>
              </fieldset>
            )}

            {step === "context" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Souvisí obtíže s některou z těchto situací?
                </legend>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Návody po operaci, zlomenině nebo při sádře zobrazíme jen po
                  výběru odpovídající situace. Můžete zvolit více možností.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {GUIDE_CONTEXTS.map((context) => {
                    const checked = selectedContexts.includes(context);
                    return (
                      <label
                        key={context}
                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                          checked
                            ? "border-teal-700 bg-teal-50 text-teal-950"
                            : "border-slate-200 text-slate-700 hover:border-teal-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleContext(context)}
                          className="h-4 w-4 accent-teal-700"
                        />
                        {GUIDE_CONTEXT_LABELS[context]}
                      </label>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setContextUnknown(false);
                      setStep("results");
                    }}
                    disabled={selectedContexts.length === 0}
                    className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Zobrazit odpovídající návody
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContexts([]);
                      setContextUnknown(false);
                      setStep("results");
                    }}
                    className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Žádná z uvedených situací
                  </button>
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={contextUnknown}
                      onChange={(event) =>
                        setContextUnknown(event.currentTarget.checked)
                      }
                      className="h-4 w-4 accent-teal-700"
                    />
                    Nevím
                  </label>
                </div>
              </fieldset>
            )}

            {step === "results" && (
              <section aria-labelledby="navigator-results-title">
                <p className="text-sm font-semibold text-teal-700">
                  {ageGroup ? AGE_GROUP_LABELS[ageGroup] : "Věk není znám"}
                  {bodyPart ? ` · ${bodyPart}` : ""}
                </p>
                <h2
                  id="navigator-results-title"
                  className="font-serif-display mt-2 text-2xl text-slate-800"
                >
                  Návody podle vašeho výběru
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
                    .
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-4">
                  <Link
                    href="/diagnozy"
                    className="text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
                  >
                    Procházet knihovnu diagnóz
                  </Link>
                  <button
                    type="button"
                    onClick={startOver}
                    className="text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
                  >
                    Začít znovu
                  </button>
                </div>
              </section>
            )}

            {step !== "age" && step !== "results" && (
              <button
                type="button"
                onClick={() => {
                  if (step === "context") setStep("symptoms");
                  else if (step === "symptoms") setStep("bodyPart");
                  else setStep("age");
                }}
                className="mt-6 min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
