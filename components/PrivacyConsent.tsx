"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AnalyticsChoice = "granted" | "denied";

const CONSENT_STORAGE_KEY = "milos-barna-analytics-consent-v1";
const GTM_SCRIPT_ID = "google-tag-manager";
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";
const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const isGtmConfigured = GTM_CONTAINER_ID_PATTERN.test(GTM_CONTAINER_ID);

const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function PrivacyConsent() {
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const storedChoice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (storedChoice === "granted" || storedChoice === "denied") {
        setChoice(storedChoice);
      }
    } catch {
      setStorageError(true);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (
      !isReady ||
      choice !== "granted" ||
      !isGtmConfigured ||
      document.getElementById(GTM_SCRIPT_ID)
    ) {
      return;
    }

    window.dataLayer ??= [];
    window.gtag ??= (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag("consent", "default", deniedConsent);
    window.gtag("consent", "update", {
      ...deniedConsent,
      analytics_storage: "granted",
    });
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const script = document.createElement("script");
    script.id = GTM_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_CONTAINER_ID)}`;
    document.head.appendChild(script);

    return () => script.remove();
  }, [choice, isReady]);

  function saveChoice(nextChoice: AnalyticsChoice) {
    const wasTrackingEnabled =
      choice === "granted" && Boolean(document.getElementById(GTM_SCRIPT_ID));

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
    } catch {
      setStorageError(true);
      return;
    }

    setStorageError(false);

    if (nextChoice === "denied") {
      disableAnalytics();
    }

    setChoice(nextChoice);
    setSettingsOpen(false);

    if (nextChoice === "denied" && wasTrackingEnabled) {
      window.location.reload();
    }
  }

  const showPanel = isReady && (choice === null || settingsOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="text-xs text-slate-300 underline decoration-slate-500 underline-offset-4 hover:text-white"
      >
        Nastavení cookies
      </button>

      {showPanel && (
        <aside
          aria-labelledby="privacy-consent-title"
          className="privacy-consent-panel fixed z-[70] max-w-3xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl sm:p-6 md:mx-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <h2
              id="privacy-consent-title"
              className="font-serif-display text-xl"
            >
              Soukromí a analytika
            </h2>
            {choice !== null && (
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="absolute top-2 right-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Analytické měření přes Google Tag Manager se spustí pouze po vašem
            souhlasu. Bez souhlasu se analytické skripty nenačtou. Volbu můžete
            později změnit v zápatí webu.
          </p>
          <Link
            href="/ochrana-osobnich-udaju"
            className="mt-2 inline-flex text-sm font-semibold text-teal-800 underline underline-offset-4"
          >
            Podrobnosti o zpracování údajů
          </Link>
          {!isGtmConfigured && (
            <p role="status" className="mt-3 text-sm text-slate-500">
              Analytika není v tomto nasazení nakonfigurována, takže se nyní
              žádný měřicí skript nespustí.
            </p>
          )}
          {storageError && (
            <p
              role="alert"
              className="mt-3 text-sm font-semibold text-rose-700"
            >
              Volbu se nepodařilo uložit. Analytika zůstane vypnutá; povolte
              ukládání v prohlížeči a zkuste to znovu.
            </p>
          )}
          <div className="mt-4 flex flex-wrap md:justify-end gap-3">
            <button
              type="button"
              onClick={() => saveChoice("granted")}
              className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Povolit analytiku
            </button>
            <button
              type="button"
              onClick={() => saveChoice("denied")}
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Odmítnout analytiku
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

function disableAnalytics() {
  window.gtag?.("consent", "update", deniedConsent);
  window.dataLayer?.push({ event: "analytics_consent_denied" });
  document.getElementById(GTM_SCRIPT_ID)?.remove();

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (
      name &&
      (name === "_ga" ||
        name.startsWith("_ga_") ||
        name === "_gid" ||
        name.startsWith("_gat") ||
        name.startsWith("_gcl_"))
    ) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }
}
