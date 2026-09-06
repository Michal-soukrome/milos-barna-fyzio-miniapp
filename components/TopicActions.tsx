"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Topic } from "@/lib/content";

type Tab = "qr" | "email";
type SendState = "idle" | "sending" | "sent" | "error";

export default function TopicActions({ topic }: { topic: Topic }) {
  const [tab, setTab] = useState<Tab>("qr");

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${topic.slug}`
      : `/t/${topic.slug}`;

  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
        {topic.bodyPart}
      </div>
      <h1 className="font-serif-display text-3xl leading-tight text-blue-800">
        {topic.title}
      </h1>
      <p className="mt-2 text-sm text-gray-300">{topic.summary}</p>

      <div className="mt-7 flex gap-1 rounded-xl bg-[var(--navy-soft)] p-1">
        <TabButton active={tab === "qr"} onClick={() => setTab("qr")}>
          Zobrazit QR kód
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => setTab("email")}>
          Poslat e-mailem
        </TabButton>
      </div>

      <div className="mt-5">
        {tab === "qr" ? (
          <QrPane url={url} title={topic.title} />
        ) : (
          <EmailPane topic={topic} />
        )}
      </div>

      <div className="mt-8 rounded-lg border border-gray-600 bg-white px-4 py-3 text-sm text-gray-300">
        Tento materiál poskytuje pouze obecné informace. Nenahrazuje osobní
        vyšetření. V případě nejistoty se ozvěte nebo přijďte znovu.
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
        active ? "bg-white text-blue-600 shadow-sm" : "text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function QrPane({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-600 bg-[var(--bone)] px-4 py-8">
      <QRCodeSVG value={url} size={200} level="M" fgColor="#123247" />
      <p className="mt-4 text-center text-sm text-gray-300">
        Ať si pacient naskenuje kód pro téma &bdquo;{title}&ldquo;.
      </p>
      <p className="mt-1 break-all text-center text-xs text-gray-300">{url}</p>
    </div>
  );
}

function EmailPane({ topic }: { topic: Topic }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          slug: topic.slug,
          title: topic.title,
          origin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Něco se pokazilo při odesílání e-mailu.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setErrorMsg("Nepodařilo se spojit se serverem. Zkontrolujte připojení.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-blue-600 bg-blue-200 px-4 py-6 text-center">
        <p className="font-medium text-blue-600">Odesláno na {email}</p>
        <button
          onClick={() => {
            setState("idle");
            setEmail("");
          }}
          className="mt-3 text-sm text-gray-300 underline"
        >
          Poslat dalšímu pacientovi
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="rounded-2xl border border-gray-600 bg-[var(--bone)] px-4 py-6"
    >
      <label
        className="mb-1 block text-sm text-gray-300"
        htmlFor="patient-email"
      >
        E-mail pacienta
      </label>
      <input
        id="patient-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="pacient@example.com"
        className="w-full rounded-md border border-gray-600 px-3 py-2.5 text-sm outline-none focus-visible:border-blue-600"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-3 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === "sending" ? "Odesílám…" : "Odeslat"}
      </button>
      {state === "error" && (
        <p className="mt-2 text-sm text-ornage-300">{errorMsg}</p>
      )}
    </form>
  );
}
