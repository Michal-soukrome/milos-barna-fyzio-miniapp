import { defineArrayMember, defineField, defineType } from "sanity";

export const patientGuide = defineType({
  name: "patientGuide",
  title: "Návod pro pacienty",
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
      title: "Adresa návodu",
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
      name: "body",
      title: "Obsah návodu",
      type: "array",
      description:
        "Pište text, přidávejte nadpisy a vkládejte obrázky. U starších návodů se jejich původní text zobrazí, dokud zde nepřidáte nový obsah.",
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
      validation: (rule) =>
        rule.custom((value, context) => {
          if (Array.isArray(value) && value.length > 0) return true;
          return Array.isArray(context.document?.sections) &&
            context.document.sections.length > 0
            ? true
            : "Přidejte text nebo obrázek do obsahu návodu.";
        }),
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
      description: "Doplňte podle obsahu návodu a po odborném ověření.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "reviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Po kontrole všech údajů, textu, obrázků a varovných příznaků MUDr. Milošem Barnou zapněte pro zveřejnění návodu.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
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
        title: title || "Návod bez názvu",
        subtitle: [
          bodyPart,
          reviewed ? "zveřejněno" : "čeká na kontrolu",
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
