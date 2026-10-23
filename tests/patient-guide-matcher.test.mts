import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  countReachableGuides,
  matchPatientGuides,
  PATIENT_NAVIGATOR_NO_MATCH,
  type PatientGuideAnswers,
} from "../sanity/lib/patient-guide-matcher.ts";
import {
  getSanityContentCacheTags,
  getSanityRevalidationTags,
  isSanityContentSlug,
} from "../sanity/lib/cache-tags.ts";
import { getReviewedContentSignature } from "../sanity/lib/reviewed-content.ts";
import type { PatientGuideSummary } from "../sanity/lib/types.ts";

type FixtureCase = {
  id: string;
  rule: string;
  inputs: PatientGuideAnswers;
  expectedStatus: "match" | "no-match";
  expectedGuideSlugs: string[];
  mustNotAppear: string[];
  approvedBy: string | null;
  approvedOn: string | null;
  uiExpectations?: {
    contactHref: string;
    libraryHref: string;
    emergencyNumbers: string[];
  };
};

type Fixture = {
  approvedBy: string;
  approvedOn: string;
  guides: PatientGuideSummary[];
  cases: FixtureCase[];
};

const fixture = JSON.parse(
  await readFile(
    new URL("./fixtures/configurator-cases.json", import.meta.url),
    "utf8",
  ),
) as Fixture;

test("countReachableGuides agrees with matchPatientGuides on complete answers", () => {
  for (const { inputs } of fixture.cases) {
    if (
      !inputs.ageGroup ||
      !inputs.bodyPart ||
      !inputs.symptoms?.length ||
      !inputs.contexts?.length ||
      inputs.contextUnknown
    ) {
      continue;
    }
    const matched = matchPatientGuides(fixture.guides, inputs);
    assert.equal(
      countReachableGuides(fixture.guides, {
        ageGroup: inputs.ageGroup,
        bodyPart: inputs.bodyPart,
        symptoms: inputs.symptoms,
        contexts: inputs.contexts,
      }),
      matched.status === "match" ? matched.guides.length : 0,
    );
  }
});

test("clinician-approved fixture cases match their expected guide slugs", () => {
  for (const testCase of fixture.cases) {
    assert.equal(
      testCase.approvedBy,
      fixture.approvedBy,
      `${testCase.id} must name the approving clinician`,
    );
    assert.equal(
      testCase.approvedOn,
      fixture.approvedOn,
      `${testCase.id} must record the approval date`,
    );

    const result = matchPatientGuides(fixture.guides, testCase.inputs);
    assert.equal(result.status, testCase.expectedStatus, testCase.id);

    const resultSlugs =
      result.status === "match" ? result.guides.map((guide) => guide.slug) : [];
    assert.deepEqual(resultSlugs, testCase.expectedGuideSlugs, testCase.id);
    for (const excludedSlug of testCase.mustNotAppear) {
      assert.equal(resultSlugs.includes(excludedSlug), false, testCase.id);
    }
  }
});

test("each guide has a positive control and a must-not-appear control", () => {
  for (const guide of fixture.guides) {
    assert.ok(
      fixture.cases.some(
        (testCase) =>
          testCase.expectedStatus === "match" &&
          testCase.expectedGuideSlugs.includes(guide.slug),
      ),
      `${guide.slug} needs a positive control`,
    );
    assert.ok(
      fixture.cases.some((testCase) =>
        testCase.mustNotAppear.includes(guide.slug),
      ),
      `${guide.slug} needs a negative control`,
    );
  }
});

test("no-match guidance keeps clinic, guide-library, and emergency routes", () => {
  const noMatchCase = fixture.cases.find((testCase) => testCase.uiExpectations);
  assert.ok(noMatchCase?.uiExpectations);
  assert.equal(noMatchCase.expectedStatus, "no-match");
  assert.equal(
    noMatchCase.uiExpectations.contactHref,
    PATIENT_NAVIGATOR_NO_MATCH.contactHref,
  );
  assert.equal(
    noMatchCase.uiExpectations.libraryHref,
    PATIENT_NAVIGATOR_NO_MATCH.libraryHref,
  );
  assert.deepEqual(
    noMatchCase.uiExpectations.emergencyNumbers,
    PATIENT_NAVIGATOR_NO_MATCH.emergencyNumbers,
  );
  assert.ok(PATIENT_NAVIGATOR_NO_MATCH.copy.includes("nevylučuje"));
});

test("review reset signatures ignore the flag but track content edits", () => {
  const baseline = getReviewedContentSignature({
    _id: "guide-1",
    _updatedAt: "2026-10-21T10:00:00Z",
    reviewed: true,
    title: "Původní název",
    body: [],
  });
  assert.equal(
    baseline,
    getReviewedContentSignature({
      _id: "guide-1",
      _updatedAt: "2026-10-21T10:05:00Z",
      reviewed: false,
      title: "Původní název",
      body: [],
    }),
  );
  assert.notEqual(
    baseline,
    getReviewedContentSignature({
      _id: "guide-1",
      _updatedAt: "2026-10-21T10:05:00Z",
      reviewed: true,
      title: "Upravený název",
      body: [],
    }),
  );
});

test("Sanity cache tags cover collections and old/new document slugs", () => {
  assert.deepEqual(getSanityContentCacheTags("patientGuide"), [
    "sanity:patient-guides",
  ]);
  assert.deepEqual(getSanityContentCacheTags("patientGuide", "pece-o-sadru"), [
    "sanity:patient-guides",
    "sanity:patient-guide:pece-o-sadru",
  ]);
  assert.deepEqual(
    getSanityRevalidationTags("article", ["old-slug", "new-slug"]),
    ["sanity:articles", "sanity:article:old-slug", "sanity:article:new-slug"],
  );
  assert.equal(isSanityContentSlug("../invalid"), false);
});
