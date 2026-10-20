# MUDr. Barna Miloš, Ph.D. — profil a pacientské materiály

This site combines the doctor's public professional profile with the clinic's topic
library and patient-facing guides.

## Main routes

- `/` — clinic topic library, filters, QR codes, and email sharing.
- `/configurator` — patient topic selection and topic matcher.
- `/t/<slug>` — focused patient guide opened from a QR code or email.
- `/about` — professional profile.
- `/contact` — public clinic contact details.

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

Topic matching works locally by default. If `OPENAI_API_KEY` is configured,
topic descriptions are sent to OpenAI to suggest an existing topic. Do not
include names or other identifying details in those descriptions. An optional
`OPENAI_MODEL` value can select the model.

## Content that must be completed before publication

The professional biography, specialties, experience, public contact details,
and professional links on `/about` and `/contact` are marked as placeholders.
Replace them only with verified details approved for publication.

All patient guide sections and warning signs in `lib/content.ts` are also
placeholders. A physician must write and review this guidance before the
patient-facing pages are used clinically. The visible demo notice is
intentional until that review is complete.

Review the privacy notice, medical disclaimer, and provider data-handling
terms before enabling AI matching or email for real patients. The app has no
database, but configured external services process the information sent to
them.
