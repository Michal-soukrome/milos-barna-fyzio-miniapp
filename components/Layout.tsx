"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  LatestDiagnosisSummary,
  LatestPatientGuideSummary,
} from "@/sanity/lib/types";

const navigation = [
  { href: "/", label: "Úvod" },
  { href: "/navody", label: "Rady a tipy" },
  { href: "/pruvodce", label: "Průvodce" },
  { href: "/diagnozy", label: "Diagnózy" },
  { href: "/o-lekari", label: "O mně" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Layout({
  children,
  latestDiagnoses,
  latestTips,
}: {
  children: React.ReactNode;
  latestDiagnoses: LatestDiagnosisSummary[];
  latestTips: LatestPatientGuideSummary[];
}) {
  const pathname = usePathname();
  const isStudio = pathname === "/studio" || pathname.startsWith("/studio/");
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu after navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Lock background scroll while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // If the viewport becomes desktop-sized (rotation, resize), reset the menu
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (isStudio) {
    return <div className="min-h-screen">{children}</div>;
  }

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-screen flex-col">
      {/* Dimmed backdrop behind the mobile menu; click to close */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <header className="sticky top-0 z-40 bg-slate-800 text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-bold tracking-[0.12em] text-teal-200 sm:text-sm sm:tracking-[0.18em]">
                MUDr. Barna Miloš, Ph.D.
              </div>
              <div className="truncate text-xs text-slate-300">
                Srozumitelně před zákrokem i po něm
              </div>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-100 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 lg:hidden"
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="h-6 w-6" />
            ) : (
              <Menu aria-hidden="true" className="h-6 w-6" />
            )}
          </button>

          {/* Desktop nav */}
          <nav
            aria-label="Hlavní navigace"
            className="hidden items-center gap-2 text-sm lg:flex"
          >
            {navigation.map(({ href, label }) => {
              const isActive = isActiveLink(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-700 text-teal-200"
                      : "text-slate-100 hover:bg-slate-700 hover:text-teal-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile nav panel: floats under the header instead of pushing the page */}
        <nav
          id="main-nav"
          aria-label="Hlavní navigace"
          className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-700 bg-slate-800 shadow-xl lg:hidden ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <ul className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-8">
            {navigation.map(({ href, label }) => {
              const isActive = isActiveLink(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-lg px-4 text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-slate-700 text-teal-200"
                        : "text-slate-100 hover:bg-slate-700 hover:text-teal-200"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-700 bg-slate-800 text-slate-100">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <Link href="/" className="inline-flex flex-col">
              <span className="text-sm font-bold tracking-[0.16em] text-teal-200">
                MUDr. Barna Miloš, Ph.D.
              </span>
              <span className="mt-1 text-sm text-slate-300">
                Srozumitelně před zákrokem i po něm
              </span>
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <nav aria-label="Navigace v zápatí">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
                Rychlé odkazy
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {navigation.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActiveLink(href) ? "page" : undefined}
                      className="text-sm text-slate-300 transition-colors hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
                Diagnózy
              </h2>
              {latestDiagnoses.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {latestDiagnoses.map((diagnosis) => (
                    <li key={diagnosis._id}>
                      <Link
                        href={`/diagnozy/${diagnosis.slug}`}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-200 hover:underline"
                      >
                        {diagnosis.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/diagnozy"
                      className="text-sm text-slate-300 underline transition-colors hover:text-teal-200"
                    >
                      Zobrazit vše
                    </Link>
                  </li>
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Odborně zkontrolované diagnózy se zde zobrazí po zveřejnění.
                </p>
              )}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
                Nejnovější rady a tipy
              </h2>
              {latestTips.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {latestTips.map((tip) => (
                    <li key={tip._id}>
                      <Link
                        href={`/navody/${tip.slug}`}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-200 hover:underline"
                      >
                        {tip.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/navody"
                      className="text-sm text-slate-300 underline transition-colors hover:text-teal-200"
                    >
                      Zobrazit vše
                    </Link>
                  </li>
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Zatím nejsou zveřejněné žádné pokyny.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700">
          <p className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-slate-400 sm:px-8">
            MUDr. Barna Miloš, Ph.D. · Oficiální webové stránky
          </p>
        </div>
      </footer>
    </div>
  );
}
