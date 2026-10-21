import type { Metadata } from "next";
import Layout from "@/components/Layout";
import DiagnosisBrowser, {
  type BrowserGroup,
} from "@/components/DiagnosisBrowser";
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
          Základem úspěšné léčby onemocnění a deformit nohy je správné stanovení
          diagnózy. Nejčastějším důvodem návštěvy ortopedické ambulance je
          bolest, jejíž charakter a lokalizace mohou napovědět, o jaký problém
          se jedná. Dalším častým důvodem je změna tvaru nohy (deformita) a
          obava z jejího dalšího zhoršování.
          <br />
          Na této stránce najdete přehled nejčastějších diagnóz a obtíží, se
          kterými pacienti vyhledávají lékařskou péči. Jednotlivé stavy se mohou
          vzájemně kombinovat a postižení může současně zasahovat více oblastí
          nohy. Ke stanovení přesné diagnózy je proto nezbytné klinické
          vyšetření lékařem, které může být podle potřeby doplněno zobrazovacími
          metodami, například rentgenovým vyšetřením.
        </p>

        {!isSanityConfigured ? (
          <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
            Knihovna diagnóz zatím není připojena k redakčnímu systému.
          </p>
        ) : groups.length > 0 ? (
          <DiagnosisBrowser groups={groups} />
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

// Only the fields the client needs are serialized into the page payload.
function groupDiagnosesByBodyPart(
  diagnoses: DiagnosisSummary[],
): BrowserGroup[] {
  return ARTICLE_BODY_PARTS.map(({ value, label }) => ({
    key: value,
    label,
    diagnoses: diagnoses
      .filter((diagnosis) => diagnosis.bodyPart === value)
      .map(({ _id, slug, title, summary }) => ({
        _id,
        slug,
        title,
        summary,
      })),
  })).filter((group) => group.diagnoses.length > 0);
}
