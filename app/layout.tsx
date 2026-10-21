import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import { getLatestArticles } from "@/sanity/lib/articles";
import { getLatestPatientGuideSummaries } from "@/sanity/lib/patient-guides";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miloš Barna | Srozumitelně před zákrokem i po něm",
  description:
    "Jsem lékař Miloš Barna. Sdílím srozumitelné informace a praktické pokyny, které vám pomohou před zákrokem i po něm.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [latestArticles, latestTips] = await Promise.all([
    getLatestArticles(),
    getLatestPatientGuideSummaries(),
  ]);

  return (
    <html lang="cs">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteChrome latestArticles={latestArticles} latestTips={latestTips}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
