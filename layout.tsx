import { NextRequest, NextResponse } from "next/server";
import { getTopicBySlug } from "@/lib/content";

// Very small email format check — good enough to catch typos, not meant to be
// a full RFC validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email, slug, origin } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Zadejte platnou e-mailovou adresu." }, { status: 400 });
  }

  const topic = getTopicBySlug(slug);
  if (!topic) {
    return NextResponse.json({ error: "Neznámé téma." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SEND_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    // Not configured yet — this is expected until the doctor sets up an
    // email sending account. See README for setup steps.
    return NextResponse.json(
      {
        error:
          "Odesílání e-mailů zatím není nastaveno. Přidejte RESEND_API_KEY a SEND_FROM_EMAIL do prostředí (viz README).",
      },
      { status: 500 }
    );
  }

  const link = `${origin}/t/${topic.slug}`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: topic.title,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 4px;">${escapeHtml(topic.title)}</h2>
          <p style="color: #555;">${escapeHtml(topic.summary)}</p>
          <p>
            <a href="${link}" style="display:inline-block; background:#3f6659; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none;">
              Otevřít materiál
            </a>
          </p>
          <p style="color: #888; font-size: 13px;">
            Toto jsou pouze obecné informace, nejde o diagnózu. Pokud si nejste jistí, kontaktujte ordinaci.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: "E-mailová služba odeslání odmítla." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Neočekávaná chyba při odesílání e-mailu." }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
