import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUDr. Barna Miloš, Ph.D. | Profil a pacientské materiály",
  description:
    "Profesní profil MUDr. Barna Miloš, Ph.D. a informační materiály pro pacienty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="flex min-h-screen flex-col antialiased">
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
              <Link
                href="/"
                className="rounded-lg px-3 py-2 font-semibold text-slate-100 transition-colors hover:bg-slate-700 hover:text-teal-200"
              >
                Ordinace
              </Link>
              <Link
                href="/configurator"
                className="rounded-lg px-3 py-2 font-semibold text-slate-100 transition-colors hover:bg-slate-700 hover:text-teal-200"
              >
                Pro pacienty
              </Link>
              <Link
                href="/about"
                className="rounded-lg px-3 py-2 font-semibold text-slate-100 transition-colors hover:bg-slate-700 hover:text-teal-200"
              >
                O lékaři
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-slate-500 px-3 py-2 font-semibold text-slate-100 transition-colors hover:border-teal-300 hover:bg-slate-700"
              >
                Kontakt
              </Link>
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>
              MUDr. Barna Miloš, Ph.D. · Profil a informační materiály pro
              pacienty
            </span>
            <span>V případě nejistoty kontaktujte svou ordinaci.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
