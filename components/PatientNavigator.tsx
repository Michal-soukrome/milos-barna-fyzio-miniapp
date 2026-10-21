"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AGE_GROUP_LABELS,
  type AgeGroup,
  type PatientGuideSummary,
} from "@/sanity/lib/types";

const ageGroups: AgeGroup[] = ["child", "adult", "senior"];
const stepLabels = ["Věková skupina", "Oblast", "Příznaky", "Výsledek"];

type Step = "age" | "bodyPart" | "symptoms" | "results";

export default function PatientNavigator({
  topics,
}: {
  topics: PatientGuideSummary[];
}) {
  const [step, setStep] = useState<Step>("age");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const ageGuides = useMemo(
    () => topics.filter((topic) => ageGroup && topic.ageGroups.includes(ageGroup)),
    [ageGroup, topics],
  );
  const bodyParts = useMemo(
    () =>
      Array.from(new Set(ageGuides.map((topic) => topic.bodyPart))).sort(
        (a, b) => a.localeCompare(b, "cs"),
      ),
    [ageGuides],
  );
  const areaGuides = useMemo(
    () => ageGuides.filter((topic) => topic.bodyPart === bodyPart),
    [ageGuides, bodyPart],
  );
  const symptoms = useMemo(
    () =>
      Array.from(new Set(areaGuides.flatMap((topic) => topic.symptoms))).sort(
        (a, b) => a.localeCompare(b, "cs"),
      ),
    [areaGuides],
  );
  const matchingGuides = useMemo(
    () =>
      areaGuides
        .map((topic) => ({
          topic,
          matchCount: topic.symptoms.filter((symptom) =>
            selectedSymptoms.includes(symptom),
          ).length,
        }))
        .filter(
          ({ matchCount }) =>
            selectedSymptoms.length === 0 || matchCount > 0,
        )
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(({ topic }) => topic),
    [areaGuides, selectedSymptoms],
  );

  function chooseAgeGroup(value: AgeGroup) {
    setAgeGroup(value);
    setBodyPart(null);
    setSelectedSymptoms([]);
    setStep("bodyPart");
  }

  function chooseBodyPart(value: string) {
    setBodyPart(value);
    setSelectedSymptoms([]);
    setStep("symptoms");
  }

  function toggleSymptom(value: string) {
    setSelectedSymptoms((current) =>
      current.includes(value)
        ? current.filter((symptom) => symptom !== value)
        : [...current, value],
    );
  }

  function startOver() {
    setAgeGroup(null);
    setBodyPart(null);
    setSelectedSymptoms([]);
    setStep("age");
  }

  const currentStep = ["age", "bodyPart", "symptoms", "results"].indexOf(step);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Průvodce potížemi
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
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
              Procházet návody
            </Link>
            <Link
              href="/kontakt"
              className="font-semibold text-teal-800 underline underline-offset-4"
            >
              Kontaktovat ordinaci
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
                  Koho se potíže týkají?
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
              </fieldset>
            )}

            {step === "bodyPart" && (
              <fieldset>
                <legend className="font-serif-display text-2xl text-slate-800">
                  Které oblasti se potíže týkají?
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
                {bodyParts.length === 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    Pro tuto věkovou skupinu zatím nejsou zveřejněné návody.
                    Zkuste{" "}
                    <Link
                      href="/navody"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      procházet všechny návody
                    </Link>{" "}
                    nebo{" "}
                    <Link
                      href="/kontakt"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      kontaktovat ordinaci
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
                    onClick={() => setStep("results")}
                    className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800"
                  >
                    Zobrazit návody
                  </button>
                  {symptoms.length > 0 && selectedSymptoms.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setStep("results")}
                      className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Nevím nebo zde svůj příznak nevidím
                    </button>
                  )}
                </div>
              </fieldset>
            )}

            {step === "results" && (
              <section aria-labelledby="navigator-results-title">
                <p className="text-sm font-semibold text-teal-700">
                  {ageGroup && AGE_GROUP_LABELS[ageGroup]}
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
                  individuální doporučení. Pokud potíže přetrvávají nebo se
                  zhoršují, obraťte se na zdravotníka.
                </p>

                {matchingGuides.length > 0 ? (
                  <ul className="mt-5 divide-y divide-slate-200">
                    {matchingGuides.map((topic) => (
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
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    Nenašli jsme zveřejněný návod odpovídající všem vybraným
                    údajům. To nevylučuje žádné onemocnění.{" "}
                    <Link
                      href="/kontakt"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      Obraťte se na ordinaci
                    </Link>{" "}
                    nebo si{" "}
                    <Link
                      href="/navody"
                      className="font-semibold text-teal-800 underline underline-offset-4"
                    >
                      prohlédněte všechny návody
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
                onClick={() =>
                  setStep(step === "symptoms" ? "bodyPart" : "age")
                }
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
