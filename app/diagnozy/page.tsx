import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { getDiagnoses } from "@/sanity/lib/diagnoses";
import { isSanityConfigured } from "@/sanity/lib/client";
import { ARTICLE_BODY_PARTS } from "@/sanity/lib/article-taxonomy";
import type { DiagnosisSummary } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Diagnózy | Miloš Barna",
  description:
    "Srozumitelné informace o diagnózách, typech poranění a možnostech léčby.",
};

export const revalidate = 300;

type DiagnosisGroup = {
  key: string;
  label: string;
  diagnoses: DiagnosisSummary[];
};

export default async function DiagnosesPage() {
  const diagnoses = await getDiagnoses();
  const groups = groupDiagnosesByBodyPart(diagnoses);

  return (
    <Layout>
      <section>
        <h1 className="font-serif-display text-3xl leading-tight text-slate-800">
          Diagnózy a možnosti léčby
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
         Základem úspěšné léčby onemocnění a deformit nohy je správné stanovení diagnózy. Nejčastějším důvodem návštěvy ortopedické ambulance je bolest, jejíž charakter a lokalizace mohou napovědět, o jaký problém se jedná. Dalším častým důvodem je změna tvaru nohy (deformita) a obava z jejího dalšího zhoršování.
<br />

Na této stránce najdete přehled nejčastějších diagnóz a obtíží, se kterými pacienti vyhledávají lékařskou péči. Jednotlivé stavy se mohou vzájemně kombinovat a postižení může současně zasahovat více oblastí nohy. Ke stanovení přesné diagnózy je proto nezbytné klinické vyšetření lékařem, které může být podle potřeby doplněno zobrazovacími metodami, například rentgenovým vyšetřením.
        </p>

        {!isSanityConfigured ? (
          <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
            Knihovna diagnóz zatím není připojena k redakčnímu systému.
          </p>
        ) : groups.length > 0 ? (
          <div className="mt-10 space-y-10">
            {groups.map((group) => (
              <section
                key={group.key}
                aria-labelledby={`body-part-${group.key}`}
              >
                <h2
                  id={`body-part-${group.key}`}
                  className="font-serif-display mb-4 text-2xl text-slate-800"
                >
                  {group.label}
                </h2>
                <ul className="grid gap-4 md:grid-cols-2">
                  {group.diagnoses.map((diagnosis) => (
                    <li key={diagnosis._id}>
                      <Link
                        href={`/diagnozy/${diagnosis.slug}`}
                        className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-600 hover:shadow-md"
                      >
                        <h3 className="font-serif-display text-2xl leading-tight text-slate-800 group-hover:text-teal-800 group-hover:underline">
                          {diagnosis.title}
                        </h3>
                        {diagnosis.summary && (
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            {diagnosis.summary}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
            Diagnózy budou zveřejněny po odborném zpracování a lékařské
            kontrole.
          </p>
        )}
      </section>
    </Layout>
  );
}

function groupDiagnosesByBodyPart(diagnoses: DiagnosisSummary[]) {
  const groups: DiagnosisGroup[] = ARTICLE_BODY_PARTS.map(
    ({ value, label }) => ({
      key: value,
      label,
      diagnoses: diagnoses.filter((diagnosis) => diagnosis.bodyPart === value),
    }),
  ).filter((group) => group.diagnoses.length > 0);

  return groups;
}
