import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest } from "next/server.js";
import { POST as match } from "../app/api/match/route.ts";
import {
  chooseWithLlm,
  generateClinicContentExplanation,
  generateGeneralHealthEducation,
  getCloudflareConfig,
  parseChoice,
  rankClinicContent,
  rankGuides,
  selectRelevantClinicContent,
  selectRelevantGuides,
  type CloudflareConfig,
} from "../sanity/lib/match-ai.ts";
import type {
  ClinicContentKind,
  ClinicContentSummary,
} from "../sanity/lib/clinic-content.ts";
import { findRedFlag } from "../sanity/lib/red-flags.ts";
import type { PatientGuideSummary } from "../sanity/lib/types.ts";

const originalVercel = process.env.VERCEL;
const originalFetch = globalThis.fetch;
const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
const originalModel = process.env.CLOUDFLARE_LLM_MODEL;
delete process.env.VERCEL;

after(() => {
  globalThis.fetch = originalFetch;
  restoreEnv("VERCEL", originalVercel);
  restoreEnv("CLOUDFLARE_ACCOUNT_ID", originalAccountId);
  restoreEnv("CLOUDFLARE_API_TOKEN", originalApiToken);
  restoreEnv("CLOUDFLARE_LLM_MODEL", originalModel);
});

const config: CloudflareConfig = {
  accountId: "test-account",
  apiToken: "test-token",
  llmModel: "@cf/test/model",
};

