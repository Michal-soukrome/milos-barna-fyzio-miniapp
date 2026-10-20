import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt na ordinaci | MUDr. Barna Miloš, Ph.D.",
  description: "Kontaktní informace ordinace MUDr. Barna Miloš, Ph.D.",
};

const contactDetails = [
  { label: "Adresa ordinace", value: "[Doplnit adresu ordinace.]" },
  { label: "Telefon", value: "[Doplnit veřejné telefonní číslo.]" },
  { label: "E-mail", value: "[Doplnit veřejnou kontaktní e-mailovou adresu.]" },
  {
    label: "Profesní profily",
    value: "[Doplnit ověřené odkazy na profesní profily a webové stránky.]",
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          Spojení s ordinací
        </p>
        <h1 className="font-serif-display mt-2 text-4xl leading-tight text-slate-800">
          Kontakt
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Kontaktní údaje budou doplněny po jejich ověření a schválení ke
          zveřejnění.
        </p>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          {contactDetails.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <dt className="text-sm font-bold text-slate-800">{item.label}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
