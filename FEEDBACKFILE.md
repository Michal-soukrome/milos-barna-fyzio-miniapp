# Feedback and pre-launch follow-up

Updated 2026-10-21 to reflect the current implementation and review priorities.

## Completed

- **Matcher privacy:** guide matching runs locally in the browser. Free-text
  descriptions are not sent to the app server or an AI provider. The
  `/api/match` route and OpenAI configuration were removed.
- **Email privacy and abuse controls:** `/api/send` validates the guide against
  reviewed Sanity content, sends a generic subject and link-only message, and
  displays a Resend disclosure. Requests have a 2 KB body limit and a honeypot.
  Vercel Firewall rate-limit enforcement is implemented and fails closed if its
  rule is missing or unavailable.
- **Configurator:** `/konfigurator` is linked in the site navigation. It filters
  published guides by age group, body area, and existing symptom tags; answers
  stay in the browser. It does not diagnose or assess urgency, and keeps 155/112
  emergency contact links visible.
- **Diagnosis details:** related diagnoses appear in a sidebar matching the
  patient-guide detail layout.
- **Formatting:** Prettier is installed and configured to format on save in the
  VS Code workspace.
- **Caching:** published guides and diagnoses use five-minute revalidation.

## Highest-priority follow-up

### 1. Clinician-approved, context-aware configurator matching

The current tags conflate symptoms and situations: selecting “otok” for an
adult knee complaint surfaces “Otok po operaci kolena”; “zlomenina” can surface
after-fracture instructions without confirming a diagnosis. This is a
structural matching issue, not just a copy-edit.

Ask the doctor which distinctions matter. Prefer an explicit array-valued
`contexts` field on guides (rather than symptom tags carrying context), so a
guide can apply to more than one situation. Candidate values may include
`general`, `after-surgery`, `after-fracture`, `in-cast`, `using-crutches`, and
`after-sprain`; the doctor should approve the actual set and assignments. Show
the relevant context on every result.

Treat `Obecné` as a literal body-area value, not as a wildcard. A general-area
guide must not appear for a specific area such as the knee unless the doctor
explicitly approves that cross-area applicability. Store this behavior in the
fixture and test it.

If any required field is “not sure,” do not surface a context-specific guide,
even when other selected fields match. Unless the doctor approves a safe
general result for that exact case, return no-match/contact guidance. When
multiple contexts are selected, any “not sure” selection still blocks
context-specific guides; known contexts may return only guides approved for
those contexts.

The following candidate cases use the six currently published guides and the
age-group, body-area, and symptom tags observed in Sanity on 2026-10-21. They
are **not clinically approved mappings**. The doctor must approve every
expected result before it becomes a patient-facing rule. Every published guide
needs at least one approved positive control and one “must not appear” case.

**Candidate positive controls**

| Guide | Age group | Area | Selected symptom tags | Proposed context | Candidate expected result |
| --- | --- | --- | --- | --- | --- |
| Bezpečné používání berlí | Adult | Obecné | `berle` + `schody` | Using crutches | This guide |
| Otok po operaci kolena | Adult | Koleno | `otok` + `po operaci` | After knee surgery | This guide |
| Po zlomenině zápěstí | Child | Zápěstí / ruka | `zlomenina` + `dlaha` | After confirmed fracture | This guide |
| Péče o operační ránu | Adult | Obecné | `rána` + `obvaz` | After surgery | This guide |
| Péče o sádru | Child | Obecné | `sádra` + `svědění` | In a cast | This guide |
| Zotavení po podvrtnutí kotníku | Adult | Kotník | `modřina` + `bolest při chůzi` | After confirmed sprain | This guide |

**Negative and edge-case controls**

