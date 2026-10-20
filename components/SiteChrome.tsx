"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Úvod" },
  { href: "/ordinace", label: "Knihovna ordinace" },
  { href: "/pruvodce", label: "Průvodce pro pacienty" },
  { href: "/clanky", label: "Články" },
  { href: "/o-lekari", label: "O lékaři" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname === "/studio" || pathname.startsWith("/studio/");

  if (isStudio) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-slate-800 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold">
              +
            </div>
            <div>
              <div className="text-sm font-bold tracking-[0.18em] text-teal-200">
                MUDr. Barna Miloš, Ph.D.
              </div>
              <div className="text-xs text-slate-300">
                Profil a pacientské materiály
              </div>
            </div>
          </Link>
          <nav
            aria-label="Hlavní navigace"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            {navigation.map(({ href, label }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));
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
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            MUDr. Barna Miloš, Ph.D. · Profil a informační materiály pro
            pacienty
          </span>
          <div className="flex flex-col gap-2 sm:items-end">
            <a
              href="https://www.barnamedical.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
            >
              Barna Medical Praha <span aria-hidden="true">↗</span>
            </a>
            <span>V případě nejistoty kontaktujte svou ordinaci.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
