import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@vercel/firewall";
import { isSanityConfigured } from "@/sanity/lib/client";
import { getPatientGuideBySlug } from "@/sanity/lib/patient-guides";

// Very small email format check — good enough to catch typos, not meant to be
// a full RFC validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REQUEST_BYTES = 2048;

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkEmailRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Požadavek je příliš velký." },
      { status: 413 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (error) {
    console.error(
      "Email request body could not be read.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Požadavek se nepodařilo přečíst." },
      { status: 400 },
    );
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Požadavek je příliš velký." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Požadavek musí obsahovat platná data." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Požadavek musí obsahovat platná data." },
      { status: 400 },
    );
  }

  const { email, slug, website } = body;

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

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Neznámé téma." }, { status: 400 });
  }

  if (typeof website !== "string" || website.trim()) {
    return NextResponse.json(
      { error: "Požadavek se nepodařilo ověřit." },
      { status: 400 },
    );
  }

  if (!isSanityConfigured) {
    return NextResponse.json(
      { error: "Knihovna pokynů pro pacienty není připojena k CMS." },
      { status: 503 },
    );
  }

  let topic;
  try {
    topic = await getPatientGuideBySlug(slug);
  } catch (error) {
    console.error(
      "Patient guide lookup failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Informace o tématu se nepodařilo načíst." },
      { status: 503 },
    );
  }

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
    link = new URL(`/poradna/${topic.slug}`, configuredUrl.origin).toString();
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
      subject: "Informace pro pacienty",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p style="color: #555;">MUDr. Miloš Barna, Ph.D. Vám posílá odkaz na obecné informace pro pacienty.</p>
          <p>
            <a href="${escapeHtml(link)}" style="display:inline-block; background:#3f6659; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none;">
              Otevřít informace
            </a>
          </p>
          <p style="color: #888; font-size: 13px;">
            Toto jsou pouze obecné informace, nejde o diagnózu. Pokud si nejste jistí, kontaktujte svého lékaře.
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
    return NextResponse.json(
      { error: "Neočekávaná chyba při odesílání e-mailu." },
      { status: 500 },
    );
  }
}

async function checkEmailRateLimit(request: NextRequest) {
  if (process.env.VERCEL !== "1") return null;

  try {
    const { rateLimited, error } = await checkRateLimit("patient-guide-email", {
      request,
      timeout: 1000,
    });
    if (error) {
      console.error("Email rate-limit rule unavailable.", error);
      return NextResponse.json(
        { error: "Odesílání je dočasně nedostupné." },
        { status: 503 },
      );
    }
    if (!rateLimited) return null;

    return NextResponse.json(
      { error: "Zkuste to prosím znovu za chvíli." },
      { status: 429 },
    );
  } catch (error) {
    console.error(
      "Email rate-limit check failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Odesílání je dočasně nedostupné." },
      { status: 503 },
    );
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