function post(body: unknown) {
  return new NextRequest("https://example.test/api/match", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function guide(slug: string): PatientGuideSummary {
  return {
    _id: slug,
    title: slug,
    slug,
    bodyPart: "Koleno",
    ageGroups: ["adult"],
    contexts: ["general"],
    symptoms: ["bolest"],
    summary: "Obecné pokyny",
    reviewed: true,
  };
}

function clinicContent(
  kind: ClinicContentKind,
  slug: string,
): ClinicContentSummary {
  return {
    _id: slug,
    kind,
    title: slug,
    slug,
    bodyPart: "Koleno",
    summary: "Schválené informace.",
    bodyText: "Obsah schváleného klinického textu.",
    symptoms: [],
    contexts: [],
    category: "",
    categories: [],
  };
}

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

test("Cloudflare config defaults to the current multilingual model", () => {
  const accountIdBefore = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiTokenBefore = process.env.CLOUDFLARE_API_TOKEN;
  const modelBefore = process.env.CLOUDFLARE_LLM_MODEL;
  process.env.CLOUDFLARE_ACCOUNT_ID = "test-account";
  process.env.CLOUDFLARE_API_TOKEN = "test-token";
  delete process.env.CLOUDFLARE_LLM_MODEL;

  try {
    assert.equal(getCloudflareConfig()?.llmModel, "@cf/zai-org/glm-4.7-flash");
  } finally {
    restoreEnv("CLOUDFLARE_ACCOUNT_ID", accountIdBefore);
    restoreEnv("CLOUDFLARE_API_TOKEN", apiTokenBefore);
    restoreEnv("CLOUDFLARE_LLM_MODEL", modelBefore);
  }
});

test("match endpoint stops reading and returns 413 for an oversized streamed body", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        pulls += 1;
        if (pulls === 1) controller.enqueue(new Uint8Array(2049));
        else controller.close();
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );

  const response = await match(
    new NextRequest("https://example.test/api/match", {
      method: "POST",
      body,
      duplex: "half",
    }),
  );

  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(pulls, 1);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("match endpoint validates JSON, query type, and the 500-code-point limit", async () => {
  assert.equal((await match(post("{not json"))).status, 400);
  assert.equal((await match(post({}))).status, 400);
  assert.equal((await match(post({ query: 42 }))).status, 400);
  assert.equal((await match(post({ query: " " }))).status, 400);
  assert.equal((await match(post({ query: "🙂".repeat(501) }))).status, 400);
  assert.equal((await match(post({ query: "valid", mode: "invalid" }))).status, 400);
  assert.equal((await match(post({ query: "🙂".repeat(500) }))).status, 503);
});

test("urgent text is answered locally and never reaches an external service", async () => {
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("network must not be used for urgent text");
  };

  try {
    const response = await match(
      post({ query: "prsty v sádře mi modrají", mode: "answer" }),
    );
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.urgent, true);
    assert.deepEqual(data.guides, []);
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("match endpoint asks the client to fall back when Cloudflare is not configured", async () => {
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;

  const response = await match(post({ query: "bolí mě koleno při běhu" }));
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.fallback, true);
});

test("embedding output is validated and guides are ranked by cosine similarity", async () => {
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as { text: string[] };
    assert.equal(request.text.length, 3);
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          shape: [3, 2],
          data: [
            [1, 0],
            [0.9, 0.1],
            [0, 1],
          ],
        },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const ranked = await rankGuides(config, "koleno", [
      guide("guide-a"),
      guide("guide-b"),
    ]);
    assert.equal(ranked[0].guide.slug, "guide-a");
    assert.equal(ranked[0].score > ranked[1].score, true);
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("clinic-content embeddings are batched within Workers AI's item limit", async () => {
  const fetchBefore = globalThis.fetch;
  const batchSizes: number[] = [];
  globalThis.fetch = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as { text: string[] };
    batchSizes.push(request.text.length);
    return new Response(
      JSON.stringify({
        success: true,
        result: { data: request.text.map(() => [1, 0]) },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    await rankClinicContent(
      config,
      "unique-clinic-batch-query",
      Array.from({ length: 101 }, (_, index) =>
        clinicContent("article", `unique-clinic-batch-${index}`),
      ),
    );
    assert.deepEqual(batchSizes, [100, 2]);
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("clinic-content selection can choose reviewed diagnosis and article records", async () => {
  const fetchBefore = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_input, init) => {
    calls += 1;
    const request = JSON.parse(String(init?.body));
    if (calls === 1) {
      assert.equal(request.text.length, 3);
      return new Response(
        JSON.stringify({
          success: true,
          result: { data: [[1, 0], [0, 1], [0.99, 0.01]] },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }

    const userContent = JSON.parse(request.messages[1].content);
    assert.equal(userContent.candidates[0].kind, "article");
    assert.equal(request.chat_template_kwargs.enable_thinking, false);
    return new Response(
      JSON.stringify({
        success: true,
        result: { choices: [{ message: { content: "1" } }] },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const selection = await selectRelevantClinicContent(
      { ...config, llmModel: "@cf/zai-org/glm-4.7-flash" },
      "unique-clinic-content-query",
      [
        clinicContent("diagnosis", "unique-diagnosis"),
        clinicContent("article", "unique-article"),
      ],
    );
    assert.equal(selection.source, "llm");
    assert.deepEqual(
      selection.contents.map(({ kind }) => kind),
      ["article"],
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("clinic-content selection failure is distinct from a genuine no-match", async () => {
  const fetchBefore = globalThis.fetch;
  const errorBefore = console.error;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(
        JSON.stringify({
          success: true,
          result: { data: [[1, 0], [0.99, 0.01]] },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    return new Response("unavailable", { status: 503 });
  };
  console.error = () => {};

  try {
    const selection = await selectRelevantClinicContent(
      config,
      "unique-clinic-selection-failure",
      [clinicContent("article", "unique-clinic-selection-failure")],
    );
    assert.deepEqual(selection, {
      contents: [],
      source: "embeddings",
      failed: true,
    });
  } finally {
    globalThis.fetch = fetchBefore;
    console.error = errorBefore;
  }
});

test("LLM choices accept only unique offered candidate numbers", async () => {
  assert.deepEqual(parseChoice("2, 5", 6), [1, 4]);
  assert.deepEqual(parseChoice("0", 3), []);
  assert.throws(() => parseChoice("I choose 2", 3));
  assert.throws(() => parseChoice("4", 3));
  assert.throws(() => parseChoice("2,2", 3));
  assert.throws(() => parseChoice("1,2,3,4", 8));

  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ success: true, result: { response: "2, 1" } }),
      { headers: { "content-type": "application/json" } },
    );
  try {
    assert.deepEqual(
      await chooseWithLlm(config, "query", [guide("guide-a"), guide("guide-b")]),
      [1, 0],
    );
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("LLM selection failure returns no potentially irrelevant embedding guides", async () => {
  const fetchBefore = globalThis.fetch;
  const errorBefore = console.error;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(
        JSON.stringify({
          success: true,
          result: { data: [[1, 0], [0.99, 0.01]] },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    return new Response("unavailable", { status: 503 });
  };
  console.error = () => {};

  try {
    const selection = await selectRelevantGuides(config, "eye injury", [
      guide("unique-llm-fallback-guide"),
    ]);
    assert.deepEqual(selection, { guides: [], source: "embeddings" });
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = fetchBefore;
    console.error = errorBefore;
  }
});

test("clinic explanation includes only the selected reviewed content", async () => {
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    const userContent = JSON.parse(request.messages[1].content);
    assert.equal(request.messages[0].role, "system");
    assert.match(
      request.messages[0].content,
      /Use only the supplied approvedContent/,
    );
    assert.equal(userContent.question, "unique clinic content question");
    assert.equal(userContent.approvedContent.title, "approved-article");
    assert.equal(userContent.approvedContent.kind, "article");
    assert.equal(userContent.approvedContent.content, "Approved article body.");
    return new Response(
      JSON.stringify({
        success: true,
        result: { response: "ANSWER: Zjednodušené vysvětlení článku." },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const answer = await generateClinicContentExplanation(
      config,
      "unique clinic content question",
      {
        kind: "article",
        title: "approved-article",
        slug: "approved-article",
        bodyPart: "Koleno",
        summary: "Approved summary.",
        text: "Approved article body.",
        warningSigns: [],
      },
    );
    assert.equal(answer, "Zjednodušené vysvětlení článku.");
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("general health education answers only when the model explicitly marks them safe", async () => {
  const fetchBefore = globalThis.fetch;
  let responseText = "ANSWER: Osteoartróza postupně mění kloubní chrupavku.";
  globalThis.fetch = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    assert.match(
      request.messages[0].content,
      /Never diagnose, guess what condition a person has/,
    );
    assert.match(request.messages[0].content, /reply exactly NO_ANSWER/);
    assert.match(
      request.messages[0].content,
      /Never invent anatomical structures, properties, or functions/,
    );
    assert.match(
      request.messages[0].content,
      /Use natural, grammatically correct Czech medical terminology/,
    );
    return new Response(
      JSON.stringify({
        success: true,
        result: { response: responseText },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    assert.equal(
      await generateGeneralHealthEducation(config, "Co je osteoartróza?"),
      "Osteoartróza postupně mění kloubní chrupavku.",
    );
    responseText = "NO_ANSWER";
    assert.equal(
      await generateGeneralHealthEducation(config, "Mám úraz oka, co mám dělat?"),
      null,
    );
    responseText = "Unstructured answer";
    await assert.rejects(
      generateGeneralHealthEducation(config, "Co je osteoartróza?"),
    );
    responseText = `ANSWER: ${"a".repeat(1201)}`;
    await assert.rejects(
      generateGeneralHealthEducation(config, "Co je osteoartróza?"),
    );
  } finally {
    globalThis.fetch = fetchBefore;
  }
});

test("red-flag placeholder normalizes Czech diacritics", () => {
  assert.equal(findRedFlag("Mám bolest na hrudi"), true);
  assert.equal(findRedFlag("prsty v sádře mi modrají"), true);
  assert.equal(findRedFlag("co cvičit po operaci kolene"), false);
});
