"use client";

import { useState } from "react";
import Link from "next/link";
import type { PatientGuide } from "@/sanity/lib/types";

type FlowOption = { label: string; answer: string; urgent?: boolean };

type FlowQuestion = {
  prompt: string;
  details?: string[];
  options: FlowOption[];
};

type FlowAnswer = {
  prompt: string;
  choice: string;
  answer: string;
};

const BARNA_MEDICAL_REHABILITATION_URL =
  "https://www.barnamedical.cz/sluzby/lecba/rehabilitace-po-urazech-a-operaci";
const BARNA_MEDICAL_CONTACT_URL = "https://www.barnamedical.cz/kontakt";

function formatAnswerCount(count: number) {
  const plural = new Intl.PluralRules("cs-CZ").select(count);
  const label =
    plural === "one" ? "odpověď" : plural === "few" ? "odpovědi" : "odpovědí";
  return `${count} ${label}`;
}

function getBarnaMedicalLink(slug: string) {
  if (slug === "post-op-wound-care") {
    return {
      href: BARNA_MEDICAL_CONTACT_URL,
      label: "Kontaktovat Barna Medical",
    };
  }

  return {
    href: BARNA_MEDICAL_REHABILITATION_URL,
    label: "Rehabilitace po úrazech a operaci",
  };
}

export default function PatientConfigurator({
  topic,
}: {
  topic: PatientGuide;
}) {
  const questions: FlowQuestion[] = [
    ...(!topic.isDemo
      ? [
          {
            prompt: "Týká se vás některý z těchto varovných příznaků?",
            details: topic.warningSigns,
            options: [
              {
                label: "Ano, některý z těchto příznaků mám",
                answer: topic.warningSigns.join(" "),
                urgent: true,
              },
              {
                label: "Ne, mohu pokračovat",
                answer:
                  "Podle vašich odpovědí můžete pokračovat k běžným pokynům.",
              },
            ],
          },
        ]
      : []),
    ...topic.sections.map((section) => ({
      prompt: `Potřebujete informace k tématu „${section.heading}"?`,
      options: [
        { label: "Ano, zobrazit odpověď", answer: section.text },
        { label: "Ne, přeskočit", answer: "Tuto část jsme přeskočili." },
      ],
    })),
  ];

  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<FlowOption | null>(null);
  const [answers, setAnswers] = useState<FlowAnswer[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);

  const barnaMedicalLink = getBarnaMedicalLink(topic.slug);
  const question = questions[step];
  const isComplete = step >= questions.length;

  function chooseOption(option: FlowOption) {
    setSelectedOption(option);
  }

  function continueFlow() {
    if (!selectedOption) return;
    setAnswers((current) => [
      ...current.slice(0, step),
      {
        prompt: question.prompt,
        choice: selectedOption.label,
        answer: selectedOption.answer,
      },
    ]);
    if (selectedOption.urgent) {
      setIsUrgent(true);
      return;
    }
    setSelectedOption(null);
    setStep((current) => current + 1);
  }

  function goBack() {
    if (step === 0) return;
    const previousStep = step - 1;
    const previousAnswer = answers[previousStep];
    setStep(previousStep);
    setSelectedOption(
      previousAnswer
        ? (questions[previousStep].options.find(
            (option) => option.label === previousAnswer.choice,
          ) ?? null)
        : null,
    );
  }

  function restart() {
    setStep(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsUrgent(false);
  }

  if (isUrgent) {
    return (
      <section
        role="alert"
        className="mt-8 rounded-2xl border border-rose-300 bg-rose-50 p-5 sm:p-6"
      >
        <h2 className="font-serif-display text-2xl text-rose-900">
          Nepokračujte v tomto průvodci
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Pokud se vás některý z uvedených příznaků týká, kontaktujte ordinaci.
          Tento online průvodce nenahrazuje individuální lékařské posouzení.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-700">
          {topic.warningSigns.map((warning, index) => (
            <li key={`${warning}-${index}`}>{warning}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/kontakt"
            className="inline-flex min-h-11 items-center rounded-xl bg-rose-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-900"
          >
            Kontakty ordinace
          </Link>
          <a
            href={barnaMedicalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-rose-400 px-4 py-2.5 text-sm font-semibold text-rose-900 transition-colors hover:bg-white"
          >
            {barnaMedicalLink.label} <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            onClick={restart}
            className="min-h-11 rounded-xl border border-rose-400 px-4 py-2.5 text-sm font-semibold text-rose-900 transition-colors hover:bg-white"
          >
            Začít znovu
          </button>
        </div>
      </section>
    );
  }

  if (isComplete) {
    return (
      <section aria-live="polite" className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
              Dokončeno
            </p>
            <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
              Vaše odpovědi
            </h2>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            {formatAnswerCount(answers.length)}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {answers.map((answer, index) => (
            <div
              key={`${answer.prompt}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h3 className="font-semibold text-slate-800">{answer.prompt}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-teal-700">
                {answer.choice}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {answer.answer}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
        >
          Zopakovat průchod
        </button>
      </section>
    );
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-8">
      {topic.isDemo && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          V této ukázce nejsou varovné příznaky odborně ověřené, proto je
          průvodce nevyhodnocuje. Následující otázky pouze ukazují výběr částí
          průvodce.
        </p>
      )}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Průvodce
          </p>
          <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
            Průvodce krok za krokem
          </h2>
        </div>
        <span
          aria-label={`Krok ${step + 1} z ${questions.length}`}
          className="text-sm font-semibold text-slate-500"
        >
          {step + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-teal-700 transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-teal-50/50 p-5 sm:p-6">
        <h3
          id="guide-question"
          aria-live="polite"
          className="font-serif-display text-xl leading-tight text-slate-800"
        >
          {question.prompt}
        </h3>
        {question.details && (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-700">
            {question.details.map((detail, index) => (
              <li key={`${detail}-${index}`}>{detail}</li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {question.options.map((option) => {
            const active = selectedOption?.label === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => chooseOption(option)}
                aria-pressed={active}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  active
                    ? option.urgent
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-white text-slate-800 hover:border-teal-600"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div
            className={`mt-5 rounded-xl border p-4 text-sm leading-relaxed ${
              selectedOption.urgent
                ? "border-rose-300 bg-rose-50 text-slate-800"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {selectedOption.urgent && (
              <strong className="mb-1 block text-rose-800">
                Kontaktujte svého lékaře, pokud se vás některý příznak týká.
              </strong>
            )}
            {selectedOption.answer}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              Zpět
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={continueFlow}
            disabled={!selectedOption}
            aria-describedby="guide-question"
            className="min-h-11 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedOption?.urgent
              ? "Zobrazit důležité informace"
              : step === questions.length - 1
                ? "Zobrazit shrnutí"
                : "Pokračovat"}
          </button>
        </div>
      </div>
    </section>
  );
}
