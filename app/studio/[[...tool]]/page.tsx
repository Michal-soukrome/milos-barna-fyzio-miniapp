import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/lib/client";

export { metadata, viewport } from "next-sanity/studio";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-serif-display text-3xl text-slate-800">
          Sanity Studio ještě není připojeno
        </h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          Nastavte proměnné NEXT_PUBLIC_SANITY_PROJECT_ID a
          NEXT_PUBLIC_SANITY_DATASET a znovu spusťte aplikaci.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
