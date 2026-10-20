import { defineQuery } from "next-sanity";

export const PATIENT_GUIDES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  (isDemo == true || medicalReviewed == true)
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  ageGroups,
  symptoms,
  summary,
  sections[]{heading, text},
  warningSigns,
  isDemo,
  medicalReviewed
}`);

export const PATIENT_GUIDE_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  slug.current == $slug &&
  (isDemo == true || medicalReviewed == true)
][0] {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  ageGroups,
  symptoms,
  summary,
  sections[]{heading, text},
  warningSigns,
  isDemo,
  medicalReviewed
}`);

export const PATIENT_GUIDE_SUMMARIES_QUERY = defineQuery(`*[
  _type == "patientGuide" &&
  defined(slug.current) &&
  (isDemo == true || medicalReviewed == true)
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  bodyPart,
  symptoms,
  summary
}`);

export const ARTICLES_QUERY = defineQuery(`*[
  _type == "article" &&
  medicalReviewed == true &&
  defined(slug.current)
] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt
}`);

export const ARTICLE_QUERY = defineQuery(`*[
  _type == "article" &&
  medicalReviewed == true &&
  slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  body
}`);
