import { defineField, defineType } from "sanity";

export const guideSection = defineType({
  name: "guideSection",
  title: "Část průvodce",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Nadpis",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().min(10),
    }),
  ],
  preview: {
    select: { title: "heading" },
  },
});
