import type { Metadata } from "next";
import Console from "@/components/Console";

export const metadata: Metadata = {
  title: "Knihovna ordinace | MUDr. Barna Miloš, Ph.D.",
  description: "Přehled pacientských materiálů ordinace.",
};

export default function ClinicLibraryPage() {
  return <Console />;
}
