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
      <div className="mb-1 text-sm text-[var(--ink-soft)]">
        {topic.bodyPart}
      </div>
      <h1 className="font-serif-display text-2xl leading-tight">
        {topic.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{topic.summary}</p>

      <div className="mt-6 flex gap-1 rounded-lg bg-[var(--clinical-soft)] p-1">
        <TabButton active={tab === "qr"} onClick={() => setTab("qr")}>
          Show QR code
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => setTab("email")}>
          Email to patient
        </TabButton>
      </div>

      <div className="mt-5">
        {tab === "qr" ? (
          <QrPane url={url} title={topic.title} />
        ) : (
          <EmailPane topic={topic} />
        )}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">
        This handout gives general information only. It does not replace an
        in-person evaluation. When in doubt, come back or call the clinic.
      </div>

      <button
        onClick={() => (window.location.href = url)}
        className="mt-4 rounded-md bg-[var(--clinical)] px-4 py-2 text-sm font-medium text-white"
      >
        Navigate to page
      </button>
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
        active
          ? "bg-white text-[var(--clinical)] shadow-sm"
          : "text-[var(--ink-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

function QrPane({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--line)] bg-white px-4 py-6">
      <QRCodeSVG value={url} size={200} level="M" fgColor="#1f2b2e" />
      <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
        Have the patient scan this for &ldquo;{title}&rdquo;.
      </p>
      <p className="mt-1 break-all text-center text-xs text-[var(--ink-soft)]">
        {url}
      </p>
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
        setErrorMsg(data.error || "Something went wrong sending the email.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setErrorMsg("Couldn't reach the server. Check your connection.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-[var(--clinical)] bg-[var(--clinical-soft)] px-4 py-6 text-center">
        <p className="font-medium text-[var(--clinical)]">Sent to {email}</p>
        <button
          onClick={() => {
            setState("idle");
            setEmail("");
          }}
          className="mt-3 text-sm text-[var(--ink-soft)] underline"
        >
          Send to another patient
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="rounded-lg border border-[var(--line)] bg-white px-4 py-5"
    >
      <label
        className="mb-1 block text-sm text-[var(--ink-soft)]"
        htmlFor="patient-email"
      >
        Patient&apos;s email
      </label>
      <input
        id="patient-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="patient@example.com"
        className="w-full rounded-md border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus-visible:border-[var(--clinical)]"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-3 w-full rounded-md bg-[var(--clinical)] py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      {state === "error" && (
        <p className="mt-2 text-sm text-[var(--caution)]">{errorMsg}</p>
      )}
    </form>
  );
}
