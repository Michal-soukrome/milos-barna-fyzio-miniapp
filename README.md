# MUDr. Barna Miloš, Ph.D. — profil a pacientské materiály

This site combines the doctor's public professional profile with the clinic's topic
library and patient-facing guides.

## Main routes

- `/` — universal welcome page with links for patients and other visitors.
- `/ordinace` — clinic topic library, filters, QR codes, and email sharing.
- `/pruvodce` — patient topic selection and topic matcher.
- `/navody/<slug>` — focused patient guide opened from a QR code or email.
- `/o-lekari` — professional profile.
- `/kontakt` — public clinic contact details.
- `/clanky` and `/clanky/<slug>` — published, medically reviewed CMS articles.
- `/studio` — Sanity Studio for authoring and reviewing articles.

## Local development

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run build` to validate the production
build and TypeScript.

## Environment variables

Email sending requires these server-side variables:

```text
RESEND_API_KEY=your_key_here
SEND_FROM_EMAIL=clinic@yourdomain.com
APP_URL=https://your-public-domain.example
```

Verify the sender domain with Resend and set `APP_URL` to the canonical public
HTTPS URL. Email links are generated from this value, not from client input.

## Sanity CMS

Patient guides, their search metadata, sections, and warning signs are managed
in Sanity, alongside longer clinic-authored articles. Public guide pages show
published demo records with a prominent warning or medically reviewed records.
Article pages show only published documents marked as medically reviewed.
Article categories are used to prioritize related reading; when no categories
match, the sidebar falls back to the newest other reviewed articles.
When a patient confirms a warning sign, the guide links to Barna Medical's
injury/operation rehabilitation information, except wound-care topics, which
link to the clinic's contact page.

1. Create a Sanity project and dataset, then copy the project ID and dataset
   name from the Sanity project settings.
2. Copy `.env.example` to `.env.local` and set
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
3. Add the local site origin (`http://localhost:3000`) to the project's CORS
   origins. Add the production domain in the same way before using the Studio
   there; enable credentialed requests for origins where Studio authentication
   is used.
4. Start the app and open `/studio`. Sign in with a Sanity project account.
5. In Vercel, set the two `NEXT_PUBLIC_SANITY_*` variables for each deployment
   environment that should use the CMS, then redeploy. Add preview origins to
   Sanity CORS only if preview deployments need Studio access.

`SANITY_API_READ_TOKEN` is optional and server-only. Do not use a write token
for public article rendering or expose any Sanity token through a
`NEXT_PUBLIC_` variable. Public pages use the published perspective and do not
render drafts.

Sanity AI Assist is available only on supported Sanity plans and must be
enabled for the project by a project member. It can help draft content, but it
cannot change the demo or medical review fields. Demo guides remain visibly
marked as unreviewed. To publish a guide for clinical use, a clinician must
review all metadata, sections, and warning signs, enter their name and review
date, mark it medically reviewed, disable demo mode, and publish it manually.
Articles also require clinician review before publication. Never enter
patient-identifying information into editorial AI tools.

Topic matching works locally by default. If `OPENAI_API_KEY` is configured,
topic descriptions are sent to OpenAI to suggest an existing topic. Do not
include names or other identifying details in those descriptions. An optional
`OPENAI_MODEL` value can select the model.

## Content that must be completed before publication

The professional biography, specialties, experience, public contact details,
and professional links on `/o-lekari` and `/kontakt` are marked as placeholders.
Replace them only with verified details approved for publication.

The migrated patient guide sections and warning signs are placeholders. A
physician must write and review this guidance before the patient-facing pages
are used clinically. The visible demo notice is intentional until that review
is complete.

Review the privacy notice, medical disclaimer, and provider data-handling
terms before enabling AI matching or email for real patients. The app has no
database, but configured external services process the information sent to
them.
