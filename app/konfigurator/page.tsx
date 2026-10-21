import type { Metadata } from "next";
import Layout from "@/components/Layout";
import PatientNavigator from "@/components/PatientNavigator";
import { getPatientGuideSummaries } from "@/sanity/lib/patient-guides";

export const metadata: Metadata = {
  title: "Průvodce potížemi | MUDr. Barna Miloš, Ph.D.",
  description:
    "Najděte zveřejněné pacientské návody podle věkové skupiny, oblasti a příznaků.",
};

export const revalidate = 300;

export default async function PatientNavigatorPage() {
  const topics = await getPatientGuideSummaries();

  return (
    <Layout>
      <PatientNavigator topics={topics} />
    </Layout>
  );
}
