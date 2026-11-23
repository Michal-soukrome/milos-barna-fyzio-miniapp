import type { Metadata, Viewport } from "next";
import Layout from "@/components/Layout";
import { getLatestDiagnoses } from "@/sanity/lib/diagnoses";
import { getLatestPatientGuideSummaries } from "@/sanity/lib/patient-guides";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miloš Barna | Srozumitelně před zákrokem i po něm",
  description:
    "Jsem lékař Miloš Barna. Sdílím srozumitelné informace a praktické pokyny, které vám pomohou před zákrokem i po něm.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [diagnosesResult, tipsResult] = await Promise.allSettled([
    getLatestDiagnoses(),
    getLatestPatientGuideSummaries(),
  ]);
  const latestDiagnoses =
    diagnosesResult.status === "fulfilled" ? diagnosesResult.value : [];
  const latestTips = tipsResult.status === "fulfilled" ? tipsResult.value : [];

  if (diagnosesResult.status === "rejected") {
    console.error(
      "Could not load optional footer diagnoses.",
      diagnosesResult.reason,
    );
  }
  if (tipsResult.status === "rejected") {
    console.error("Could not load optional footer guides.", tipsResult.reason);
  }

  return (
    <html lang="cs">
      <body className="flex min-h-screen flex-col antialiased">
        <Layout latestDiagnoses={latestDiagnoses} latestTips={latestTips}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
