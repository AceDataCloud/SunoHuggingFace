import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createClient, generationPayload, normalizeResult, safeMediaUrl, TaskSession } from "../client.mjs";

const input = { prompt: "A short gentle piano melody", model: "chirp-v6", instrumental: true };
const token = "fixture-token-not-a-real-key";
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status,
  json: async () => data });

test("one explicit generation, fixed origin, no redirect or credential persistence", async () => {
  const calls = [];
  const client = createClient(async (url, options) => {
    calls.push({ url, options }); return response({ task_id: "task-one" });
  });
  const result = await client.generate(token, input);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.acedata.cloud/suno/audios");
  assert.deepEqual(JSON.parse(calls[0].options.body), { action: "generate", model: "chirp-v6",
    prompt: input.prompt, custom: false, instrumental: true, async: true });
  assert.equal(calls[0].options.redirect, "error");
  assert.equal(calls[0].options.credentials, "omit");
  assert.equal(result.status, "pending");
});

test("query is only retrieve of the original task ID and preserves pending previews", async () => {
  let captured;
  const client = createClient(async (url, options) => {
    captured = { url, payload: JSON.parse(options.body) };
    return response({ id: "task-one", finished_at: null,
      response: { success: true, data: [{ audio_url: "https://cdn.example/preview.mp3" }] } });
  });
  const result = await client.retrieve(token, "task-one");
  assert.deepEqual(captured, { url: "https://api.acedata.cloud/suno/tasks",
    payload: { action: "retrieve", id: "task-one" } });
  assert.equal(result.status, "pending"); assert.deepEqual(result.tracks, []);
});

test("explicit pending/processing and missing success cannot be inferred from a URL", () => {
  for (const raw of [
    { state: "processing", response: { success: true, data: [{ audio_url: "https://cdn.example/a.mp3" }] } },
    { status: "pending", response: { success: true, data: [{ audio_url: "https://cdn.example/a.mp3" }] } },
    { response: { data: [{ audio_url: "https://cdn.example/a.mp3" }] } },
    { response: "not-json" }, null,
  ]) {
    const result = normalizeResult(raw, "task-one", true);
    assert.equal(result.status, "pending"); assert.deepEqual(result.tracks, []);
  }
});

test("terminal failure wins over success and terminal success requires valid media", () => {
  assert.equal(normalizeResult({ state: "failed", response: { success: true } }, "task-one", true).status, "failed");
  const result = normalizeResult({ id: "task-one", finished_at: "2026-10-18", response: {
    success: true, data: [{ title: "Song", state: "succeeded", audio_url: "https://cdn.example/song.mp3" }],
  } }, "task-one", true);
  assert.equal(result.status, "succeeded"); assert.equal(result.tracks.length, 1);
  assert.throws(() => normalizeResult({ id: "other" }, "task-one", true), /mismatch/);
});

test("terminal Suno cancellation/failure wins over a null completion timestamp", () => {
  for (const state of ["failed", "cancelled", "canceled", "rejected", "error"]) {
    for (const position of ["wrapper", "body", "track"]) {
      const raw = { id: "task-one", finished_at: null, response: { success: true,
        data: [{ state: "succeeded", audio_url: "https://cdn.example/not-final.mp3" }] } };
      if (position === "wrapper") raw.state = state;
      if (position === "body") raw.response.status = state;
      if (position === "track") raw.response.data[0].state = state;
      const result = normalizeResult(raw, "task-one", true);
      assert.equal(result.status, "failed", `${position}:${state}`);
      assert.deepEqual(result.tracks, []);
    }
  }
  for (const response of [{ success: false }, { error: { code: "rejected" } }]) {
    assert.equal(normalizeResult({ id: "task-one", finished_at: null, response }, "task-one", true).status, "failed");
  }
});

test("retrieving a cancelled task never retries or reopens generation", async () => {
  let calls = 0;
  const session = new TaskSession(createClient(async (url) => {
    calls++;
    assert.equal(url, "https://api.acedata.cloud/suno/tasks");
    return response({ id: "task-one", finished_at: null, state: "cancelled",
      response: { success: true, data: [{ audio_url: "https://cdn.example/preview.mp3" }] } });
  }));
  const result = await session.retrieve(token, "task-one");
  assert.equal(result.status, "failed"); assert.deepEqual(result.tracks, []);
  await assert.rejects(session.generate(token, input, true), /do not regenerate/);
  assert.equal(calls, 1);
});

