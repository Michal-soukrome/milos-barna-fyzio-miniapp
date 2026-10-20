import type { Metadata } from "next";
import Console from "@/components/Console";
import { isSanityConfigured } from "@/sanity/lib/client";
import { getPatientGuides } from "@/sanity/lib/patient-guides";

export const metadata: Metadata = {
  title: "Návody | MUDr. Barna Miloš, Ph.D.",
  description: "Přehled pacientských materiálů ordinace.",
};

export const revalidate = 300;

export default async function ClinicLibraryPage() {
  const topics = await getPatientGuides();
  return <Console topics={topics} isSanityConfigured={isSanityConfigured} />;
}
