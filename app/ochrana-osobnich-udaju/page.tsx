import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | Miloš Barna",
  description:
    "Informace o zpracování osobních údajů, analytických cookies a službách používaných na tomto webu.",
};

const sectionClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7";
const headingClass = "font-serif-display text-2xl text-slate-800";
const paragraphClass = "mt-3 text-sm leading-relaxed text-slate-600";
const listClass =
  "mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600";

export default function PrivacyPage() {
  return (
    <PageContainer>
      <article className="space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="font-serif-display text-4xl leading-tight text-slate-800">
            Ochrana osobních údajů
          </h1>
          <p className={paragraphClass}>
            Tento web poskytuje obecné informace pro pacienty. Níže se dozvíte,
            jaké údaje se zpracovávají při jeho používání a jak můžete uplatnit
            svá práva.
          </p>
        </header>

        <section className={sectionClass} aria-labelledby="controller-heading">
          <h2 id="controller-heading" className={headingClass}>
            Správce osobních údajů
          </h2>
          <p className={paragraphClass}>
            Správcem je MUDr. Barna Miloš, Ph.D. Kontaktní údaje pro záležitosti
            ochrany osobních údajů:
          </p>
          <ul className={listClass}>
            <li>Adresa: [Doplnit]</li>
            <li>E-mail: [Doplnit]</li>
          </ul>
        </section>

        <section className={sectionClass} aria-labelledby="data-heading">
          <h2 id="data-heading" className={headingClass}>
            Jaké údaje a proč zpracováváme
          </h2>
          <h3 className="mt-5 font-semibold text-slate-800">
            Provoz a zabezpečení webu
          </h3>
          <p className={paragraphClass}>
            Při návštěvě mohou být v technických a bezpečnostních záznamech
            poskytovatele hostingu zpracovány údaje potřebné k doručení stránky
            a ochraně služby, například IP adresa, čas požadavku, navštívená
            adresa, informace o prohlížeči a zařízení nebo chybové údaje. Účelem
            je provoz, zabezpečení a řešení chyb webu; právním základem je
            oprávněný zájem správce.
          </p>

          <h3 className="mt-5 font-semibold text-slate-800">
            Vyhledávání rad a tipů
          </h3>
          <p className={paragraphClass}>
            Text zadaný do vyhledávače rad se zpracovává pouze ve vašem
            prohlížeči. Web jej neodesílá na server ani do externí služby,
            neukládá jej a nepoužívá k vytváření zdravotních doporučení.
            Nezadávejte do něj jméno ani jiné údaje, podle kterých vás lze
            určit.
          </p>

          <h3 className="mt-5 font-semibold text-slate-800">
            Odeslání odkazu e-mailem
          </h3>
          <p className={paragraphClass}>
            Pokud si vyžádáte zaslání odkazu na konkrétní radu, zpracujeme
            zadanou e-mailovou adresu a označení vybrané rady, abychom
            požadovaný e-mail odeslali. Aplikace neukládá tyto údaje do vlastní
            databáze. E-mail zpracovává poskytovatel Resend; mohou u něj vznikat
            také provozní a doručovací záznamy podle nastavení služby a jeho
            podmínek. Do e-mailu neposíláme váš popis příznaků ani název rady.
          </p>
          <p className={paragraphClass}>
            Právním základem je vyřízení vaší žádosti. Adresu příjemce
            poskytujeme Resend pouze za účelem doručení e-mailu. Nepoužíváme ji
            k zasílání newsletteru ani reklamních sdělení.
          </p>

          <h3 className="mt-5 font-semibold text-slate-800">
            Analytika přes Google Tag Manager
          </h3>
          <p className={paragraphClass}>
            Google Tag Manager bude v produkčním nasazení řídit analytické
            skripty, včetně Google Analytics. Tag Manager ani analytické skripty
            se nenačtou, dokud analytiku výslovně nepovolíte v panelu souhlasu.
            Při souhlasu mohou být zpracovány údaje o používání webu, například
            navštívené stránky, interakce, technické údaje o zařízení a
            prohlížeči a online identifikátory nebo cookies. Právním základem je
            váš souhlas, který můžete kdykoli změnit přes „Nastavení cookies“ v
            zápatí.
          </p>
          <p className={paragraphClass}>
            Volba souhlasu nebo odmítnutí se ukládá v úložišti localStorage
            vašeho prohlížeče, aby se při další návštěvě respektovalo vaše
            rozhodnutí. Toto úložiště neobsahuje vaše jméno ani e-mail. Po
            odmítnutí se analytika nespustí; při odvolání dřívějšího souhlasu
            web aktualizuje stav souhlasu a znovu se načte bez analytického
            skriptu.
          </p>

          <h3 className="mt-5 font-semibold text-slate-800">
            Obsah v systému Sanity
          </h3>
          <p className={paragraphClass}>
            Systém Sanity poskytuje redakční obsah webu. Texty zadané do
            vyhledávače ani e-mailová adresa určená pro zaslání odkazu se do
            Sanity neposílají.
          </p>
        </section>

        <section className={sectionClass} aria-labelledby="recipients-heading">
          <h2 id="recipients-heading" className={headingClass}>
            Kdo může údaje zpracovávat
          </h2>
          <ul className={listClass}>
            <li>
              <strong>Vercel</strong> zajišťuje hosting a bezpečnostní ochranu
              webu, včetně kontroly limitu požadavků při odesílání e-mailu.
            </li>
            <li>
              <strong>Resend</strong> zajišťuje doručení e-mailu, který si
              vyžádáte.
            </li>
            <li>
              <strong>Google</strong> může zpracovávat analytické údaje pouze po
              udělení souhlasu a podle tagů nastavených v Google Tag Manageru.
            </li>
            <li>
              <strong>Sanity</strong> poskytuje redakční obsah; osobní údaje
              zadané návštěvníkem se do něj neposílají.
            </li>
          </ul>
          <p className={paragraphClass}>
            Poskytovatelé mohou údaje zpracovávat podle svých smluvních
            podmínek, bezpečnostních opatření a nastavení služeb. Podle jejich
            konfigurace může dojít také ke zpracování mimo Evropský hospodářský
            prostor; podrobnosti a případné záruky přeshraničního předání
            vyplývají z aktuálních smluv a podmínek jednotlivých poskytovatelů.
          </p>
        </section>

        <section className={sectionClass} aria-labelledby="retention-heading">
          <h2 id="retention-heading" className={headingClass}>
            Doba uchování
          </h2>
          <p className={paragraphClass}>
            Aplikace neuchovává e-mailové adresy použité k jednorázovému
            odeslání odkazu ve vlastní databázi. Záznamy u Vercel a Resend se
            řídí nastavením účtu a pravidly těchto služeb. Analytické údaje
            Google Analytics se uchovávají po dobu nastavenou v příslušné
            analytické službě. Volba cookies zůstává v localStorage, dokud ji
            nezměníte nebo nevymažete data svého prohlížeče.
          </p>
        </section>

        <section className={sectionClass} aria-labelledby="rights-heading">
          <h2 id="rights-heading" className={headingClass}>
            Vaše práva
          </h2>
          <p className={paragraphClass}>
            Podle okolností máte právo požadovat přístup ke svým osobním údajům,
            opravu nebo výmaz, omezení zpracování, vznést námitku nebo získat
            údaje, které jste poskytli. Pokud je zpracování založeno na
            souhlasu, můžete jej kdykoli odvolat; odvolání nemá vliv na
            zpracování před jeho odvoláním.
          </p>
          <p className={paragraphClass}>
            S žádostí se obraťte na správce prostřednictvím kontaktních údajů
            uvedených výše. Máte také právo podat stížnost u{" "}
            <a
              href="https://uoou.gov.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-800 underline underline-offset-4"
            >
              Úřadu pro ochranu osobních údajů
            </a>
            .
          </p>
        </section>
      </article>
    </PageContainer>
  );
}
