import test from "node:test";
import assert from "node:assert/strict";
import { createMediaClient, normalizeMedia } from "../studio/runtime.mjs";
import { prepareRequest } from "../studio/services.mjs";

const make = input => prepareRequest("acemusic", input);
const model = "acemusic-v1.1";
const tracks = ["one", "two"].map(id => ({ id, state: "succeeded", title: "Track " + id, audio_url: "https://example.org/" + id + ".mp3" }));

test("ACE Music creates distinct song, lyric and reference requests", () => {
  assert.deepEqual(make({ mode: "idea", prompt: "Night train", model }).body,
    { action: "generate", custom: false, prompt: "Night train", model, async: true });
  assert.deepEqual(make({ mode: "custom", title: "Train", lyric: "Verse", style: "folk", model: "acemusic-v1" }).body,
    { action: "generate", custom: true, title: "Train", lyric: "Verse", style: "folk", model: "acemusic-v1", async: true });
  assert.deepEqual(make({ mode: "lyrics", prompt: "Night train", style: "folk", model }).body, { prompt: "Night train", style: "folk" });
  assert.equal(make({ mode: "lyrics", prompt: "Night train" }).path, "/acemusic/lyrics");
  assert.deepEqual(make({ mode: "upload", audioUrl: "https://example.org/ref.mp3" }).body,
    { action: "upload", audio_url: "https://example.org/ref.mp3", async: true });
  assert.throws(() => make({ mode: "upload", audioUrl: "http://example.org/ref.mp3" }));
  const ref = { model, lyric: "Verse", style: "folk", track: "one", influence: "40" };
  assert.deepEqual(make({ mode: "cover", ...ref }).body,
    { action: "cover", model, lyric: "Verse", style: "folk", audio_id: "one", audio_influence: 40, async: true });
  assert.deepEqual(make({ mode: "mashup", ...ref, secondTrack: "two" }).body.mashup_audio_ids, ["one", "two"]);
  assert.throws(() => make({ mode: "mashup", ...ref, secondTrack: "one" }));
  assert.throws(() => make({ mode: "cover", ...ref, model: "acemusic-v1" }));
});

test("ACE Music shows completed audio and track IDs while keeping previews hidden", () => {
  const task = (state, data, success = true) => normalizeMedia({ id: "original", state, response: {
    task_id: "original", success, data,
  } }, "acemusic", "original", true);
  assert.deepEqual(task("succeeded", tracks).media.map(row => [row.kind, row.trackId, row.url]),
    tracks.map(row => ["audio", row.id, row.audio_url]));
  const partial = task("partial_failed", [tracks[0], { ...tracks[1], state: "failed" }], false);
  assert.equal(partial.status, "partial_failed");
  assert.deepEqual(partial.media.map(item => item.trackId), ["one"]);
  for (const state of ["processing", "storing", "submission_unknown"]) {
    assert.deepEqual(task(state, tracks, false).media, []);
    assert.equal(task(state, tracks, false).status, "pending");
  }
  assert.deepEqual(task("succeeded", [tracks[0]]).media.map(item => item.trackId), ["one"]);
  assert.deepEqual(task("failed", tracks, false).media, []);
});

test("ACE Music recovers lyrics and rejects mismatched task identity", async () => {
  const client = createMediaClient("acemusic", async (url, options) => {
    assert.equal(url, "https://api.acedata.cloud/acemusic/tasks");
    assert.deepEqual(JSON.parse(options.body), { action: "retrieve", id: "original" });
    return { ok: true, json: async () => ({ id: "original", state: "succeeded", response: {
      task_id: "original", data: [{ title: "Night", text: "First line\nChorus" }],
    } }) };
  });
  const result = await client.retrieve("fixture-credential", "original");
  assert.deepEqual(result.media, [{ title: "Night", kind: "lyrics", text: "First line\nChorus" }]);
  assert.throws(() => normalizeMedia({ id: "original", response: { task_id: "other" } }, "acemusic", "original", true));
});
