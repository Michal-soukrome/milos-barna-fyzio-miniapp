"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Úvod" },
  { href: "/navody", label: "Pokyny" },
  { href: "/clanky", label: "Články" },
  { href: "/o-lekari", label: "O mně" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
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

  if (isStudio) {
    return <div className="min-h-screen">{children}</div>;
  }

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-slate-800 text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 md:py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold">
              +
            </div>
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-100 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 md:hidden"
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          {/* Desktop nav */}
          <nav
            aria-label="Hlavní navigace"
            className="hidden items-center gap-2 text-sm md:flex"
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

        {/* Mobile nav panel */}
        <nav
          id="main-nav"
          aria-label="Hlavní navigace"
          className={`border-t border-slate-700 md:hidden ${
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-xs leading-relaxed text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>MUDr. Barna Miloš, Ph.D. - oficiální webové stránky</span>
          <div className="flex flex-col gap-2 sm:items-end">
            <a
              href="https://www.barnamedical.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950 sm:min-h-0"
            >
              Barna Medical Praha <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
