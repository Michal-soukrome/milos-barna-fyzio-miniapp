import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miloš Barna | Srozumitelně před zákrokem i po něm",
  description:
    "Jsem lékař Miloš Barna. Sdílím srozumitelné informace a praktické pokyny, které vám pomohou před zákrokem i po něm.",
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
