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
        <header className="bg-blue-800 text-white">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
                +
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.18em] text-[#a7dfe2]">
                  ORTHOCARE
                </div>
                <div className="text-xs text-[#bed0d8]">
                  Materiály pro ordinaci
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/configurator"
                className="rounded-lg border border-[#4d7183] px-3 py-2 text-sm font-semibold text-[#d2e6eb] transition-colors hover:border-[#a7dfe2] hover:bg-[#1d465d]"
              >
                Otevřít konfigurátor
              </Link>
              <div className="hidden items-center gap-2 text-sm text-[#bed0d8] sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#72d4bb]" />{" "}
                Připraveno k použití
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-gray-600 bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>OrthoCare · Informační materiály pro pacienty</span>
            <span>V případě nejistoty kontaktujte svou ordinaci.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
