import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
