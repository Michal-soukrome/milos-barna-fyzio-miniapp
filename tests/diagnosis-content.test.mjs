import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { evaluate, parse } from "groq-js";
import { DIAGNOSIS_QUERY } from "../sanity/lib/queries.ts";
import { getReviewedContentSignature } from "../sanity/lib/reviewed-content.ts";

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "testproject";
process.env.NEXT_PUBLIC_SANITY_DATASET = "test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/sanity/lib/client") {
      return nextResolve(
        new URL("../sanity/lib/client.ts", import.meta.url).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (
      url.endsWith("/components/MedicalBody.tsx") ||
      url.endsWith("/sanity/schemas/BlockQuoteStyle.tsx")
    ) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
          },
        }).outputText,
      };
    }
    return nextLoad(url, context);
  },
});

const { default: MedicalBody } = await import(
  new URL("../components/MedicalBody.tsx", import.meta.url).href
);
const { BlockQuoteStyle } = await import(
  new URL("../sanity/schemas/BlockQuoteStyle.tsx", import.meta.url).href
);

const paragraph = (key, text) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
});

test("diagnosis query and renderer preserve interleaved text and images", async () => {
  const assetId = "image-abc123-2000x1000-jpg";
  const dataset = [
    {
      _id: "diagnosis-1",
      _type: "diagnosis",
      slug: { current: "example" },
      reviewed: true,
      body: [
        paragraph("one", "First text"),
        {
          _type: "image",
          _key: "image-one",
          asset: { _type: "reference", _ref: assetId },
          alt: "First image",
          caption: "Image caption",
          crop: {
            _type: "sanity.imageCrop",
            left: 0.25,
            right: 0.25,
            top: 0,
            bottom: 0,
          },
        },
        paragraph("two", "Second text"),
        {
          _type: "image",
          _key: "image-two",
          asset: { _type: "reference", _ref: assetId },
          alt: "Second image",
        },
        paragraph("three", "Third text"),
      ],
    },
    {
      _id: assetId,
      _type: "sanity.imageAsset",
      metadata: { dimensions: { width: 2000, height: 1000 } },
    },
  ];
  const result = await evaluate(parse(DIAGNOSIS_QUERY), {
    dataset,
    params: { slug: "example" },
  });
  const diagnosis = await result.get();
  const html = renderToStaticMarkup(
    createElement(MedicalBody, { body: diagnosis.body }),
  );

  assert.match(
    html,
    /First text[\s\S]*alt="First image"[\s\S]*Image caption[\s\S]*Second text[\s\S]*alt="Second image"[\s\S]*Third text/,
  );
  assert.match(html, /alt="First image" width="1000" height="1000"/);
  assert.match(html, /alt="Second image" width="1600" height="800"/);
});

test("text-only content renders and incomplete images show an error", () => {
  const body = [
    paragraph("one", "Existing text"),
    { _type: "image", _key: "broken", alt: "Missing asset" },
    paragraph("two", "More text"),
  ];
  const html = renderToStaticMarkup(createElement(MedicalBody, { body }));
  assert.match(html, /Existing text[\s\S]*role="alert"[\s\S]*More text/);
  assert.doesNotMatch(html, /<img/);
});

test("editing diagnosis images changes its review signature", () => {
  const diagnosis = {
    _type: "diagnosis",
    reviewed: true,
    body: [{ _type: "image", _key: "image", alt: "Before" }],
  };
  const changed = {
    ...diagnosis,
    body: [{ ...diagnosis.body[0], alt: "After" }],
  };
  assert.notEqual(
    getReviewedContentSignature(diagnosis),
    getReviewedContentSignature(changed),
  );
});

test("Studio quote style accepts block-level editor content without invalid nesting", () => {
  const html = renderToStaticMarkup(
    createElement(BlockQuoteStyle, null, createElement("div", null, "Quote")),
  );
  assert.match(html, /^<blockquote\b[^>]*><div>Quote<\/div><\/blockquote>$/);
});
