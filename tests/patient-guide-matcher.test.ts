import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  matchPatientGuides,
  PATIENT_NAVIGATOR_NO_MATCH,
  type PatientGuideAnswers,
} from "../sanity/lib/patient-guide-matcher.ts";
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

test("approved fixture cases match their expected guide slugs", () => {
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
      result.status === "match"
        ? result.guides.map((guide) => guide.slug)
        : [];
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
  const noMatchCase = fixture.cases.find(
    (testCase) => testCase.uiExpectations,
  );
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
});
