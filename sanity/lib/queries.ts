import { defineQuery } from "next-sanity";

export const PATIENT_GUIDES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  "ageGroups": coalesce(ageGroups, []),
  "contexts": coalesce(contexts, []),
  "symptoms": coalesce(symptoms, []),
  "summary": coalesce(summary, ""),
  "warningSigns": coalesce(warningSigns, []),
  reviewed
}`);

export const PATIENT_GUIDE_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  slug.current == $slug &&
  reviewed == true
][0] {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  "ageGroups": coalesce(ageGroups, []),
  "contexts": coalesce(contexts, []),
  "symptoms": coalesce(symptoms, []),
  "summary": coalesce(summary, ""),
  sections[]{heading, text},
  body[]{
    ...,
    _type == "image" => {
      ...,
      "asset": {
        "_ref": asset._ref,
        "_type": "reference",
        "metadata": asset->metadata{
          "dimensions": dimensions{width, height}
        }
      }
    }
  },
  "warningSigns": coalesce(warningSigns, []),
  reviewed
}`);

export const PATIENT_GUIDE_SUMMARIES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  "ageGroups": coalesce(ageGroups, []),
  "contexts": coalesce(contexts, []),
  "symptoms": coalesce(symptoms, []),
  "summary": coalesce(summary, ""),
  reviewed
}`);

export const ARTICLES_QUERY = defineQuery(`*[
  _type == "article" &&
  reviewed == true &&
  defined(slug.current)
] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  bodyPart,
  categories
}`);

export const DIAGNOSES_QUERY = defineQuery(`*[
  _type == "diagnosis" &&
  reviewed == true &&
  defined(slug.current)
] | order(coalesce(category, bodyPart) asc, title asc, defined(summary) desc, _id asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  "category": coalesce(category, bodyPart),
  summary
}`);

export const DIAGNOSIS_QUERY = defineQuery(`*[
  _type == "diagnosis" &&
  reviewed == true &&
  defined(slug.current) &&
  slug.current == $slug
] | order(defined(category) desc, defined(summary) desc, _id asc)[0] {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  "category": coalesce(category, bodyPart),
  summary,
  body,
  "relatedDiagnoses": *[
    _type == "diagnosis" &&
    reviewed == true &&
    defined(slug.current) &&
    coalesce(category, bodyPart) == coalesce(^.category, ^.bodyPart) &&
    slug.current != ^.slug.current
  ] | order(title asc, defined(category) desc, defined(summary) desc, _id asc) {
    _id,
    title,
    "slug": slug.current,
    bodyPart,
    "category": coalesce(category, bodyPart),
    summary
  }
}`);

export const LATEST_DIAGNOSES_QUERY = defineQuery(`*[
  _type == "diagnosis" &&
  reviewed == true &&
  defined(slug.current)
] | order(_createdAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current
}`);

export const LATEST_PATIENT_GUIDES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true
] | order(_createdAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current
}`);

export const ARTICLE_QUERY = defineQuery(`*[
  _type == "article" &&
  reviewed == true &&
  defined(slug.current) &&
  slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  bodyPart,
  categories,
  body
}`);
