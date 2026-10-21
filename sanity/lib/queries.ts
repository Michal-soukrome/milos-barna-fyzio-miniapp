import { defineQuery } from "next-sanity";
import {
  MIN_REVIEWED_BODY_CHARACTERS,
  MIN_REVIEWED_SUMMARY_CHARACTERS,
} from "./reviewed-content";

const REVIEWED_SUMMARY_GUARD = `
  defined(summary) &&
  string::length(summary) >= ${MIN_REVIEWED_SUMMARY_CHARACTERS} &&
  !(summary match "*bude doplněn*") &&
  !(summary match "*budou doplněny*")
`;

const REVIEWED_BODY_GUARD = `
  defined(body) &&
  string::length(pt::text(body)) >= ${MIN_REVIEWED_BODY_CHARACTERS} &&
  !(pt::text(body) match "*bude doplněn*") &&
  !(pt::text(body) match "*budou doplněny*")
`;

const REVIEWED_GUIDE_GUARD = `
  ${REVIEWED_SUMMARY_GUARD} &&
  defined(bodyPart) &&
  count(ageGroups) > 0 &&
  count(contexts) > 0 &&
  count(symptoms) > 0 &&
  string::length(array::join(warningSigns, " ")) >= ${MIN_REVIEWED_SUMMARY_CHARACTERS} &&
  !(array::join(warningSigns, " ") match "*budou doplněny*") &&
  (
    (${REVIEWED_BODY_GUARD}) ||
    (
      count(sections[defined(text)]) > 0 &&
      string::length(array::join(sections[defined(text)].text, " ")) >= ${MIN_REVIEWED_BODY_CHARACTERS} &&
      !(array::join(sections[defined(text)].text, " ") match "*bude doplněn*") &&
      !(array::join(sections[defined(text)].text, " ") match "*budou doplněny*")
    )
  )
`;

const REVIEWED_DIAGNOSIS_GUARD = `
  ${REVIEWED_SUMMARY_GUARD} &&
  defined(bodyPart) &&
  (${REVIEWED_BODY_GUARD})
`;

const REVIEWED_ARTICLE_GUARD = `
  defined(bodyPart) &&
  defined(publishedAt) &&
  defined(excerpt) &&
  string::length(excerpt) >= ${MIN_REVIEWED_SUMMARY_CHARACTERS} &&
  !(excerpt match "*bude doplněn*") &&
  !(excerpt match "*budou doplněny*") &&
  (${REVIEWED_BODY_GUARD})
`;

export const PATIENT_GUIDES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true &&
  (${REVIEWED_GUIDE_GUARD})
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  ageGroups,
  contexts,
  symptoms,
  summary,
  warningSigns,
  reviewed
}`);

export const PATIENT_GUIDE_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  slug.current == $slug &&
  reviewed == true &&
  (${REVIEWED_GUIDE_GUARD})
][0] {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  ageGroups,
  contexts,
  symptoms,
  summary,
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
  warningSigns,
  reviewed
}`);

export const PATIENT_GUIDE_SUMMARIES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true &&
  (${REVIEWED_GUIDE_GUARD})
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  ageGroups,
  contexts,
  symptoms,
  summary,
  reviewed
}`);

export const ARTICLES_QUERY = defineQuery(`*[
  _type == "article" &&
  reviewed == true &&
  defined(slug.current) &&
  (${REVIEWED_ARTICLE_GUARD})
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
  defined(slug.current) &&
  (${REVIEWED_DIAGNOSIS_GUARD})
] | order(bodyPart asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  summary
}`);

export const DIAGNOSIS_QUERY = defineQuery(`*[
  _type == "diagnosis" &&
  reviewed == true &&
  defined(slug.current) &&
  (${REVIEWED_DIAGNOSIS_GUARD}) &&
  slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  summary,
  body,
  "relatedDiagnoses": *[
    _type == "diagnosis" &&
    reviewed == true &&
    defined(slug.current) &&
    (${REVIEWED_DIAGNOSIS_GUARD}) &&
    bodyPart == ^.bodyPart &&
    slug.current != ^.slug.current
  ] | order(title asc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    bodyPart,
    summary
  }
}`);

export const LATEST_DIAGNOSES_QUERY = defineQuery(`*[
  _type == "diagnosis" &&
  reviewed == true &&
  defined(slug.current) &&
  (${REVIEWED_DIAGNOSIS_GUARD})
] | order(_createdAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current
}`);

export const LATEST_PATIENT_GUIDES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  reviewed == true &&
  (${REVIEWED_GUIDE_GUARD})
] | order(_createdAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current
}`);

export const ARTICLE_QUERY = defineQuery(`*[
  _type == "article" &&
  reviewed == true &&
  slug.current == $slug &&
  (${REVIEWED_ARTICLE_GUARD})
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
