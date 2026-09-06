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
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
              Dokončeno
            </p>
            <h2 className="font-serif-display mt-1 text-2xl text-blue-800">
              Vaše odpovědi
            </h2>
          </div>
          <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-bold text-blue-400">
            {answers.length} odpovědí
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {answers.map((answer, index) => (
            <div
              key={`${answer}-${index}`}
              className="rounded-xl border border-gray-600 bg-white p-4 text-sm leading-relaxed text-gray-300"
            >
              {answer}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-200"
        >
          Zopakovat průchod
        </button>
      </div>
    );
  }

  return (
    <section className="mt-8 border-t border-gray-600 pt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
            Průvodce
          </p>
          <h2 className="font-serif-display mt-1 text-2xl text-blue-800">
            Projděme si vaše potíže
          </h2>
        </div>
        <span className="text-sm font-semibold text-gray-300">
          {step + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--navy-soft)]">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-gray-600 bg-[var(--bone)] p-5 sm:p-6">
        <h3 className="font-serif-display text-xl leading-tight text-blue-800">
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
                      ? "border-ornage-300 bg-[var(--caution-soft)] text-ornage-300"
                      : "border-blue-600 bg-blue-200 text-blue-400"
                    : "border-gray-600 bg-white text-gray-800 hover:border-blue-600"
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
                ? "border-ornage-300 bg-[var(--caution-soft)] text-gray-800"
                : "border-gray-600 bg-white text-gray-300"
            }`}
          >
            {selectedOption.urgent && (
              <strong className="mb-1 block text-ornage-300">
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
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === questions.length - 1 ? "Zobrazit shrnutí" : "Pokračovat"}
        </button>
      </div>
    </section>
  );
}
