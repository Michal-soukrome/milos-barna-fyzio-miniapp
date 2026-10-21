### Things I’d tighten before real patients use it

Privacy/GDPR is the biggest gap. Free-text symptom descriptions go to OpenAI, and emails go to Resend. In the EU/Czechia, health-adjacent data is special-category territory. Before launch you’d want: a privacy notice, a DPA with both providers, a clear on-page warning next to the matcher input (you have it in the README, make sure it’s in the UI), and ideally consider making AI matching opt-in or dropping it. The matcher could work well enough with just keywords + tags, since the guide list is small.
Abuse protection on /api/match and /api/send. /api/send can be used to spam arbitrary addresses with your sender domain, and /api/match burns your OpenAI budget. Add rate limiting (Upstash/Vercel KV or Vercel’s firewall), input length caps, and a honeypot or Turnstile on send. Also validate that the guide slug exists in Sanity rather than trusting the client.
Prompt injection in the matcher. Constrain the model to return only a slug from the allowed list (structured output / enum), then verify server-side that it’s in the published list. Never let it return free text to the user.
Email content. Keep the email to a link plus a generic message. Avoid putting the diagnosis/guide title in a way that reveals health info in the subject line, since emails sit in inboxes and notifications.
Czech-specific legal bits. Likely need identification of the operator, medical disclaimer, cookie notice if you add analytics, and checking advertising/promotion rules for healthcare providers (a doctor’s profile page can touch those). Worth a quick legal review.

### Smaller engineering notes

Legacy redirects: app/articles, app/configurator, app/contact, app/t, app/ordinace are still in the tree. Fine if they only redirect, but consider moving them to redirects() in next.config.ts (permanent 308s) and deleting the folders to cut clutter.
Stale dependencies/extraneous packages: npm list shows two extraneous packages (@emnapi/runtime, @img/sharp-wasm32). Usually harmless leftovers from a different platform install, so a clean npm ci will sort it.
content/drafts/hallux-valgus.md sits in the repo: make sure it can’t be accidentally shipped as clinical content, and that it’s clearly marked as non-reviewed.
Caching: guides and diagnoses change rarely, so use ISR/tag-based revalidation with a Sanity webhook rather than fetching on every request. Faster and cheaper.
Accessibility: patients skew older for many of these procedures. Check contrast, font sizes, and that the QR/share flow doesn’t depend on color or small tap targets. Czech-language lang="cs" and proper hreflang/metadata too.
Print-friendly guides would be a nice win: many patients want to print or save a PDF of post-op instructions.
Add basic tests for the matcher (known symptoms → expected slug, garbage → graceful “no match”) and for the send endpoint’s validation. These are the two places where bugs actually hurt.

### Product ideas

A visible “last reviewed by Dr. X on date” badge on every guide (you have the data model for it).
A “when to call / go to ER” block that’s consistently styled and positioned across all guides.
Analytics that don’t need consent (e.g., Plausible/Umami cookieless) to see which guides get used, without profiling patients.