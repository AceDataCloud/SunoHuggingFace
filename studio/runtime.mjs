import { requestJson, ServiceError, validateToken, validateTaskId, safeMediaUrl } from "../client.mjs";
import { prepareRequest, PROFILES } from "./services.mjs";

const FAILED = new Set(["failed", "error", "cancelled", "canceled", "rejected"]);
const DONE = new Set(["complete", "completed", "succeeded", "success"]);

function base64Image(value) {
  if (typeof value !== "string" || value.length > 24_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  try {
    const bytes = atob(value.slice(0, 32));
    const mime = bytes.startsWith("\x89PNG\r\n\x1a\n") ? "image/png" :
      bytes.startsWith("\xff\xd8\xff") ? "image/jpeg" :
      bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP" ? "image/webp" : null;
    return mime ? `data:${mime};base64,${value}` : null;
  } catch { return null; }
}

export function normalizeMedia(raw, slug, requestedId = "", retrieved = false) {
  const profile = PROFILES[slug]; if (!profile) throw new ServiceError("Unknown media service.");
  if (raw == null) return { status: "pending", taskId: requestedId, traceId: "", media: [] };
  if (typeof raw !== "object" || Array.isArray(raw)) throw new ServiceError("Unexpected service response.");
  if (requestedId && ((raw.id && raw.id !== requestedId) || (raw.task_id && raw.task_id !== requestedId))) {
    throw new ServiceError("Task ID mismatch. Keep your original ID and inspect history.");
  }
  const taskId = requestedId || (typeof raw.task_id === "string" ? raw.task_id : "");
  let body = retrieved && Object.hasOwn(raw, "response") ? raw.response : raw;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object" || Array.isArray(body)) body = {};
  const states = [], media = []; let failed = false;
  function visit(node, depth = 0) {
    if (!node || typeof node !== "object" || depth > 8) return;
    if (Array.isArray(node)) { for (const item of node) visit(item, depth + 1); return; }
    for (const name of ["state", "status"]) if (typeof node[name] === "string") states.push(node[name].toLowerCase());
    if (node.success === false || node.error) failed = true;
    const url = safeMediaUrl(profile.media === "video" ? node.video_url : node.image_url || node.url);
    const dataUrl = profile.media === "image" && !url ? base64Image(node.b64_json) : null;
    if (url || dataUrl) media.push({ kind: profile.media, url: url || dataUrl,
      title: typeof node.title === "string" ? node.title.slice(0, 200) : profile.name + " result" });
    for (const key of ["data", "content", "result", "output"]) visit(node[key], depth + 1);
  }
  for (const name of ["state", "status"]) if (typeof raw[name] === "string") states.push(raw[name].toLowerCase());
  visit(body);
  const unfinished = retrieved && Object.hasOwn(raw, "finished_at") && raw.finished_at === null;
  // Cancellation/rejection is terminal even if finished_at has not caught up.
  const hasFailed = failed || states.some((s) => FAILED.has(s));
  const pending = states.some((s) => !DONE.has(s) && !FAILED.has(s));
  // OpenAI image response uses created/data rather than success; task wrapper must be terminal.
  const imageShape = slug === "gpt-image" && typeof body.created === "number" && Array.isArray(body.data);
  const imageTerminal = imageShape && (!retrieved || Boolean(raw.finished_at));
  const explicitSuccess = body.success === true || states.some((s) => DONE.has(s)) || imageTerminal;
  const terminalPayload = media.length > 0 || states.some((s) => DONE.has(s)) ||
    (retrieved && Boolean(raw.finished_at));
  const complete = !unfinished && !hasFailed && !pending && explicitSuccess && terminalPayload;
  return { status: hasFailed ? "failed" : complete ? "succeeded" : "pending", taskId,
    traceId: typeof body.trace_id === "string" ? body.trace_id : typeof raw.trace_id === "string" ? raw.trace_id : "",
    media: complete ? [...new Map(media.map((m) => [m.url, m])).values()] : [] };
}

function redact(result, token) {
  if (result.taskId && result.taskId.includes(token)) throw new ServiceError("Unexpected task identity; inspect history.", null, true);
  return { ...result, traceId: result.traceId.replaceAll(token, "[redacted]"),
    media: result.media.filter((m) => !m.url.includes(token)).map((m) => ({ ...m, title: m.title.replaceAll(token, "[redacted]") })) };
}

export function createMediaClient(slug, fetchImpl = globalThis.fetch) {
  const profile = PROFILES[slug]; if (!profile) throw new ServiceError("Unknown media service.");
  return {
    validate: (input) => prepareRequest(slug, input),
    async generate(token, input) {
      const credential = validateToken(token), { path, body } = prepareRequest(slug, input);
      if (JSON.stringify(body).includes(credential)) {
        throw new ServiceError("Do not include your API token in prompts or reference URLs.");
      }
      const raw = await requestJson(fetchImpl, path, token, body, true);
      try {
        const result = redact(normalizeMedia(raw, slug), credential);
        if (result.taskId) validateTaskId(result.taskId);
        else if (result.status !== "succeeded" || result.media.length === 0) throw new Error();
        return result;
      } catch {
        throw new ServiceError("Unexpected accepted response. Inspect request history before generating again.", null, true);
      }
    },
    async retrieve(token, value) {
      const credential = validateToken(token), id = validateTaskId(value);
      if (id.includes(credential)) throw new ServiceError("Do not paste your token as a task ID.");
      const raw = await requestJson(fetchImpl, profile.taskPath, token, { action: "retrieve", id }, false);
      return redact(normalizeMedia(raw, slug, id, true), credential);
    },
  };
}
