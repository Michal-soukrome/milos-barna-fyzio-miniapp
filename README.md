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
3. **Read the guide** at `/navody/[slug]`. A guide may show warning signs,
   links to contact the clinic, related guides, and a clear demo notice until a
   doctor has reviewed it.
4. **Share a guide** using its QR code or by email. The QR code opens the guide
   directly. Email delivery uses Resend and links to the configured public
   site URL.
5. **Browse diagnoses** at `/diagnozy` for evergreen explanations of
   conditions, injury types, examinations, and treatment options. Diagnosis
   pages become public only after medical review in Sanity.

The guide matcher only suggests a guide from Sanity's published guide list. If
`OPENAI_API_KEY` is configured, the description is sent to OpenAI to select an
existing guide; otherwise, local keyword matching is used. Do not enter names
or other patient-identifying details. The app does not save these descriptions
to its own database.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and primary navigation |
| `/navody` | Search, filters, and guide matcher |
| `/navody/[slug]` | Patient guide with warnings and sharing options |
| `/diagnozy` | Medically reviewed diagnoses, grouped by body area |
| `/diagnozy/[slug]` | Evergreen diagnosis information |
| `/clanky` | Existing educational article index |
| `/clanky/[slug]` | Individual educational article |
| `/o-lekari` | Doctor profile and background |
| `/kontakt` | Clinic contact details |
| `/studio` | Sanity Studio for editorial content |
| `/api/match` | Matches a patient description to an existing guide |
| `/api/send` | Sends a guide link using Resend |

Legacy routes such as `/pruvodce`, `/configurator`, `/articles`, and `/t/[slug]`
are retained as redirects.

## Editorial workflow

Editorial content is stored in Sanity and read from the **published**
perspective. Drafts are not rendered on public pages.

- **Patient guides** include body area, age groups, symptoms/search terms,
  summary, guide content, and warning signs. Demo guides are visibly marked
  unreviewed. For a guide to be presented as clinically reviewed, the doctor
  must review it, record their name and review date, disable demo mode, and
  publish it.
- **Diagnoses** are intended as durable reference pages rather than a
  chronological stream of new articles. Use headings and rich text for
  applicable topics such as what a diagnosis means, injury types, examination,
  treatment, surgery, and recovery. The schema requires medical review details;
  only medically reviewed published diagnoses appear on the site. There is no
  clinical content about a diagnosis until a clinician creates and reviews it
  in Sanity.
- **Educational articles** remain available at `/clanky`. They are published
  only after medical review.

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
| `OPENAI_API_KEY` | AI-assisted guide matching | Optional; without it, matching is local |
| `OPENAI_MODEL` | Selecting the matching model | Optional; defaults to `gpt-4o-mini` |

Never put secrets in `NEXT_PUBLIC_*` variables or commit them to the repository.
If OpenAI matching is enabled, user-entered descriptions are sent to OpenAI. If
email is enabled, the entered email address and selected guide are sent to
Resend. Review provider privacy terms and the site's privacy notice before
using these services with real patients.

## Deployment

The app uses standard Next.js `build` and `start` scripts and can run as a
Node.js web service. Vercel is the current target; configure the environment
variables in the deployment project and redeploy when build-time Sanity
variables change. Add production and preview origins to Sanity CORS only when
the Studio needs to be used from those origins.

## Content that needs approval

The biography, professional history, and contact details contain placeholders
that must be replaced with verified, approved information before launch.
Patient-guide demo content and warning signs also need a clinician's review.
Review medical disclaimers, privacy notices, and external-provider data
handling before the site is used with patients.
