import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TaskSession } from "../client.mjs";
import { PROFILES, prepareRequest } from "../studio/services.mjs";
import { createMediaClient, normalizeMedia } from "../studio/runtime.mjs";

const secret = "fixture-api-token-not-real";
const defaults = {
  seedance: { mode: "text", model: "doubao-seedance-2-0-fast-260128", prompt: "A mug in sunlight", resolution: "480p", ratio: "16:9", duration: 5, generateAudio: false },
  happyhorse: { mode: "generate", model: "happyhorse-1.1-t2v", prompt: "A horse running", resolution: "720P", ratio: "16:9", duration: 5 },
  "gpt-image": { mode: "generate", model: "gpt-image-2", prompt: "A blue teapot", count: 1, size: "1024x1024", quality: "auto", background: "auto", outputFormat: "png" },
  "nano-banana": { mode: "generate", model: "nano-banana-2-lite", prompt: "A yellow sculpture", count: 1, aspectRatio: "1:1", resolution: "1K" },
};
const fixtures = [];
const remember = (slug, input) => { const value = prepareRequest(slug, input); fixtures.push({ slug, input, ...value }); return value; };
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const schema = JSON.parse(readFileSync(new URL("../docs/top5-20261018/api-schemas.json", import.meta.url), "utf8"));

function validate(value, rule, path = "payload") {
  if (rule.oneOf) {
    let matched = 0;
    for (const branch of rule.oneOf) { try { validate(value, branch, path); matched++; } catch {} }
    assert.equal(matched, 1, path + " oneOf"); return;
  }
  if (rule.enum) assert.ok(rule.enum.includes(value), path + " enum " + value);
  if (rule.type === "object") {
    assert.ok(value && typeof value === "object" && !Array.isArray(value), path);
    for (const required of rule.required || []) assert.ok(Object.hasOwn(value, required), path + "." + required);
    for (const [key, v] of Object.entries(value)) {
      const child = rule.properties?.[key];
      if (!child) { assert.notEqual(rule.additionalProperties, false, path + "." + key); continue; }
      validate(v, child, path + "." + key);
    }
  } else if (rule.type === "array") {
    assert.ok(Array.isArray(value), path);
    if (rule.minItems !== undefined) assert.ok(value.length >= rule.minItems, path);
    if (rule.maxItems !== undefined) assert.ok(value.length <= rule.maxItems, path);
    for (const item of value) validate(item, rule.items, path + "[]");
  } else if (rule.type === "string") {
    assert.equal(typeof value, "string", path);
    if (rule.maxLength) assert.ok(Array.from(value).length <= rule.maxLength, path);
    if (rule.pattern) assert.match(value, new RegExp(rule.pattern), path);
  } else if (rule.type === "integer") {
    assert.ok(Number.isInteger(value), path);
    if (rule.minimum !== undefined) assert.ok(value >= rule.minimum, path);
    if (rule.maximum !== undefined) assert.ok(value <= rule.maximum, path);
  } else if (rule.type === "boolean") assert.equal(typeof value, "boolean", path);
}

test("Seedance builds actual nested content for text, frames and references", () => {
  const text = remember("seedance", defaults.seedance);
  assert.equal(text.path, "/seedance/videos"); assert.deepEqual(text.body.content, [{ type: "text", text: defaults.seedance.prompt }]);
  const frame = remember("seedance", { ...defaults.seedance, mode: "frames", firstFrame: "https://example.org/first.png", lastFrame: "https://example.org/last.png" });
  assert.equal(frame.body.content[1].role, "first_frame"); assert.equal(frame.body.content[2].role, "last_frame");
  const ref = remember("seedance", { ...defaults.seedance, mode: "reference", imageUrls: "https://example.org/ref.png", audioUrls: "https://example.org/ref.mp3", videoUrls: "https://example.org/ref.mp4", referenceType: "auto" });
  assert.deepEqual(ref.body.content.slice(1).map((x) => x.role), ["reference_image", "reference_audio", "reference_video"]);
  assert.ok(!Object.hasOwn(ref.body, "omni_reference_task_type"));
});

test("Seedance validates model-specific limits and native2.5 edit/extend", () => {
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, resolution: "4k" }), /Resolution/);
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, duration: 3 }), /at least 4/);
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, mode: "frames", lastFrame: "https://example.org/last.png" }));
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, mode: "reference", audioUrls: "https://example.org/ref.mp3" }), /also requires/);
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, mode: "reference", imageUrls: "https://example.org/ref.png", referenceType: "edit" }), /2.5 only/);
  assert.throws(() => prepareRequest("seedance", { ...defaults.seedance, model: "doubao-seedance-2-5-260628", mode: "reference", imageUrls: "https://example.org/ref.png", referenceType: "extend" }), /reference video/);
  const edit = remember("seedance", { ...defaults.seedance, model: "doubao-seedance-2-5-260628", mode: "reference", videoUrls: "https://example.org/ref.mp4", referenceType: "edit", duration: 30, resolution: "1080p" });
  assert.equal(edit.body.omni_reference_task_type, "edit"); assert.equal(edit.body.duration, 30);
  remember("seedance", { ...defaults.seedance, model: "doubao-seedance-2-5-260628", mode: "reference", audioUrls: "https://example.org/ref.mp3", referenceType: "auto", duration: -1 });
});

