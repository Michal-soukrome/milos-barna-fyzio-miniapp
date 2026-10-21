# Feedback and pre-launch follow-up

Updated 2026-10-21 to reflect the current implementation and priorities.

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

1. **Make configurator matching context-aware before real-patient use.** The
   current tags conflate symptoms and situations: selecting “otok” for an adult
   knee complaint surfaces “Otok po operaci kolena”; “zlomenina” can surface
   after-fracture instructions without confirming a diagnosis. This is a
   structural matching issue, not just a copy-edit. Ask the doctor which
   distinctions matter, then add an explicit guide context (for example,
   `after-surgery`, `after-fracture`, or `general`) and match it separately from
   symptoms. Do not show procedure-specific guides when context is “not sure”
   or “no procedure.” Show a clear context label on every result. If no safe
   match exists, show no-match/contact guidance rather than a potentially
   misleading guide.

   Suggested cases for the doctor to approve as the configurator test
   specification:

   | Age group | Area | Symptom/tag | Context | Expected result |
   | --- | --- | --- | --- | --- |
   | Adult | Knee | Otok | None / unsure | Must not surface the post-surgery guide; doctor to approve general guides or no match |
   | Adult | Knee | Otok | After knee surgery | Candidate: “Otok po operaci kolena”; doctor to confirm |
   | Child | Wrist / hand | Zlomenina | Not confirmed / unsure | Must not surface after-fracture care as if the fracture were confirmed; doctor to approve other guidance or no match |

2. **Finish and validate clinical content.** Some published diagnosis entries
   still lack detailed information. Complete them or unpublish them before
   launch. Preserve the agreed single `reviewed` boolean, but add Sanity
   validation so a document cannot be marked reviewed when required clinical
   sections are empty.
3. **Configure the production Vercel Firewall rule.** Create a per-IP rate
   limit with ID `patient-guide-email` (the README suggests 5 requests per
   minute). Until configured, email sending fails closed with `503`.

## Review-state behavior

The agreed Sanity model uses only `reviewed: boolean`; reviewer attribution is
fixed to MUDr. Miloš Barna and there is no review-date field. This means an
edit can leave the flag true unless the editorial workflow resets it. Consider
resetting `reviewed` to false on substantive edits, or showing a clear Studio
warning when a reviewed document has unpublished changes. Do not add reviewer
or timestamp fields without revisiting the agreed model.

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

- Add automated regression tests for the doctor-approved matching cases above,
  including ambiguous tags and no-match cases, plus `/api/send` validation.
  The production build and manual browser/endpoint checks have passed, but
  there is no dedicated test script.
- Run `npm audit --omit=dev` and understand runtime findings before launch. The
  latest npm install reported 18 audit findings (9 moderate and 9 high); that
  full count may include development/build dependencies.
- Decide whether a five-minute stale-content window is acceptable for medical
  corrections and unpublishing. If not, add a Sanity webhook with targeted
  revalidation for affected guides and diagnoses.
- Complete a site-wide accessibility review, including contrast, keyboard
  navigation, and screen-reader behavior. The configurator has been checked in
  desktop and mobile layouts, but this is not a site-wide audit.
- Print-friendly guides and privacy-preserving, cookieless analytics remain
  optional improvements.

## Pre-launch checklist

- [ ] Configurator context model and result mappings reviewed and signed off by
      the doctor
- [ ] Matcher regression tests for approved cases pass
- [ ] All published diagnoses are complete, or incomplete entries are
      unpublished
- [ ] Sanity validation prevents reviewing incomplete clinical content
- [ ] Firewall rule `patient-guide-email` is live in production
- [ ] Privacy notice, operator details, and Resend data-processing terms are
      confirmed
- [ ] Placeholder biography and contact details are replaced
- [ ] Healthcare-advertising review is complete
- [ ] Czech emergency wording and mobile `tel:` links are verified
- [ ] Accessibility review is complete
- [ ] `npm audit --omit=dev` findings are clean or understood
