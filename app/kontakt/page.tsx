import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "Kontakt | Miloš Barna",
  description: "Jak se se mnou spojit.",
};

const contactDetails = [
  { label: "Adresa", value: "[Doplnit]" },
  { label: "Telefon", value: "[Doplnit]" },
  { label: "E-mail", value: "[Doplnit]" },
  {
    label: "Další odkazy",
    value: "[Doplnit]",
  },
];

export default function ContactPage() {
  return (
    <PageContainer>
      <section>
        <header>
          <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
            Kontakt
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Potřebujete se na něco zeptat?
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {contactDetails.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <dt className="text-sm font-bold text-slate-800">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </header>
      </section>
    </PageContainer>
  );
}