test("HappyHorse actions match exact model and native per-action fields", () => {
  remember("happyhorse", defaults.happyhorse);
  const image = remember("happyhorse", { ...defaults.happyhorse, mode: "image_to_video", model: "happyhorse-1.1-i2v", imageUrl: "https://example.org/first.png" });
  assert.equal(image.body.image_url, "https://example.org/first.png"); assert.ok(!Object.hasOwn(image.body, "ratio"));
  remember("happyhorse", { ...defaults.happyhorse, mode: "reference_to_video", model: "happyhorse-1.1-r2v", imageUrls: "https://example.org/a.png\nhttps://example.org/b.png" });
  const edit = remember("happyhorse", { ...defaults.happyhorse, mode: "video_edit", model: "happyhorse-1.0-video-edit", videoUrl: "https://example.org/v.mp4", imageUrls: "", audioSetting: "origin" });
  assert.equal(edit.body.audio_setting, "origin"); assert.ok(!Object.hasOwn(edit.body, "duration")); assert.ok(!Object.hasOwn(edit.body, "ratio"));
  assert.throws(() => prepareRequest("happyhorse", { ...defaults.happyhorse, mode: "image_to_video" }), /model/);
  assert.throws(() => prepareRequest("happyhorse", { ...defaults.happyhorse, mode: "reference_to_video", model: "happyhorse-1.1-r2v", imageUrls: "" }));
});

test("GPT Image separate generate/edit paths; count/format/reference validation", () => {
  const generated = remember("gpt-image", defaults["gpt-image"]); assert.equal(generated.path, "/openai/images/generations"); assert.equal(generated.body.n, 1);
  const edit = remember("gpt-image", { ...defaults["gpt-image"], mode: "edit", imageUrls: "https://example.org/a.png", inputFidelity: "high" });
  assert.equal(edit.path, "/openai/images/edits"); assert.deepEqual(edit.body.image, ["https://example.org/a.png"]);
  assert.equal(edit.body.input_fidelity, "high"); assert.equal(edit.body.response_format, "url");
  assert.throws(() => prepareRequest("gpt-image", { ...defaults["gpt-image"], background: "transparent", outputFormat: "jpeg" }), /Transparent/);
  assert.throws(() => prepareRequest("gpt-image", { ...defaults["gpt-image"], mode: "edit", imageUrls: "", inputFidelity: "low" }));
});

test("Nano Banana distinct action/reference/count/aspect/resolution fields", () => {
  const generated = remember("nano-banana", { ...defaults["nano-banana"], imageUrls: "https://example.org/stale.png" });
  assert.ok(!Object.hasOwn(generated.body, "image_urls")); assert.equal(generated.body.aspect_ratio, "1:1"); assert.equal(generated.body.count, 1);
  const edited = remember("nano-banana", { ...defaults["nano-banana"], mode: "edit", imageUrls: "https://example.org/ref.png", resolution: "2K" });
  assert.equal(edited.body.action, "edit"); assert.equal(edited.body.image_urls.length, 1);
  assert.throws(() => prepareRequest("nano-banana", { ...defaults["nano-banana"], mode: "edit", imageUrls: "https://user:pass@example.org/a.png" }));
  assert.throws(() => prepareRequest("nano-banana", { ...defaults["nano-banana"], count: 5 }));
});

test("native payloads conform to existing single-source API schemas", () => {
  assert.ok(fixtures.length >= 12);
  const bySlug = { seedance: "SeedanceDify", happyhorse: "HappyHorseDify", "gpt-image": "GPTImageDify", "nano-banana": "NanoBananaDify" };
  for (const fixture of fixtures) {
    const contracts = Object.values(schema.schemas[bySlug[fixture.slug]]).filter((x) => x.path === fixture.path);
    assert.ok(contracts.length, fixture.path); validate(fixture.body, contracts[0].schema);
  }
});

test("all four clients use fixed native paths and same-ID retrieval, with no paid retries", async () => {
  for (const slug of Object.keys(PROFILES)) {
    const calls = [], client = createMediaClient(slug, async (url, options) => {
      calls.push({ url, options });
      return response(url.endsWith(PROFILES[slug].taskPath) ? { id: "task1", response: null } : { task_id: "task1" });
    });
    const result = await client.generate(secret, defaults[slug]); assert.equal(result.status, "pending");
    await client.retrieve(secret, "task1");
    assert.equal(calls.length, 2); assert.equal(calls[1].url, "https://api.acedata.cloud" + PROFILES[slug].taskPath);
    assert.deepEqual(JSON.parse(calls[1].options.body), { action: "retrieve", id: "task1" });
    assert.equal(calls[0].options.redirect, "error");
  }
});

