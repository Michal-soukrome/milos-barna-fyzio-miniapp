import { NextRequest, NextResponse } from "next/server";
import { getTopicBySlug } from "@/lib/content";

// Very small email format check — good enough to catch typos, not meant to be
// a full RFC validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email, slug, origin } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const topic = getTopicBySlug(slug);
  if (!topic) {
    return NextResponse.json({ error: "Unknown topic." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SEND_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    // Not configured yet — this is expected until the doctor sets up an
    // email sending account. See README for setup steps.
    return NextResponse.json(
      {
        error:
          "Email sending isn't set up yet. Add RESEND_API_KEY and SEND_FROM_EMAIL to your environment (see README).",
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
              Open your handout
            </a>
          </p>
          <p style="color: #888; font-size: 13px;">
            This is general information, not a diagnosis. If you're unsure, contact the clinic.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: "The email service rejected the send." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error sending the email." }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
