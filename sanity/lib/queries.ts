import { defineQuery } from "next-sanity";

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
