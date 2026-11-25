import { ServiceError, safeMediaUrl } from "../client.mjs";

const AUDIOS = "/acemusic/audios";
const LYRICS = "/acemusic/lyrics";
const failed = new Set(["failed", "cancelled", "canceled", "rejected", "error"]);
const running = new Set(["created", "submitting", "processing", "storing", "queued", "pending", "submission_unknown"]);

function fieldText(value, name) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || Array.from(text).length > 20000) throw new ServiceError(name + " must contain 1–20,000 characters.");
  return text;
}

export function aceMusicRequest(input) {
  const { mode, model } = input;
  if (mode === "lyrics") {
    const body = { prompt: fieldText(input.prompt, "Lyrics idea") };
    if (input.style?.trim()) body.style = fieldText(input.style, "Style");
    return { path: LYRICS, body };
  }
  if (mode === "upload") {
    const url = safeMediaUrl(fieldText(input.audioUrl, "Reference MP3 URL"));
    if (!url) throw new ServiceError("Provide a public HTTPS URL to an authorized MP3.");
    return { path: AUDIOS, body: { action: "upload", audio_url: url, async: true } };
  }
  if (!["acemusic-v1.1", "acemusic-v1"].includes(model)) throw new ServiceError("Select an ACE Music model.");
  if (mode === "idea") {
    return { path: AUDIOS, body: { action: "generate", custom: false, model, prompt: fieldText(input.prompt, "Song idea"), async: true } };
  }
  const body = { action: mode, model, lyric: fieldText(input.lyric, "Lyrics"), style: fieldText(input.style, "Style"), async: true };
  if (mode === "custom") {
    return { path: AUDIOS, body: { ...body, action: "generate", custom: true, title: fieldText(input.title, "Title") } };
  }
  if (!["cover", "mashup"].includes(mode) || model !== "acemusic-v1.1") throw new ServiceError("Covers and mashups require acemusic-v1.1.");
  if (input.title?.trim()) body.title = fieldText(input.title, "Title");
  if (input.influence !== "" && input.influence != null) {
    const value = Number(input.influence);
    if (!Number.isFinite(value) || value < 1 || value > 100) throw new ServiceError("Audio influence must be between 1 and 100.");
    body.audio_influence = value;
  }
  const first = fieldText(input.track, "Owned track ID");
  if (mode === "cover") body.audio_id = first;
  else {
    const second = fieldText(input.secondTrack, "Second owned track ID");
    if (first === second) throw new ServiceError("Choose two different owned track IDs.");
    body.mashup_audio_ids = [first, second];
  }
  return { path: AUDIOS, body };
}

export function aceMusicResult(raw, body, taskId) {
  if (body.task_id && taskId && body.task_id !== taskId) throw new ServiceError("Task ID mismatch. Keep the original ID.");
  const state = raw.state || raw.status || body.state || body.status;
  const data = Array.isArray(body.data) ? body.data : [];
  const result = { taskId, traceId: typeof raw.trace_id === "string" ? raw.trace_id : typeof body.trace_id === "string" ? body.trace_id : "", status: "pending", media: [] };
  if (running.has(state)) return result;
  if (failed.has(state) || (!state && (body.error || body.success === false || data.some(item => failed.has(item?.state))))) {
    return { ...result, status: "failed" };
  }
  if (state !== "succeeded" && state !== "partial_failed") return result;
  const media = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const title = typeof row.title === "string" ? row.title.slice(0, 200) : "ACE Music";
    const url = safeMediaUrl(row.audio_url);
    if (url && row.state === "succeeded") {
      media.push({ kind: "audio", title, url, trackId: typeof row.id === "string" ? row.id : "" });
    } else if (typeof row.text === "string" && row.text && state === "succeeded" && (!row.state || row.state === "succeeded")) {
      media.push({ kind: "lyrics", title, text: row.text });
    }
  }
  return { ...result, status: state, media };
}
