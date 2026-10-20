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

const SECTION_PLACEHOLDER =
  "Lékařsky ověřený obsah bude doplněn před zveřejněním.";
const WARNING_PLACEHOLDER =
  "Lékařsky ověřené varovné příznaky budou doplněny před zveřejněním.";

// Replace every placeholder with content reviewed by the doctor before launch.
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
        text: SECTION_PLACEHOLDER,
      },
      {
        heading: "Svědění",
        text: SECTION_PLACEHOLDER,
      },
      {
        heading: "Normální vs. neobvyklý otok",
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
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
        text: SECTION_PLACEHOLDER,
      },
      {
        heading: "Návrat na nohy",
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
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
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
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
        text: SECTION_PLACEHOLDER,
      },
      {
        heading: "Schody",
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
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
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
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
        text: SECTION_PLACEHOLDER,
      },
    ],
    warningSigns: [WARNING_PLACEHOLDER],
  },
];

export const BODY_PARTS = Array.from(new Set(topics.map((t) => t.bodyPart)));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
