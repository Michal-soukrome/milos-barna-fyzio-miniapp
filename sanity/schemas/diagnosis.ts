import { defineField, defineType } from "sanity";
import { ARTICLE_BODY_PARTS } from "../lib/article-taxonomy";
import { DIAGNOSIS_CATEGORIES } from "../lib/diagnosis-categories";
import { ReviewedInput } from "./ReviewedInput";
import { BlockQuoteStyle } from "./BlockQuoteStyle";
import { validateMedicalReview } from "../lib/reviewed-content";

export const diagnosis = defineType({
  name: "diagnosis",
  title: "Diagnóza",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Název diagnózy",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "category",
      title: "Kategorie",
      description:
        "Kategorie pro seskupení diagnóz v přehledu. U starších diagnóz se použije oblast těla.",
      type: "string",
      options: {
        list: DIAGNOSIS_CATEGORIES.map(({ value, label }) => ({
          title: label,
          value,
        })),
      },
    }),
    defineField({
      name: "slug",
      title: "Adresa diagnózy",
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
        list: ARTICLE_BODY_PARTS.map(({ value, label }) => ({
          title: label,
          value,
        })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Krátký úvod",
      description: "Stručně vysvětlete, čeho se diagnóza týká.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "body",
      title: "Obsah diagnózy",
      description:
        "Pište text, přidávejte nadpisy a vkládejte obrázky mezi jednotlivé části diagnózy.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Odstavec", value: "normal" },
            { title: "Nadpis 2", value: "h2" },
            { title: "Nadpis 3", value: "h3" },
            {
              title: "Citace",
              value: "blockquote",
              component: BlockQuoteStyle,
            },
          ],
          lists: [
            { title: "Odrážky", value: "bullet" },
            { title: "Číslovaný seznam", value: "number" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternativní text",
              description: "Stručně popište, co je na obrázku.",
              type: "string",
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "caption",
              title: "Popisek",
              type: "string",
              validation: (rule) => rule.max(200),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "reviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Po odborné kontrole zapněte pro zveřejnění diagnózy na webu. Každá následná úprava obsahu příznak automaticky vypne.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
      components: { input: ReviewedInput },
      validation: (rule) => rule.required().custom(validateMedicalReview),
    }),
  ],
  preview: {
    select: {
      title: "title",
      bodyPart: "bodyPart",
      reviewed: "reviewed",
    },
    prepare({ title, bodyPart, reviewed }) {
      return {
        title: title || "Diagnóza bez názvu",
        subtitle: [bodyPart, reviewed ? "zveřejněno" : "čeká na kontrolu"]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
