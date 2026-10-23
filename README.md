# Miloš Barna — patient information website

A Czech-language website that helps patients find clear, doctor-reviewed
information before and after medical procedures. The app provides practical
patient guides, a searchable guide finder, shareable QR/email links, and an
evergreen diagnosis library.

The site offers general information only. It does not diagnose patients or
generate personalized treatment or rehabilitation plans.

## Patient journey

1. **Start at the homepage** and choose patient instructions, diagnoses, the
   doctor's profile, or contact information.
2. **Find a patient guide** at `/navody`. Patients can filter by body area or
   age group, search by topic or symptom, or describe what they are looking
   for. The matcher recommends an existing guide; it does not create medical
   advice.
3. **Use the symptom guide** at `/konfigurator` to filter reviewed guides by
    age group, body area, and their existing symptom tags. It does not diagnose
    or assess urgency; emergency contact numbers remain visible throughout.
4. **Read the guide** at `/navody/[slug]`. A guide may show warning signs,
    links to contact the clinic, and related guides.
5. **Share a guide** using its QR code or by email. The QR code opens the guide
    directly. Email delivery uses Resend and links to the configured public
    site URL.
6. **Browse diagnoses** at `/diagnozy` for evergreen explanations of
    conditions, injury types, examinations, and treatment options. Diagnosis
    pages become public only after medical review in Sanity.

The guide matcher runs entirely in the browser and uses local keyword matching
against the published guide list. The description is not sent to the app server
or an AI provider. The app does not save these descriptions.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and primary navigation |
| `/navody` | Search, filters, and guide matcher |
| `/navody/[slug]` | Patient guide with warnings and sharing options |
| `/konfigurator` | Step-by-step guide finder; not a diagnostic or urgency tool |
| `/diagnozy` | Medically reviewed diagnoses, grouped by body area |
| `/diagnozy/[slug]` | Evergreen diagnosis information |
| `/clanky` | Existing educational article index |
| `/clanky/[slug]` | Individual educational article |
| `/o-lekari` | Doctor profile and background |
| `/kontakt` | Clinic contact details |
| `/studio` | Sanity Studio for editorial content |
| `/api/send` | Sends a guide link using Resend |

Legacy routes such as `/pruvodce`, `/configurator`, `/articles`, and `/t/[slug]`
are retained as redirects; `/configurator` redirects to `/konfigurator`.

## Editorial workflow

Editorial content is stored in Sanity and read from the **published**
perspective. Drafts are not rendered on public pages.

- For step-by-step instructions for editors, see the
  [Czech content-management handbook](./PRUVODCE-SPRAVOU-OBSAHU.md).
- **Patient guides** include body area, age groups, symptoms/search terms,
  summary, guide content, and warning signs. Only published guides with
  `reviewed: true` appear publicly; `reviewed` is set only after the doctor
  approves the content.
- **Diagnoses** are intended as durable reference pages rather than a
  chronological stream of new articles. Use headings and rich text for
  applicable topics such as what a diagnosis means, injury types, examination,
  treatment, surgery, and recovery. Only published diagnoses with
  `reviewed: true` appear on the site. Some diagnosis entries still need their
  detailed clinical content completed.
- **Educational articles** remain available at `/clanky`. They are published
  only when `reviewed: true`.

Sanity AI Assist may help draft editorial text where enabled, but it must not be
used with patient-identifying information. Clinical claims and instructions
must be reviewed by a doctor before publication.

## Local development

Requirements: Node.js supported by the installed Next.js version and npm.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` first (`cp .env.example .env.local` on
macOS/Linux or `Copy-Item .env.example .env.local` in PowerShell).

Open <http://localhost:3000>. Run a production build and server with:

```bash
npm run build
npm start
```

## Environment variables

Copy `.env.example` to `.env.local` and configure only the integrations you
intend to use:

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity content and Studio | Public project identifier; needed at build time |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity content and Studio | Dataset name, commonly `production` |
| `SANITY_API_READ_TOKEN` | Private Sanity dataset reads | Optional, server-only, read-only token |
| `RESEND_API_KEY` | Sending guide emails | Keep server-side |
| `SEND_FROM_EMAIL` | Sending guide emails | Verified sender address in Resend |
| `APP_URL` | Links in guide emails | Canonical public HTTP(S) URL |

Never put secrets in `NEXT_PUBLIC_*` variables or commit them to the repository.
When email is enabled, the recipient address and selected guide link are sent
to Resend for delivery. The email content does not include the guide title or
the user's symptom description.

## Deployment

The app uses standard Next.js `build` and `start` scripts and can run as a
Node.js web service. Vercel is the current target; configure the environment
variables in the deployment project and redeploy when build-time Sanity
variables change. Add production and preview origins to Sanity CORS only when
the Studio needs to be used from those origins.

Before enabling email on Vercel, create a Firewall rate-limit rule with ID
`patient-guide-email` to match the check in `/api/send`. Configure it per
client IP (for example, 5 requests per minute). The route rejects requests
with `429` when limited and fails closed with `503` if the rule is missing or
the Firewall check fails. Local development skips the Vercel Firewall check.

## Content that needs approval

The biography, professional history, contact details, and detailed diagnosis
content must be completed and verified before launch. Review medical
disclaimers, privacy notices, and external-provider data handling before the
site is used with patients.
