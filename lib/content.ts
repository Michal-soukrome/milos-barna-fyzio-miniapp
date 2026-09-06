// ---------------------------------------------------------------------------
// Veškerý text pro pacienty je v tomto jediném souboru.
// Pro přidání nebo úpravu tématu stačí upravit pole "topics" níže —
// žádný jiný soubor není potřeba měnit.
// ---------------------------------------------------------------------------

export type AgeGroup = "child" | "adult" | "senior";

export type Topic = {
  slug: string; // použito v URL: /t/<slug>
  title: string; // zobrazeno pacientovi
  bodyPart: string; // např. "Koleno", "Kotník", "Zápěstí / ruka", "Páteř", "Obecné"
  ageGroups: AgeGroup[]; // pro koho platí
  symptoms: string[]; // štítky pro rychlé vyhledávání
  summary: string; // jednořádkový popis v seznamu lékaře
  sections: { heading: string; text: string }[]; // PLACEHOLDER — doplní lékař
  warningSigns: string[]; // "Ihned vyhledejte péči, pokud..." — PLACEHOLDER
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: "Dítě",
  adult: "Dospělý",
  senior: "Senior",
};

// POZNÁMKA: Veškerý text níže je pouze placeholder, aby šla aplikace předvést.
// Před nasazením pro skutečné pacienty je potřeba nahradit "sections" a
// "warningSigns" opravdovými, lékařem ověřenými informacemi.
export const topics: Topic[] = [
  {
    slug: "cast-care",
    title: "Péče o sádru",
    bodyPart: "Obecné",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["sádra", "otok", "svědění"],
    summary: "Jak udržet sádru suchou a čistou, co znamená svědění a otok",
    sections: [
      {
        heading: "Udržení sucha",
        text: "PLACEHOLDER — lékař doplní: jak bezpečně sprchovat/koupat, co dělat, když sádra zvlhne.",
      },
      {
        heading: "Svědění",
        text: "PLACEHOLDER — lékař doplní: proč sádra svědí, co nikdy nestrkat dovnitř.",
      },
      {
        heading: "Normální vs. neobvyklý otok",
        text: "PLACEHOLDER — lékař doplní: jak velký otok prstů je očekávaný.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. prsty zmodrají, jsou studené nebo necitlivé",
      "PLACEHOLDER — např. bolest, která navzdory lékům stále narůstá",
    ],
  },
  {
    slug: "ankle-sprain-rehab",
    title: "Zotavení po podvrtnutí kotníku",
    bodyPart: "Kotník",
    ageGroups: ["adult", "senior"],
    symptoms: ["otok", "modřina", "bolest při chůzi"],
    summary: "Postup RICE, kdy začít zatěžovat nohu, návrat ke sportu",
    sections: [
      {
        heading: "Prvních 48 hodin",
        text: "PLACEHOLDER — lékař doplní: klid, led, komprese, poloha nohy výše.",
      },
      {
        heading: "Návrat na nohy",
        text: "PLACEHOLDER — lékař doplní: očekávaný časový rámec pro zatěžování nohy.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. po 3-4 dnech nelze na nohu vůbec došlápnout",
      "PLACEHOLDER — např. viditelná deformita",
    ],
  },
  {
    slug: "knee-swelling-post-op",
    title: "Otok po operaci kolena",
    bodyPart: "Koleno",
    ageGroups: ["adult", "senior"],
    symptoms: ["otok", "teplo", "po operaci"],
    summary: "Co je po operaci kolena normální vs. příznaky infekce/trombózy",
    sections: [
      {
        heading: "Co je normální",
        text: "PLACEHOLDER — lékař doplní: očekávaný průběh otoku po operaci.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. bolest a otok lýtka jen na jedné straně (možná trombóza)",
      "PLACEHOLDER — např. horečka, šířící se zarudnutí, výtok z rány",
    ],
  },
  {
    slug: "crutches-how-to",
    title: "Bezpečné používání berlí",
    bodyPart: "Obecné",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["berle", "rovnováha", "schody"],
    summary: "Správná výška, technika chůze, schody, jak se vyhnout pádu",
    sections: [
      {
        heading: "Nastavení berlí",
        text: "PLACEHOLDER — lékař doplní: správná výška berlí a poloha rukou.",
      },
      {
        heading: "Schody",
        text: "PLACEHOLDER — lékař doplní: technika 'nahoru se zdravou, dolů s postiženou'.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. necitlivost nebo brnění v rukou či podpaží (tlak berlí)",
    ],
  },
  {
    slug: "post-op-wound-care",
    title: "Péče o operační ránu",
    bodyPart: "Obecné",
    ageGroups: ["adult", "senior"],
    symptoms: ["rána", "obvaz", "po operaci"],
    summary: "Převazy, sprchování, příznaky infekce",
    sections: [
      {
        heading: "Výměna obvazu",
        text: "PLACEHOLDER — lékař doplní: jak často a jak udržet sterilitu.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. narůstající zarudnutí, teplo nebo výtok",
      "PLACEHOLDER — např. horečka nad 38 °C",
    ],
  },
  {
    slug: "wrist-fracture-basics",
    title: "Po zlomenině zápěstí",
    bodyPart: "Zápěstí / ruka",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["zlomenina", "dlaha", "otok"],
    summary: "Péče o dlahu, pohyb prstů, očekávaná doba hojení",
    sections: [
      {
        heading: "Udržování pohyblivosti prstů",
        text: "PLACEHOLDER — lékař doplní: proč je vhodný šetrný pohyb prsty.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — např. prsty blednou nebo znecitliví",
    ],
  },
];

export const BODY_PARTS = Array.from(new Set(topics.map((t) => t.bodyPart)));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
