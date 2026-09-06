"use client";

import { useState } from "react";
import { Topic } from "@/lib/content";

type FlowQuestion = {
  prompt: string;
  options: { label: string; answer: string; urgent?: boolean }[];
};

export default function PatientConfigurator({ topic }: { topic: Topic }) {
  const questions: FlowQuestion[] = [
    {
      prompt: "Máte některý z těchto varovných příznaků?",
      options: [
        {
          label: "Ano, chci je zkontrolovat",
          answer: topic.warningSigns.join(" "),
          urgent: true,
        },
        {
          label: "Ne, mohu pokračovat",
          answer: "Podle vašich odpovědí můžete pokračovat k běžným pokynům.",
        },
      ],
    },
    ...topic.sections.map((section) => ({
      prompt: `Potřebujete informace k tématu „${section.heading}"?`,
      options: [
        { label: "Ano, zobrazit odpověď", answer: section.text },
        { label: "Ne, přeskočit", answer: "Tuto část jsme přeskočili." },
      ],
    })),
  ];

  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<
    FlowQuestion["options"][number] | null
  >(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const question = questions[step];
  const isComplete = step >= questions.length;

  function chooseOption(option: FlowQuestion["options"][number]) {
    setSelectedOption(option);
  }

  function continueFlow() {
    if (!selectedOption) return;
    setAnswers((current) => [...current, selectedOption.answer]);
    setSelectedOption(null);
    setStep((current) => current + 1);
  }

  function restart() {
    setStep(0);
    setSelectedOption(null);
    setAnswers([]);
  }

  if (isComplete) {
    return (
      <div className="mt-8">
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
            {answers.length} odpovědí
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {answers.map((answer, index) => (
            <div
              key={`${answer}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600"
            >
              {answer}
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
      </div>
    );
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Průvodce
          </p>
          <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
            Projděme si vaše potíže
          </h2>
        </div>
        <span className="text-sm font-semibold text-slate-500">
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
        <h3 className="font-serif-display text-xl leading-tight text-slate-800">
          {question.prompt}
        </h3>
        <div className="mt-5 flex flex-col gap-2">
          {question.options.map((option) => {
            const active = selectedOption?.label === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => chooseOption(option)}
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

        <button
          type="button"
          onClick={continueFlow}
          disabled={!selectedOption}
          className="mt-5 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === questions.length - 1 ? "Zobrazit shrnutí" : "Pokračovat"}
        </button>
      </div>
    </section>
  );
}