test("nested video result and image results normalize only after terminal proof", () => {
  const nested = { id: "task1", finished_at: 1, response: { success: true, data: { status: "succeeded", video_url: "https://example.org/out.mp4" } } };
  assert.equal(normalizeMedia(nested, "seedance", "task1", true).media[0].kind, "video");
  for (const slug of ["seedance", "happyhorse", "nano-banana"]) {
    assert.equal(normalizeMedia({ success: true, task_id: "accepted" }, slug).status, "pending");
    const raw = { id: "task1", finished_at: null, response: { success: true, data: [{ state: "processing", video_url: "https://example.org/preview.mp4", image_url: "https://example.org/preview.png" }] } };
    const result = normalizeMedia(raw, slug, "task1", true); assert.equal(result.status, "pending"); assert.deepEqual(result.media, []);
    raw.finished_at = 1; raw.response.data[0].state = "failed"; assert.equal(normalizeMedia(raw, slug, "task1", true).status, "failed");
  }
  assert.throws(() => normalizeMedia({ id: "other" }, "seedance", "task1", true), /mismatch/);
});

test("OpenAI image created/data shape requires finished wrapper and safe image Base64", () => {
  const image = { created: 1, data: [{ url: "https://example.org/final.png" }] };
  assert.equal(normalizeMedia(image, "gpt-image").status, "succeeded");
  assert.equal(normalizeMedia({ id: "task1", response: image }, "gpt-image", "task1", true).status, "pending");
  assert.equal(normalizeMedia({ id: "task1", finished_at: 1, response: image }, "gpt-image", "task1", true).status, "succeeded");
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
  const result = normalizeMedia({ created: 1, data: [{ b64_json: png }, { b64_json: btoa("<svg onload=alert(1)>") }] }, "gpt-image");
  assert.equal(result.media.length, 1); assert.match(result.media[0].url, /^data:image\/png;base64,/);
});

test("service errors, malformed accepted payloads and token echoes cannot trigger duplicate generation", async () => {
  for (const slug of Object.keys(PROFILES)) {
    for (const status of [403, 429, 500]) {
      let count = 0; const client = createMediaClient(slug, async () => { count++; return response({ token: secret }, status); });
      await assert.rejects(client.generate(secret, defaults[slug]), (e) => e.status === status && !e.message.includes(secret)); assert.equal(count, 1);
    }
    const session = new TaskSession(createMediaClient(slug, async () => response(["malformed"])));
    await assert.rejects(session.generate(secret, defaults[slug], true), (e) => e.unknownOutcome);
    assert.equal(session.state, "unknown"); await assert.rejects(session.generate(secret, defaults[slug], true), /do not regenerate/);
    const echo = createMediaClient(slug, async () => response({ id: "task1", finished_at: 1, response: { success: true, trace_id: secret,
      data: [{ title: secret, video_url: "https://example.org/v.mp4", image_url: "https://example.org/i.png" }] } }));
    const result = await echo.retrieve(secret, "task1"); assert.ok(!JSON.stringify(result).includes(secret));
  }
});

test("shared session validates the selected service, cost consent and same-ID gate", async () => {
  let calls = 0, now = 0;
  const session = new TaskSession(createMediaClient("nano-banana", async () => { calls++; return response({ task_id: "task1" }); }), () => now);
  await assert.rejects(session.generate(secret, defaults["nano-banana"], false), /acknowledge/);
  await assert.rejects(session.generate(secret, { ...defaults["nano-banana"], model: "chirp-v6" }, true), /model/);
  assert.equal(calls, 0); await session.generate(secret, defaults["nano-banana"], true);
  await assert.rejects(session.retrieve(secret, "different"), /same accepted/); await assert.rejects(session.retrieve(secret, "task1"), /15 seconds/);
  assert.equal(calls, 1); now = 15000;
});

test("reference URLs or prompts cannot leak the API credential through a media request", async () => {
  let calls = 0;
  const client = createMediaClient("gpt-image", async () => { calls++; return response({}); });
  await assert.rejects(client.generate(secret, { ...defaults["gpt-image"], prompt: secret }), /Do not include/);
  await assert.rejects(client.generate(secret, { ...defaults["gpt-image"], mode: "edit",
    imageUrls: "https://example.org/" + secret + ".png", inputFidelity: "high" }), /Do not include/);
  assert.equal(calls, 0);
});

test("four applications use local modules, no storage/HTML injection or auto polling", () => {
  const app = readFileSync(new URL("../studio/app.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(app, /innerHTML|localStorage|sessionStorage|document\.cookie|setInterval|setTimeout/);
  const html = readFileSync(new URL("../studio/index.html", import.meta.url), "utf8");
  assert.match(html, /type="password"/); assert.match(html, /script-src 'self'/); assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.match(app, /profile\.media|item\.kind/);
});
