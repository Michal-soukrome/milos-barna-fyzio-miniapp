# Feedback and pre-launch follow-up

Updated 2026-10-21 after clinician approval and implementation of the
configurator safeguards.

## Completed

- **Matcher privacy:** guide matching runs locally in the browser. Free-text
  descriptions are not sent to the app server or an AI provider. The
  `/api/match` route and OpenAI configuration were removed.
- **Email privacy and abuse controls:** `/api/send` validates the guide against
  reviewed Sanity content, sends a generic subject and link-only message, and
  displays a Resend disclosure. Requests have a 2 KB body limit and a honeypot.
  Vercel Firewall rate-limit enforcement is implemented and fails closed if its
  rule is missing or unavailable.
- **Context-aware configurator:** `/konfigurator` asks age, body area, symptoms
  or problems, and situation separately. It requires exact age-group and
  body-area matches (`Obecné` is not a wildcard), every selected symptom tag,
  and an explicitly selected matching context. An unknown required answer or
  no match returns contact guidance; there is no arbitrary fallback. Results
  display their approved contexts, and 155/112 links remain visible.
- **Clinician-approved matcher spec:** [tests/fixtures/configurator-cases.json](./tests/fixtures/configurator-cases.json)
  is the source used by the regression tests. It snapshots the six guide
  records observed on 2026-10-21 and records MUDr. Miloš Barna's approval for
  every case on that date. It covers positive and negative controls, all
  independent “not sure” answers, age filtering, tag intersection, exact-area
  behavior, known-context union, mixed known/unknown contexts, and the
  no-match contact routes.
- **Publication control:** `reviewed: true` is the publication gate for
  patient guides, diagnoses, and articles. The doctor has approved the CMS
  content for publication. Editing document content in Studio automatically
  resets `reviewed` to false so the doctor can approve the edited version.
- **On-demand cache invalidation:** Sanity reads use collection and
  per-document cache tags. `POST /api/revalidate/sanity` verifies the Sanity
  webhook signature and immediately expires collection and old/new slug tags
  for patient guides, diagnoses, and articles.
- **Other completed work:** diagnosis details show related diagnoses in a
  sidebar; Prettier is configured to format on save; guides and diagnoses keep
  a five-minute time-based fallback revalidation.

## Current Sanity content status

All six patient guides and 24 diagnoses that had been incorrectly marked
`reviewed:false` have been restored to `reviewed:true` and republished, in
accordance with the doctor's approval. The existing reviewed article remains
published. The six guide records also retain the approved context assignments
below. Some guide details still contain placeholder copy such as “bude
doplněn před zveřejněním”; that text is now visible because the doctor
explicitly approved publication of the CMS content as it stands.

The approved guide contexts are:

| Guide slug                       | Context          |
| -------------------------------- | ---------------- |
| `bezpecne-pouzivani-berli`       | `using-crutches` |
| `otok-po-operaci-kolena`         | `after-surgery`  |
| `po-zlomenine-zapesti`           | `after-fracture` |
| `pece-o-operacni-ranu`           | `after-surgery`  |
| `pece-o-sadru`                   | `in-cast`        |
| `zotaveni-po-podvrtnuti-kotniku` | `after-sprain`   |

`po operaci` is a situation, not a symptom tag; it has been removed from the
symptom arrays for the knee-swelling and operative-wound guides. Raw API or
script edits bypass Studio validation and the Studio review-reset input. Any
such writer must explicitly set `reviewed: false`; a Sanity Function is needed
if non-Studio writing becomes part of the workflow.

## Remaining launch work

### Sanity schema and webhook deployment

Deploy the updated Studio schema with the application. In Sanity, configure a
signed webhook:

- **URL:** `https://<production-host>/api/revalidate/sanity`
- **Secret:** the same value as `SANITY_REVALIDATE_SECRET` in the hosting
  environment
- **Trigger:** published document create, update, and delete events for
  `patientGuide`, `diagnosis`, and `article`; ensure unpublishing a document
  generates a delete event
- **Filter:**
  `coalesce(after()._type, before()._type) in ["patientGuide", "diagnosis", "article"]`
- **Projection:**
  ```groq
  {
    "_type": coalesce(after()._type, before()._type),
    "beforeSlug": before().slug.current,
    "afterSlug": after().slug.current
  }
  ```

Test create, edit, slug rename, unpublish, and delete events. The handler rejects
unsigned requests, unsupported document types, and events missing both slugs.
The project environment template includes `SANITY_REVALIDATE_SECRET`; generate
a strong random value and configure the identical value in Sanity and the
production host.

### Other operational work

- Configure the Vercel per-IP rate limit with ID `patient-guide-email` (the
  README recommends five requests per minute). Email sending fails closed
  with `503` until the rule is live.
- When editing CMS content, confirm the automatically reset `reviewed` flag
  after the doctor's review before publishing the edited document.
- Replace remaining placeholder biography and clinic contact details. Confirm
  clinic-operator details, privacy notice, Resend data handling/retention, and
  any required data-processing agreement.
- Review medical disclaimers and healthcare-advertising requirements with the
  appropriate professional adviser.
- Confirm Czech emergency wording (155 for the medical emergency service and
  112 as the general emergency number) and verify both `tel:` links on mobile.
- Run `npm audit --omit=dev` and understand runtime findings before launch. The
  latest npm install reported 18 audit findings (9 moderate and 9 high); that
  count may include development/build dependencies.
- Complete a site-wide accessibility review, including contrast, keyboard
  navigation, and screen-reader behavior.

## Pre-launch checklist

- [x] Clinician-approved context values and assignments are in the fixture.
- [x] `Obecné` is an exact body-area value, not a wildcard.
- [x] Every guide has a positive control and a must-not-appear control.
- [x] Cases record `approvedBy` and `approvedOn`; age groups are snapshotted.
- [x] Tests cover age, area, symptoms, contexts, multiple tags/contexts, and
      explicit no-match behavior.
- [x] The matcher returns explicit `match` / `no-match` statuses.
- [x] No-match guidance includes clinic contact, the guide library, and
      visible 155/112 links.
- [x] `reviewed: true` is the publication gate in all public GROQ queries.
- [x] Studio edits reset `reviewed` when substantive document content changes.
- [x] Restore `reviewed:true` and republish all six patient guides and 24
      diagnoses per the doctor's approval.
- [ ] Deploy the Studio schema and configure/test the signed Sanity webhook.
- [ ] Configure the production `SANITY_REVALIDATE_SECRET`.
- [ ] Configure Vercel Firewall rule `patient-guide-email`.
- [ ] Confirm privacy notice, operator details, and Resend data-processing
      terms.
- [ ] Replace placeholder biography and contact details.
- [ ] Complete healthcare-advertising review and accessibility review.
- [ ] Verify Czech emergency wording and mobile `tel:` links.
- [ ] Run `npm audit --omit=dev` and address or document findings.

Print-friendly guides and privacy-preserving, cookieless analytics remain
optional improvements.