test("429, 403, 500 and network errors are not retried or replaced", async () => {
  for (const status of [429, 403, 500]) {
    let calls = 0;
    const client = createClient(async () => { calls++; return response({}, status); });
    await assert.rejects(client.generate(token, input), (e) => e.status === status);
    assert.equal(calls, 1);
  }
  let calls = 0;
  const client = createClient(async () => { calls++; throw new Error("contains " + token); });
  await assert.rejects(client.generate(token, input), (e) => e.unknownOutcome && !e.message.includes(token));
  assert.equal(calls, 1);
});

test("cost consent, concurrency, pending identity and 15 second query gate", async () => {
  let now = 0, generated = 0, queried = 0;
  const session = new TaskSession({
    generate: async () => { generated++; return { taskId: "task-one", status: "pending" }; },
    retrieve: async () => { queried++; return { taskId: "task-one", status: "succeeded" }; },
  }, () => now);
  await assert.rejects(session.generate(token, input, false), /acknowledge/);
  assert.equal(generated, 0);
  const first = session.generate(token, input, true);
  await assert.rejects(session.generate(token, input, true), /do not regenerate/);
  await first;
  await assert.rejects(session.generate(token, input, true), /do not regenerate/);
  await assert.rejects(session.retrieve(token, "different-id"), /same accepted/);
  await assert.rejects(session.retrieve(token, "task-one"), /15 seconds/);
  assert.throws(() => session.resetAfterHistoryReview(true), /finish/);
  now = 15000; await session.retrieve(token, "task-one");
  assert.equal(generated, 1); assert.equal(queried, 1);
});

test("ambiguous submission locks generation until explicit history review", async () => {
  const session = new TaskSession(createClient(async () => { throw new Error("timeout"); }));
  await assert.rejects(session.generate(token, input, true), /unknown/);
  assert.equal(session.state, "unknown");
  await assert.rejects(session.generate(token, input, true), /do not regenerate/);
  assert.throws(() => session.resetAfterHistoryReview(false), /Review/);
  session.resetAfterHistoryReview(true); assert.equal(session.state, "idle");
});

test("malformed 2xx submission also locks another paid request", async () => {
  for (const body of [["unexpected"], "unexpected", {}, { task_id: "bad/id" }]) {
    let calls = 0;
    const session = new TaskSession(createClient(async () => { calls++; return response(body); }));
    await assert.rejects(session.generate(token, input, true), (e) => e.unknownOutcome);
    assert.equal(session.state, "unknown");
    await assert.rejects(session.generate(token, input, true), /do not regenerate/);
    assert.equal(calls, 1);
  }
});

test("secrets and untrusted media are never echoed into renderable results", async () => {
  assert.equal(safeMediaUrl("javascript:alert(1)"), null);
  assert.equal(safeMediaUrl("https://user:pass@cdn.example/audio.mp3"), null);
  assert.equal(safeMediaUrl("https://cdn.example/audio.mp3?api_key=secret"), null);
  const client = createClient(async () => response({ id: "task-one", response: {
    success: true, trace_id: token, data: [
      { title: token, audio_url: "https://cdn.example/song.mp3" },
      { title: "Bad", audio_url: "https://cdn.example/" + token + ".mp3" },
    ],
  } }));
  const result = await client.retrieve(token, "task-one");
  assert.equal(result.tracks.length, 1); assert.ok(!JSON.stringify(result).includes(token));
});

test("invalid auth, unsupported model and input fail before HTTP", async () => {
  let calls = 0; const client = createClient(async () => { calls++; return response({}); });
  for (const invalid of ["", "Bearer example", "platform-management", "token\nheader"]) {
    await assert.rejects(client.generate(invalid, input));
  }
  assert.throws(() => generationPayload({ ...input, model: "different-model" }), /no replacement/);
  assert.throws(() => generationPayload({ ...input, prompt: "a".repeat(501) }));
  assert.equal(calls, 0);
});

test("no storage, external scripts, unsafe HTML insertion or automatic timers", () => {
  const app = readFileSync(new URL("../app.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(app, /localStorage|sessionStorage|document\.cookie|innerHTML|setInterval|setTimeout/);
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /type="password"/); assert.match(html, /connect-src https:\/\/api\.acedata\.cloud/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
});
