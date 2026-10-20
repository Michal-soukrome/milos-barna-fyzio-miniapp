import { NextRequest, NextResponse } from "next/server";
import { getTopicBySlug } from "@/lib/content";

// Very small email format check — good enough to catch typos, not meant to be
// a full RFC validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Požadavek musí obsahovat platná data." },
      { status: 400 },
    );
  }

  const { email, slug } = body;

  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !EMAIL_RE.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Zadejte platnou e-mailovou adresu." },
      { status: 400 },
    );
  }

  const topic = typeof slug === "string" ? getTopicBySlug(slug) : undefined;
  if (!topic) {
    return NextResponse.json({ error: "Neznámé téma." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL;

  if (!apiKey || !fromAddress || !appUrl) {
    return NextResponse.json(
      {
        error:
          "Odesílání e-mailů není nakonfigurováno. Zkontrolujte RESEND_API_KEY, SEND_FROM_EMAIL a APP_URL.",
      },
      { status: 503 },
    );
  }

  let link: string;
  try {
    const configuredUrl = new URL(appUrl);
    if (
      !["http:", "https:"].includes(configuredUrl.protocol) ||
      configuredUrl.username ||
      configuredUrl.password
    ) {
      throw new Error("APP_URL must be an HTTP(S) URL without credentials.");
    }
    link = new URL(`/navody/${topic.slug}`, configuredUrl.origin).toString();
  } catch {
    console.error("Email sending is disabled because APP_URL is invalid.");
    return NextResponse.json(
      { error: "Nastavení webové adresy pro e-mail není platné." },
      { status: 503 },
    );
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email.trim(),
      subject: topic.title,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 4px;">${escapeHtml(topic.title)}</h2>
          <p style="color: #555;">${escapeHtml(topic.summary)}</p>
          <p>
            <a href="${escapeHtml(link)}" style="display:inline-block; background:#3f6659; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none;">
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
      return NextResponse.json(
        { error: "E-mailová služba odeslání odmítla." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Email provider request failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json({ error: "Neočekávaná chyba při odesílání e-mailu." }, { status: 500 });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
