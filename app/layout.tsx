import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrthoCare | Ordinace",
  description: "Rychlé informační materiály pro pacienty ordinace",
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
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold">
                +
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.18em] text-teal-200">
                  ORTHOCARE
                </div>
                <div className="text-xs text-slate-300">
                  Materiály pro ordinaci
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/configurator"
                className="rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-teal-300 hover:bg-slate-700"
              >
                Otevřít konfigurátor
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>OrthoCare · Informační materiály pro pacienty</span>
            <span>V případě nejistoty kontaktujte svou ordinaci.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
