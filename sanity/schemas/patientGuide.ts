import { defineArrayMember, defineField, defineType } from "sanity";
import { GUIDE_CONTEXTS, GUIDE_CONTEXT_LABELS } from "../lib/types";
import { ReviewedInput } from "./ReviewedInput";

export const patientGuide = defineType({
  name: "patientGuide",
  title: "Rady a tipy pro pacienty",
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
      title: "Adresa rady",
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
      name: "contexts",
      title: "Situace",
      description:
        "Určuje, pro jakou potvrzenou situaci rada platí; nezaměňujte ji s příznaky.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: GUIDE_CONTEXTS.map((value) => ({
          title: GUIDE_CONTEXT_LABELS[value],
          value,
        })),
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "symptoms",
      title: "Vyhledávací výrazy",
      description:
        "Krátké výrazy pro příznaky nebo potíže. Situace, například po operaci, nastavte samostatně v poli Situace.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "summary",
      title: "Krátký popis",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "body",
      title: "Obsah rady",
      type: "array",
      description:
        "Pište text, přidávejte nadpisy a vkládejte obrázky. U starších rad se jejich původní text zobrazí, dokud zde nepřidáte nový obsah.",
      of: [
        defineArrayMember({
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
        }),
        defineArrayMember({
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
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Starší textové části",
      type: "array",
      hidden: true,
      of: [defineArrayMember({ type: "guideSection" })],
    }),
    defineField({
      name: "warningSigns",
      title: "Varovné příznaky",
      description: "Doplňte podle obsahu rady a po odborném ověření.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "reviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Po odborné kontrole zapněte pro zveřejnění. Každá následná úprava obsahu rady automaticky vypne.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
      components: { input: ReviewedInput },
      validation: (rule) => rule.required(),
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
        title: title || "Rada bez názvu",
        subtitle: [bodyPart, reviewed ? "zveřejněno" : "čeká na kontrolu"]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
