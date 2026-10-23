import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import PatientNavigator from "@/components/PatientNavigator";
import { getPatientGuideSummaries } from "@/sanity/lib/patient-guides";

export const metadata: Metadata = {
  title: "Průvodce obtížemi | MUDr. Barna Miloš, Ph.D.",
  description:
    "Najděte zveřejněné pacientské rady a tipy podle věkové skupiny, oblasti a příznaků.",
};

export const revalidate = 300;

export default async function PatientGuideFinderPage() {
  const topics = await getPatientGuideSummaries();

  return (
    <PageContainer>
      <PatientNavigator topics={topics} />
    </PageContainer>
  );
}