| Case | Age group | Area | Selected symptom tags | Context | Rule tested | Must not surface |
| --- | --- | --- | --- | --- | --- | --- |
| No crutches | Adult | Obecné | `schody` | Not using crutches / not sure | Context gate | Bezpečné používání berlí |
| Broad knee swelling | Adult | Koleno | `otok` | No procedure / not sure | Context gate | Otok po operaci kolena |
| Age filtering | Child | Koleno | `otok` + `po operaci` | After knee surgery | Age filter | Otok po operaci kolena |
| Unconfirmed fracture | Child | Zápěstí / ruka | `zlomenina` + `otok` | Not confirmed / not sure | Not-sure gate | Po zlomenině zápěstí |
| No surgical context | Adult | Obecné | `rána` + `obvaz` | No procedure / not sure | Context gate | Péče o operační ránu |
| General is not a wildcard | Adult | Koleno | `rána` + `obvaz` | After surgery | Exact-area gate | Péče o operační ránu, unless cross-area use is explicitly approved |
| No cast | Adult | Obecné | `otok` | No cast / not sure | Context gate | Péče o sádru |
| Unconfirmed sprain | Adult | Kotník | `modřina` + `bolest při chůzi` | Not sure | Not-sure gate | Zotavení po podvrtnutí kotníku |
| Not-sure age | Not sure | Zápěstí / ruka | `zlomenina` + `dlaha` | After confirmed fracture | Not-sure gate | No context-specific guide; no-match/contact unless a general result is approved |
| Not-sure area | Child | Not sure | `zlomenina` + `dlaha` | After confirmed fracture | Not-sure gate | No context-specific guide; no-match/contact |
| Not-sure symptoms | Child | Zápěstí / ruka | Not sure | After confirmed fracture | Not-sure gate | No context-specific guide; no-match/contact unless a general result is approved |
| Not-sure context | Adult | Koleno | `otok` + `po operaci` | Not sure | Not-sure gate | No context-specific guide; no-match/contact |
| Multiple tags | Adult | Koleno | `otok` + `po operaci` | After knee surgery | Tag intersection / context gate | Doctor to approve the complete result set; unrelated guides must not appear |
| Multiple contexts, one unknown | Adult | General | `rána` + `obvaz` | After surgery + not sure | Not-sure gate | No context-specific guide; no-match/contact |
| Multiple approved contexts | Adult | General | `rána` + `obvaz` | Two known contexts | Context union | Doctor to confirm whether a guide may match both contexts |

The “not sure” cases must be tested independently for age, area, symptoms, and
context—not only as one combined unknown answer. The adult/child contrast above
uses the current Sanity age-group snapshot, where “Otok po operaci kolena” is
published for adults and seniors. Store that age-group snapshot in the fixture
so the test is stable; when Sanity eligibility changes, update the snapshot
and expected behavior only after clinical approval.

The current “Péče o operační ránu” record is tagged for adults and seniors in
area `Obecné`; “Péče o sádru” is tagged for children, adults, and seniors in
area `Obecné`. Preserve those exact values in the test snapshot. Do not infer
that either general-area tag matches every specific body area.

### 2. Keep cases as testable data

The candidate tables should become a machine-readable fixture used by the
matcher tests and renderable as a doctor-review checklist, so the clinical
specification cannot drift from the tests. Each case should include a stable
ID, input fields, expected guide slugs/status, and a one-word rule label such
as `age-filter`, `context-gate`, `not-sure-gate`, `exact-area`, or
`tag-intersection`. Include `approvedBy` and `approvedOn` per case; leave them
`null` until the doctor signs off. Do not treat unapproved candidate cases as
passing clinical rules.

Prefer a discriminated matcher result such as
`{ status: "match", guides: [...] }` or `{ status: "no-match" }` rather than
relying on an empty array whose meaning the UI may accidentally reinterpret.
The no-match status must be enforced in code, not only asserted by tests.

### 3. Define and test the no-match outcome

The no-match state should say that no suitable published guide was found and
that this does not rule out a condition. It should offer an actionable link to
the clinic contact page and, if useful, the full guide library. Keep the
155/112 emergency notice and `tel:` links visible in this state. The contact
page currently has placeholder details, so replace them before relying on that
route with patients.

Add a test that asserts the explicit `no-match` status, no guide result, the
no-match copy, clinic contact link, and visible 155/112 links. A no-match must
never silently fall back to an arbitrary or context-specific guide.

### 4. Validate clinical content before publication

Some published diagnosis entries still lack detailed information. Complete
them or unpublish them before launch. Preserve the agreed single `reviewed`
boolean, but have the doctor approve the required content per document type
before adding validation. Candidate minimums to confirm:

- **Diagnosis:** explanation/meaning, relevant examination, treatment
  options, recovery, and when to seek care; surgery details only when
  applicable.
- **Patient guide:** intended age group and context, clear steps, relevant
  warning signs, and when/how to contact the clinic.
- **Article:** a meaningful summary and complete body with its intended
  audience and clinical scope clear.

