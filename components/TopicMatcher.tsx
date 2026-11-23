"use client";

import Link from "next/link";
import { useState } from "react";
import type { PatientGuideSummary } from "@/sanity/lib/types";
import { findMatchingPatientGuide } from "@/sanity/lib/patient-guide-text";
import { findRedFlag } from "@/sanity/lib/red-flags";

type MatchGuide = Pick<
  PatientGuideSummary,
  "_id" | "title" | "slug" | "bodyPart" | "summary"
>;
type MatchSource = "llm" | "embeddings" | "none";
type AnswerContentKind = "patientGuide" | "diagnosis" | "article";
type AnswerContentReference = {
  kind: AnswerContentKind;
  title: string;
  slug: string;
};
type SearchSource = MatchSource | "local" | "clinic-answer" | "general-answer";
type MatchResponse = {
  urgent?: boolean;
  source: MatchSource;
  guides: MatchGuide[];
};
type AnswerResponse =
  | { source: "none"; reason: "safety" }
  | {
      source: "general-answer";
      answer: string;
    }
  | {
      source: "clinic-answer";
      answer: string;
      content: AnswerContentReference;
    };

export default function TopicMatcher({
  topics,
}: {
  topics: PatientGuideSummary[];
}) {
  const [situation, setSituation] = useState("");
  const [results, setResults] = useState<MatchGuide[]>([]);
  const [noMatchMessage, setNoMatchMessage] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [answerContent, setAnswerContent] =
    useState<AnswerContentReference | null>(null);
  const [answerDeclined, setAnswerDeclined] = useState(false);
  const [source, setSource] = useState<SearchSource | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);

  async function findTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoMatchMessage("");
    setAnswerError("");
    setAiAnswer("");
    setAnswerContent(null);
    setAnswerDeclined(false);
    setSource(null);
    setUrgent(false);
    setResults([]);

    if (findRedFlag(situation)) {
      setUrgent(true);
      setSource("none");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: situation }),
      });
      if (!response.ok) throw new Error("Guide matching is unavailable");

      const data: unknown = await response.json();
      if (!isMatchResponse(data)) {
        throw new Error("Guide matching returned an invalid response");
      }
      if (data.urgent) {
        setUrgent(true);
        setSource("none");
        return;
      }
      setSource(data.source);
      if (data.guides.length === 0) {
        setNoMatchMessage(
          "Nenašli jsme vhodné téma v našich zveřejněných radách. Zkuste popis upřesnit nebo vyberte téma ručně.",
        );
        return;
      }
      setResults(data.guides);
    } catch {
      const localMatch = findMatchingPatientGuide(situation, topics);
      if (localMatch) {
        setResults([localMatch]);
        setSource("local");
      } else {
        setSource("local");
        setNoMatchMessage(
          "Online vyhledávání není dostupné a místní hledání nenašlo vhodné téma.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function requestAiAnswer() {
    setAnswerError("");
    setAiAnswer("");
    setAnswerContent(null);
    setAnswerDeclined(false);
    setNoMatchMessage("");
    setResults([]);
    setSource(null);
    setUrgent(false);
    if (findRedFlag(situation)) {
      setUrgent(true);
      setSource("none");
      setNoMatchMessage("");
      return;
    }

    setAnswerLoading(true);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: situation, mode: "answer" }),
      });
      if (!response.ok) throw new Error("AI answer is unavailable");

      const data: unknown = await response.json();
      if (isRecord(data) && data.urgent === true) {
        setUrgent(true);
        setSource("none");
        setNoMatchMessage("");
        return;
      }
      if (!isAnswerResponse(data)) {
        throw new Error("AI answer returned an invalid response");
      }
      if (data.source === "none") {
        setSource("none");
        setAnswerDeclined(true);
        return;
      }
      setAiAnswer(data.answer);
      setAnswerContent(data.source === "clinic-answer" ? data.content : null);
      setSource(data.source);
    } catch {
      setAnswerError("Vysvětlení se nepodařilo načíst. Zkuste to později.");
    } finally {
      setAnswerLoading(false);
    }
  }

  return (
    <section className="mb-10 rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif-display mt-1 text-2xl text-slate-800">
            Napište, co hledáte
          </h2>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Popište téma nebo situaci a zvolte, zda hledat v našich radách, nebo
        požádat AI o vysvětlení. AI nejprve prohledá zveřejněné pacientské rady,
        diagnózy a články; pokud nenajde vhodný text, může nabídnout obecné
        zdravotní informace. Vyhledávání používá Cloudflare Workers AI, pokud je
        služba nakonfigurovaná; text se odešle na server webu a může být předán
        Cloudflare. Nezadávejte jméno ani jiné údaje, podle kterých vás lze
        určit.
      </p>
      <form onSubmit={findTopic} className="mt-5">
        <label htmlFor="patient-situation" className="sr-only">
          Popište svou situaci
        </label>
        <textarea
          id="patient-situation"
          value={situation}
          onChange={(event) => {
            setSituation(event.target.value);
            setNoMatchMessage("");
            setAiAnswer("");
            setAnswerContent(null);
            setAnswerDeclined(false);
            setAnswerError("");
            setSource(null);
            setUrgent(false);
          }}
          maxLength={500}
          rows={3}
          placeholder="Například: co mohu cvičit po operaci kolene"
          aria-describedby="patient-situation-note"
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        <p id="patient-situation-note" className="sr-only">
          Maximálně 500 znaků. Nezadávejte identifikační údaje.
        </p>
        <p
          id="ai-answer-note"
          className="mt-3 text-xs leading-relaxed text-slate-600"
        >
          AI nejprve hledá ve zveřejněném obsahu kliniky. Obecné vysvětlení,
          pokud je potřeba, vytvoří model a není ověřeno lékařem. Nejde o
          vyhledávání na webu.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={!situation.trim() || loading || answerLoading}
            className="min-h-11 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Vyhledávám…" : "Vyhledat"}
          </button>
          <button
            type="button"
            onClick={requestAiAnswer}
            disabled={!situation.trim() || answerLoading || loading}
            aria-describedby="ai-answer-note"
            className="min-h-11 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-2"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-lg text-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
                <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
              </svg>
            </span>
            {answerLoading ? "Pracuji..." : "Požádat AI o vysvětlení"}
          </button>
        </div>
      </form>
      {urgent && (
        <aside
          role="alert"
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm leading-relaxed text-rose-950"
        >
          <strong>Akutní stav?</strong> Tento nástroj neurčuje naléhavost stavu.
          Při ohrožení života volejte{" "}
          <a className="font-bold underline" href="tel:155">
            155
          </a>{" "}
          nebo{" "}
          <a className="font-bold underline" href="tel:112">
            112
          </a>
          .
        </aside>
      )}
      {noMatchMessage && !urgent && (
        <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-slate-800">
          <p>{noMatchMessage}</p>
        </section>
      )}
      {answerError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-slate-800"
        >
          {answerError}
        </p>
      )}
      {answerDeclined && !urgent && (
        <aside
          role="status"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-slate-800"
        >
          AI nemůže tento dotaz bezpečně zodpovědět. Pokud se týká aktuálních
          potíží nebo úrazu, obraťte se na zdravotnického odborníka. Při
          bezprostředním ohrožení života volejte{" "}
          <a className="font-bold underline" href="tel:155">
            155
          </a>{" "}
          nebo{" "}
          <a className="font-bold underline" href="tel:112">
            112
          </a>
          .
        </aside>
      )}
      {aiAnswer && (
        <article
          className="mt-5 overflow-hidden rounded-xl border border-blue-200 bg-blue-50"
          aria-label={
            answerContent
              ? "Vysvětlení zveřejněného obsahu kliniky vytvořené AI"
              : "Obecné zdravotní informace vytvořené AI"
          }
        >
          <div className="flex items-center gap-2 border-b border-blue-200 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
                <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
              </svg>
            </span>

            <div>
              <h3 className="text-sm font-bold text-blue-950">
                {answerContent
                  ? "Zjednodušené vysvětlení schváleného obsahu"
                  : "Obecné zdravotní informace"}
              </h3>
              <p className="text-xs text-blue-700">
                {answerContent
                  ? "Podle zveřejněného obsahu kliniky"
                  : "Vytvořeno modelem Cloudflare AI"}
              </p>
            </div>

            <span className="ml-auto rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              {answerContent ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
                  <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
                </svg>
              )}
              {answerContent ? "Ověřená rada" : "Vygenerováno AI"}
            </span>
          </div>

          <div className="px-4 py-4 sm:px-5">
            {answerContent && (
              <p className="mb-2 text-sm text-slate-600">
                Zdroj:{" "}
                <Link
                  href={getAnswerContentHref(answerContent)}
                  className="underline underline-offset-4"
                >
                  {answerContent.title}
                </Link>
              </p>
            )}
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
              {aiAnswer}
            </p>
          </div>

          <div className="border-t border-blue-200 bg-blue-100/60 px-4 py-3">
            <p className="text-xs leading-relaxed text-blue-950">
              <strong>Upozornění:</strong>{" "}
              {answerContent
                ? "AI zjednodušila zveřejněný obsah; původní text otevřete přes odkaz výše."
                : "Toto vysvětlení není založené na obsahu kliniky ani ověřené lékařem a může být nepřesné. Nejde o diagnózu ani individuální doporučení."}
            </p>
          </div>
        </article>
      )}
      {results.length > 0 && (
        <section className="mt-5" aria-label="Výsledky z poradny">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
              </span>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Doporučené rady z poradny
                </h3>
                <p className="text-xs text-slate-500">
                  Obsah publikovaný na našem webu
                </p>
              </div>
            </div>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
              Vlastní obsah
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {results.map((result) => (
              <article
                key={result._id}
                className="flex flex-col rounded-xl border border-teal-200 bg-white p-4 transition-colors hover:border-teal-400"
              >
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
                    Publikovaná rada
                  </p>

                  <h4 className="font-serif-display mt-2 text-xl text-slate-800">
                    {result.title}
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {result.summary}
                  </p>
                </div>

                <Link
                  href={`/poradna/${result.slug}`}
                  className="mt-5 inline-flex min-h-11 w-fit items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
                >
                  Přečíst celou radu →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}{" "}
    </section>
  );
}

function isMatchResponse(value: unknown): value is MatchResponse {
  return (
    isRecord(value) &&
    (value.urgent === undefined || typeof value.urgent === "boolean") &&
    (value.source === "llm" ||
      value.source === "embeddings" ||
      value.source === "none") &&
    Array.isArray(value.guides) &&
    value.guides.every(isMatchGuide)
  );
}

function isAnswerResponse(value: unknown): value is AnswerResponse {
  if (!isRecord(value)) return false;
  if (value.source === "none") return value.reason === "safety";
  if (typeof value.answer !== "string") return false;
  if (value.source === "general-answer") return true;

  return (
    value.source === "clinic-answer" &&
    isRecord(value.content) &&
    (value.content.kind === "patientGuide" ||
      value.content.kind === "diagnosis" ||
      value.content.kind === "article") &&
    typeof value.content.title === "string" &&
    typeof value.content.slug === "string"
  );
}

const sourceLabel: Record<SearchSource, string> = {
  llm: "Cloudflare AI: hledání podle významu a výběr jazykovým modelem",
  embeddings: "Cloudflare AI: hledání podle významu",
  local: "místní hledání podle slov (bez AI)",
  none: "Bez výsledku",
  "clinic-answer": "Cloudflare AI: vysvětlení schváleného obsahu kliniky",
  "general-answer": "Cloudflare AI: obecné zdravotní informace",
};

function getAnswerContentHref(content: AnswerContentReference): string {
  switch (content.kind) {
    case "patientGuide":
      return `/poradna/${content.slug}`;
    case "diagnosis":
      return `/diagnozy/${content.slug}`;
    case "article":
      return `/clanky/${content.slug}`;
  }
}

function isMatchGuide(value: unknown): value is MatchGuide {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    typeof value.bodyPart === "string" &&
    typeof value.summary === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
