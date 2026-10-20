import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Pacientský článek",
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
      title: "Adresa článku",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        aiAssist: { exclude: true },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Krátký úvod",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(20).max(300),
    }),
    defineField({
      name: "body",
      title: "Obsah článku",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Odstavec", value: "normal" },
            { title: "Nadpis 2", value: "h2" },
            { title: "Nadpis 3", value: "h3" },
            { title: "Citace", value: "blockquote" },
          ],
          lists: [
            { title: "Odrážky", value: "bullet" },
            { title: "Číslovaný seznam", value: "number" },
          ],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "publishedAt",
      title: "Datum zveřejnění",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      options: { aiAssist: { exclude: true } },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "medicalReviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Potvrďte až po osobní kontrole celého článku. Bez potvrzení se článek na webu nezobrazí a nelze jej publikovat.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value !== true) {
            return "Před publikováním musí lékař potvrdit odbornou kontrolu.";
          }

          const document = context.document;
          if (
            typeof document?.reviewedBy !== "string" ||
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
      description: "Jméno lékaře, který článek odborně zkontroloval.",
      options: { aiAssist: { exclude: true } },
    }),
    defineField({
      name: "reviewedAt",
      title: "Datum odborné kontroly",
      type: "date",
      options: { aiAssist: { exclude: true } },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Článek bez názvu",
        subtitle: subtitle
          ? new Date(subtitle).toLocaleDateString("cs-CZ")
          : "Datum nezadáno",
      };
    },
  },
});
