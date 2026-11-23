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
2. **Find a patient guide** at `/poradna`. Patients can filter by body area or
   age group, search by topic or symptom, or describe what they are looking
   for. The matcher recommends an existing guide; it does not create medical
   advice.
3. **Use the symptom guide** at `/pruvodce` to filter reviewed guides by
   age group, body area, and their existing symptom tags. It does not diagnose
   or assess urgency; emergency contact numbers remain visible throughout.
4. **Read the guide** at `/poradna/[slug]`. A guide may show warning signs,
   links to contact the clinic, and related guides.
5. **Share a guide** using its QR code or by email. The QR code opens the guide
   directly. Email delivery uses Resend and links to the configured public
   site URL.
6. **Browse diagnoses** at `/diagnozy` for evergreen explanations of
   conditions, injury types, examinations, and treatment options. Diagnosis
   pages become public only after medical review in Sanity.

The free-text guide matcher sends a question to `/api/match`; when configured,
the server uses Cloudflare Workers AI to rank existing reviewed guides. It
returns guide summaries only. When the visitor explicitly asks AI to explain,
the server first searches all reviewed patient guides, diagnoses, and articles
and uses only a matching item's approved content. If none fits, the model may
provide brief general health education, without diagnosing or recommending
treatment, medication, or exercise. General AI wording is not clinic content
or clinician-reviewed; unsafe or personal symptom questions receive no AI
answer. This is not a web search. If the route or AI service is unavailable,
the browser falls back to local keyword matching for guide search. The app does
not save questions in its own database. Do not enter identifying information.

## Routes

| Route              | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `/`                | Homepage and primary navigation                             |
| `/poradna`         | Search, filters, and guide matcher                          |
| `/poradna/[slug]`  | Patient guide with warnings and sharing options             |
| `/pruvodce`        | Step-by-step guide finder; not a diagnostic or urgency tool |
| `/diagnozy`        | Medically reviewed diagnoses, grouped by body area          |
| `/diagnozy/[slug]` | Evergreen diagnosis information                             |
| `/clanky`          | Existing educational article index                          |
| `/clanky/[slug]`   | Individual educational article                              |
| `/o-mne`           | Doctor profile and background                               |
| `/kontakt`         | Clinic contact details                                      |
| `/ochrana-osobnich-udaju` | Privacy notice and analytics consent settings        |
| `/studio`          | Sanity Studio for editorial content                         |
| `/api/send`        | Sends a guide link using Resend                             |
| `/api/match`       | Matches reviewed guides; optionally generates general information |

Routes are defined by the `app/` directory. Legacy paths are not redirected.

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

| Variable                        | Required for                 | Notes                                           |
| ------------------------------- | ---------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity content and Studio    | Public project identifier; needed at build time |
| `NEXT_PUBLIC_SANITY_DATASET`    | Sanity content and Studio    | Dataset name, commonly `production`             |
| `SANITY_API_READ_TOKEN`         | Private Sanity dataset reads | Optional, server-only, read-only token          |
| `RESEND_API_KEY`                | Sending guide emails         | Keep server-side                                |
| `SEND_FROM_EMAIL`               | Sending guide emails         | Verified sender address in Resend               |
| `APP_URL`                       | Links in guide emails        | Canonical public HTTP(S) URL                    |
| `NEXT_PUBLIC_GTM_ID`            | Google Tag Manager           | Optional; its script loads only after analytics consent |
| `CLOUDFLARE_ACCOUNT_ID`         | AI guide matching            | Optional; server-only                           |
| `CLOUDFLARE_API_TOKEN`          | AI guide matching            | Optional Workers AI token; keep server-side     |
| `CLOUDFLARE_LLM_MODEL`          | AI guide matching            | Optional; defaults to `@cf/zai-org/glm-4.7-flash` |

Never put secrets in `NEXT_PUBLIC_*` variables or commit them to the repository.
When email is enabled, the recipient address and selected guide link are sent
to Resend for delivery. The email content does not include the guide title or
the user's symptom description. When AI matching is configured, the question
and reviewed clinic-content search text are sent to Cloudflare Workers AI. A
separate user action may also send the question and the selected full reviewed
item for simplification, or request general health education if no relevant
clinic item is found. The app does not store the question in its own database.

Google Tag Manager is loaded only after the visitor accepts analytics in the
cookie settings. Configure the production container ID as `NEXT_PUBLIC_GTM_ID`,
and ensure every analytics tag in the container respects the consent state.
The visitor can change or withdraw the choice from the footer.

## Deployment

The app uses standard Next.js `build` and `start` scripts and can run as a
Node.js web service. Vercel is the current target; configure the environment
variables in the deployment project and redeploy when build-time Sanity
variables change. Add production and preview origins to Sanity CORS only when
the Studio needs to be used from those origins.

Before enabling email or AI guide matching on Vercel, create per-client-IP
Firewall rate-limit rules with IDs `patient-guide-email` and
`patient-guide-match` to match the API checks. `/api/match` fails closed with
`503` if its rule is missing or the Firewall check fails; local development
skips the Vercel Firewall check. Cloudflare's daily Workers AI allowance is
shared across models on the account; model failures fall back to local matching.

## Content that needs approval

The biography, professional history, contact details, and detailed diagnosis
content must be completed and verified before launch. Review medical
disclaimers, privacy notices, and external-provider data handling before the
site is used with patients. The AI matcher's red-flag patterns and notice are
provisional and require clinician approval before production use.