Sanity Studio validation alone is not enough: API writes or scripts may bypass
it. Add equivalent completeness conditions to the public GROQ queries so a
document is not exposed solely because `reviewed == true`. Do not rely on
`defined(body)` alone: a Portable Text field can be defined but effectively
empty. Check for text-bearing blocks and a minimum meaningful text length (a
block count alone can also include an empty block). Keep Studio and public
query criteria aligned and test both.

### 5. Reset review state on substantive edits

The agreed Sanity model uses only `reviewed: boolean`; reviewer attribution is
fixed to MUDr. Miloš Barna and there is no review-date field. A substantive edit
can therefore leave the flag true unless the workflow resets it. Prefer an
automatic reset to `false` on substantive edits (for example, a Sanity Function
or Studio document action), while preserving the single-boolean model. Verify
the approach against draft/publish behavior so an edited, no-longer-reviewed
version cannot remain public. A warning banner is a weaker fallback.

### 6. Configure the production Vercel Firewall rule

Create a per-IP rate limit with ID `patient-guide-email` (the README suggests
5 requests per minute). Until configured, email sending fails closed with
`503`.

## Legal, privacy, and operational follow-up

- Prepare an accurate privacy notice and confirm clinic-operator details,
  Resend data handling/retention, and any required data-processing agreement
  before using email delivery with patients. The matcher no longer sends
  symptom descriptions to an external provider.
- Replace remaining placeholder biography and clinic contact details, and
  review medical disclaimers and healthcare-advertising requirements with the
  appropriate professional adviser.
- Confirm the emergency wording with the clinic for Czech patients: 155 for
  the medical emergency service and 112 as the general emergency number.
  Verify both `tel:` links on mobile.

## Additional engineering and product improvements

- Add automated regression tests for the doctor-approved positive, negative,
  multi-tag, age-filtering, not-sure, general-area, and no-match cases above,
  plus `/api/send` validation. The production build and manual browser/endpoint
  checks have passed, but there is no dedicated test script.
- Run `npm audit --omit=dev` and understand runtime findings before launch. The
  latest npm install reported 18 audit findings (9 moderate and 9 high); that
  full count may include development/build dependencies.
- Add a signed Sanity webhook with targeted revalidation for affected guides
  and diagnoses. Handle unpublish and delete events explicitly, and include
  document type plus both old and new slugs where available so renamed or
  removed content is invalidated. Five-minute revalidation currently permits a
  correction or unpublish to remain stale for up to five minutes; near-immediate
  revalidation is preferred for medical corrections.
- Complete a site-wide accessibility review, including contrast, keyboard
  navigation, and screen-reader behavior. The configurator has been checked in
  desktop and mobile layouts, but this is not a site-wide audit.
- Print-friendly guides and privacy-preserving, cookieless analytics remain
  optional improvements.

## Pre-launch checklist

- [ ] Doctor approves the array-valued context model, including whether guides
      may belong to multiple contexts
- [ ] `Obecné` is exact-match only unless a specific cross-area rule is
      explicitly approved
- [ ] Every published guide has an approved positive control and a “must not
      appear” control
- [ ] Case fixtures contain `approvedBy` and `approvedOn`; no candidate case is
      treated as clinically approved while either is unset
- [ ] Adult/child contrasts, multiple tags/contexts, each “not sure” field, and
      no-match behavior have regression tests
- [ ] Matcher returns and enforces explicit `match` / `no-match` statuses
- [ ] No-match copy, clinic contact route, and 155/112 links are tested
- [ ] Fixture age-group snapshots are reconciled with Sanity only after
      clinician-approved changes
- [ ] All published diagnoses are complete, or incomplete entries are
      unpublished
- [ ] Doctor-approved required-content validation exists in Sanity and public
      GROQ queries, including meaningful Portable Text content checks
- [ ] Substantive edits automatically reset `reviewed` to false and public
      draft/publish behavior is verified
- [ ] Firewall rule `patient-guide-email` is live in production
- [ ] Privacy notice, operator details, and Resend data-processing terms are
      confirmed
- [ ] Placeholder biography and contact details are replaced
- [ ] Healthcare-advertising review is complete
- [ ] Czech emergency wording and mobile `tel:` links are verified
- [ ] Sanity webhook invalidates updates, unpublishes, deletes, and slug changes
- [ ] Accessibility review is complete
- [ ] `npm audit --omit=dev` findings are clean or understood
