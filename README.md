# OrthoCare Console

A small tool for the clinic: pick a topic, then send the patient the answer
by QR code (they scan it on the spot) or by email (typed in and sent right
there).

## How it's organized

- `lib/content.ts` — **every FAQ topic lives here.** Title, body text,
  "seek care if..." warnings, tags for the filter. To add a new topic, add
  a new object to the `topics` array. No other file needs to change.
- `app/page.tsx` + `components/Console.tsx` — the doctor's screen: search/
  filter topics, pick one, then choose QR or email.
- `app/t/[slug]/page.tsx` — the **patient-facing** page. This is what opens
  when they scan the QR code or click the email link.
- `app/api/send/route.ts` — sends the email.

## Running it locally

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploying

The easiest path is Vercel (made by the creators of Next.js, free tier is
enough for this):

1. Push this folder to a GitHub repo.
2. Import it at vercel.com/new.
3. Add the two environment variables below in the Vercel project settings.
4. Deploy. You'll get a permanent URL like `orthocare.vercel.app` — that's
   the URL the QR codes and emails will point to.

## Setting up email sending

Email sending uses Resend (resend.com — has a free tier, simple setup).
Without these two environment variables, the "email" tab will show a clear
error instead of failing silently:

```
RESEND_API_KEY=your_key_here
SEND_FROM_EMAIL=clinic@yourdomain.com
```

Steps:
1. Create a free Resend account.
2. Verify a sending domain (or use their test domain while testing).
3. Create an API key, add it as RESEND_API_KEY.
4. Set SEND_FROM_EMAIL to an address on your verified domain.

Add these in Vercel under Project -> Settings -> Environment Variables,
then redeploy.

## Before this goes near real patients

All the medical content in `lib/content.ts` is placeholder text so the app
is demoable. Every `sections` and `warningSigns` field needs to be replaced
with the doctor's own reviewed guidance before any patient sees it. It's
worth having him review the disclaimer wording too (in
`components/TopicActions.tsx` and `app/t/[slug]/page.tsx`) to make sure
it matches how he wants to frame "this isn't a diagnosis."

## No database, no patient data stored

Patient emails are used once to send a message and are not saved anywhere
in the app or database — there isn't one. Nothing about a specific patient
is logged.
