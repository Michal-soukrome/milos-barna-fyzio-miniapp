import { defineField, defineType } from "sanity";
import {
  ArticleSlugInput,
  createUniqueArticleSlug,
} from "./ArticleSlugInput";
import { ARTICLE_BODY_PARTS } from "../lib/article-taxonomy";
import { getReviewedContentIssues } from "../lib/reviewed-content";
import { ReviewedInput } from "./ReviewedInput";

export const article = defineType({
  name: "article",
  title: "Vzdělávací článek",
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
      components: { input: ArticleSlugInput },
      options: {
        source: "title",
        slugify: (input, _schemaType, context) => {
          const documentId =
            !Array.isArray(context.parent) &&
            typeof context.parent._id === "string"
              ? context.parent._id
              : undefined;

          return createUniqueArticleSlug(
            input,
            context.getClient({ apiVersion: "2026-10-20" }),
            documentId,
          );
        },
        maxLength: 96,
        aiAssist: { exclude: true },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyPart",
      title: "Oblast těla",
      description:
        "Hlavní oblast, podle které se článek zařadí v přehledu zdravotních témat.",
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
      name: "excerpt",
      title: "Krátký úvod",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(20).max(300),
    }),
    defineField({
      name: "categories",
      title: "Kategorie",
      description:
        "Používejte stejné kategorie u článků, které spolu tematicky souvisejí.",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.unique().max(10),
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
      name: "reviewed",
      title: "Lékařsky zkontrolováno",
      description:
        "Po kontrole celého článku MUDr. Milošem Barnou zapněte pro zveřejnění článku na webu. Úprava obsahu příznak automaticky vypne.",
      type: "boolean",
      initialValue: false,
      options: { aiAssist: { exclude: true } },
      components: { input: ReviewedInput },
      validation: (rule) =>
        rule.required().custom((value, context) => {
          if (value !== true) return true;
          const issues = getReviewedContentIssues("article", context.document);
          return issues.length > 0 ? issues.join(" ") : true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      bodyPart: "bodyPart",
    },
    prepare({ title, subtitle, bodyPart }) {
      const publishedDate = subtitle
        ? new Date(subtitle).toLocaleDateString("cs-CZ")
        : "Datum nezadáno";

      return {
        title: title || "Článek bez názvu",
        subtitle: [bodyPart, publishedDate].filter(Boolean).join(" · "),
      };
    },
  },
});
