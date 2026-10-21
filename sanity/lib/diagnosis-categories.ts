export const DIAGNOSIS_CATEGORIES = [
  { value: "noha-a-hlezno", label: "Noha a hlezno" },
  { value: "koleno", label: "Koleno" },
  { value: "berec-a-lytko", label: "Bérec a lýtko" },
  { value: "kycel", label: "Kyčel" },
  { value: "trisla-a-panev", label: "Třísla a pánev" },
  { value: "bederni-pater", label: "Bederní páteř" },
  { value: "hrudni-pater-a-hrudnik", label: "Hrudní páteř a hrudník" },
  { value: "krcni-pater", label: "Krční páteř" },
  { value: "rameno", label: "Rameno" },
  { value: "paze-a-loket", label: "Paže a loket" },
  { value: "zapesti-a-ruka", label: "Zápěstí a ruka" },
  {
    value: "neurologicke-a-systemove-diagnozy",
    label: "Neurologické a systémové diagnózy",
  },
  {
    value: "pooperacni-a-rehabilitacni-stavy",
    label: "Pooperační a rehabilitační stavy",
  },
  { value: "obecne", label: "Obecné" },
] as const;

export type DiagnosisCategory = (typeof DIAGNOSIS_CATEGORIES)[number]["value"];

export function getDiagnosisCategoryLabel(category?: string | null) {
  return DIAGNOSIS_CATEGORIES.find((item) => item.value === category)?.label;
}
