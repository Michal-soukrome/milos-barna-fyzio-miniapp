import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest } from "next/server.js";
import { POST as sendEmail } from "../app/api/send/route.ts";
import { POST as revalidateSanity } from "../app/api/revalidate/sanity/route.ts";

const originalVercel = process.env.VERCEL;
delete process.env.VERCEL;

after(() => {
  if (originalVercel === undefined) {
    delete process.env.VERCEL;
  } else {
    process.env.VERCEL = originalVercel;
  }
});

test("email endpoint stops reading and returns 413 for an oversized streamed body", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        pulls += 1;
        if (pulls === 1) {
          controller.enqueue(new Uint8Array(2049));
        } else if (pulls === 2) {
          controller.enqueue(new TextEncoder().encode("unread"));
        } else {
          controller.close();
        }
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  const request = new NextRequest("https://example.test/api/send", {
    method: "POST",
    body,
    duplex: "half",
  });

  const response = await sendEmail(request);

  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(pulls, 1);
});

test("email endpoint rejects a filled honeypot", async () => {
  const request = new NextRequest("https://example.test/api/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "patient@example.com",
      slug: "valid-guide",
      website: "https://spam.example",
    }),
  });

  const response = await sendEmail(request);

  assert.equal(response.status, 400);
});

test("email endpoint rejects an invalid email address", async () => {
  const request = new NextRequest("https://example.test/api/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "invalid",
      slug: "valid-guide",
      website: "",
    }),
  });

  const response = await sendEmail(request);

  assert.equal(response.status, 400);
});

test("Sanity webhook fails closed when its secret is missing", async () => {
  const originalSecret = process.env.SANITY_REVALIDATE_SECRET;
  delete process.env.SANITY_REVALIDATE_SECRET;

  try {
    const response = await revalidateSanity(
      new NextRequest("https://example.test/api/revalidate/sanity", {
        method: "POST",
        body: "{}",
      }),
    );

    assert.equal(response.status, 500);
  } finally {
    if (originalSecret === undefined) {
      delete process.env.SANITY_REVALIDATE_SECRET;
    } else {
      process.env.SANITY_REVALIDATE_SECRET = originalSecret;
    }
  }
});

test("Sanity webhook rejects an invalid signature", async () => {
  const originalSecret = process.env.SANITY_REVALIDATE_SECRET;
  process.env.SANITY_REVALIDATE_SECRET = "test-secret";

  try {
    const request = new NextRequest(
      "https://example.test/api/revalidate/sanity",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "sanity-webhook-signature": `t=${Date.now()},v1=${"0".repeat(64)}`,
        },
        body: JSON.stringify({
          _type: "article",
          beforeSlug: "article",
          afterSlug: "article",
        }),
      },
    );

    const response = await revalidateSanity(request);

    assert.equal(response.status, 401);
  } finally {
    if (originalSecret === undefined) {
      delete process.env.SANITY_REVALIDATE_SECRET;
    } else {
      process.env.SANITY_REVALIDATE_SECRET = originalSecret;
    }
  }
});
