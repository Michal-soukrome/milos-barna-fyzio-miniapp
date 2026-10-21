import type { Metadata } from "next";
import Console from "@/components/Console";
import { isSanityConfigured } from "@/sanity/lib/client";
import { getPatientGuides } from "@/sanity/lib/patient-guides";

export const metadata: Metadata = {
  title: "Pokyny pro pacienty | MUDr. Barna Miloš, Ph.D.",
  description:
    "Najděte doporučené pokyny pro svou situaci nebo procházejte rady a tipy a cvičení pro pacienty.",
};

export const revalidate = 300;

export default async function ClinicLibraryPage() {
  const topics = await getPatientGuides();
  return <Console topics={topics} isSanityConfigured={isSanityConfigured} />;
}
