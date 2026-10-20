import { defineArrayMember, defineField, defineType } from "sanity";

export const patientGuide = defineType({
  name: "patientGuide",
  title: "Průvodce pro pacienty",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Název",
      type: "string",
      validation: (rule) => rule.required().min(5).max(120),
    }),
    defineField({
      name: "slug",
      title: "Adresa průvodce",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        aiAssist: { exclude: true },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyPart",
      title: "Oblast těla",
      type: "string",
      options: {
        list: [
          { title: "Obecné", value: "Obecné" },
          { title: "Kotník", value: "Kotník" },
          { title: "Koleno", value: "Koleno" },
          { title: "Zápěstí / ruka", value: "Zápěstí / ruka" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ageGroups",
      title: "Věkové skupiny",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Dítě", value: "child" },
          { title: "Dospělý", value: "adult" },
          { title: "Senior", value: "senior" },
        ],
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "symptoms",
      title: "Vyhledávací výrazy",
      description:
        "Krátká slova a fráze pro vyhledávání a doporučení tématu.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "summary",
      title: "Krátký popis",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(10).max(300),
    }),
    defineField({
      name: "sections",
      title: "Části průvodce",
      type: "array",
      of: [defineArrayMember({ type: "guideSection" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "warningSigns",
      title: "Varovné příznaky",
      description:
        "Doplňte až po odborném ověření. U ukázkového obsahu zůstává text výslovně označen jako neověřený.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "isDemo",
      title: "Veřejná ukázka — neověřeno pro klinické použití",
      description:
        "Ponechte zapnuté, dokud lékař nezkontroluje celý obsah. Veřejná stránka pak zobrazí výrazné upozornění.",
      type: "boolean",
      initialValue: true,
      options: { aiAssist: { exclude: true } },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value === true) return true;

          const document = context.document;
          if (document?.medicalReviewed !== true) {
            return "Před vypnutím ukázkového režimu musí lékař potvrdit odbornou kontrolu.";
          }
          if (
            typeof document.reviewedBy !== "string" ||
            !document.reviewedBy.trim() ||
            typeof document.reviewedAt !== "string" ||
            !document.reviewedAt
          ) {
            return "Vyplňte jméno lékaře a datum odborné kontroly.";
          }
          return true;
        }),
    }),
    defineField({
      name: "medicalReviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Potvrďte až po kontrole všech údajů, částí průvodce i varovných příznaků.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document;
          if (value !== true) {
            return document?.isDemo === true
              ? true
              : "Neukládejte obsah jako klinicky použitelný bez lékařské kontroly.";
          }
          if (document?.isDemo !== false) {
            return "Před potvrzením kontroly vypněte ukázkový režim.";
          }
          if (
            typeof document.reviewedBy !== "string" ||
            !document.reviewedBy.trim() ||
            typeof document.reviewedAt !== "string" ||
            !document.reviewedAt
          ) {
            return "Vyplňte jméno lékaře a datum odborné kontroly.";
          }
          return true;
        }),
    }),
    defineField({
      name: "reviewedBy",
      title: "Kontrolu provedl",
      type: "string",
      options: { aiAssist: { exclude: true } },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.medicalReviewed !== true) return true;
          return typeof value === "string" && value.trim()
            ? true
            : "Vyplňte jméno lékaře, který obsah zkontroloval.";
        }),
    }),
    defineField({
      name: "reviewedAt",
      title: "Datum odborné kontroly",
      type: "date",
      options: { aiAssist: { exclude: true } },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.medicalReviewed !== true) return true;
          return typeof value === "string" && value
            ? true
            : "Vyplňte datum odborné kontroly.";
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      bodyPart: "bodyPart",
      isDemo: "isDemo",
      medicalReviewed: "medicalReviewed",
    },
    prepare({ title, bodyPart, isDemo, medicalReviewed }) {
      return {
        title: title || "Průvodce bez názvu",
        subtitle: [
          bodyPart,
          isDemo ? "ukázka" : medicalReviewed ? "zkontrolováno" : "čeká na kontrolu",
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
