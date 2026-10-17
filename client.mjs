export const API_ORIGIN = "https://api.acedata.cloud";
export const MODELS = Object.freeze(["chirp-v6", "chirp-v6-wild", "chirp-v6-mini"]);
const FAILED = new Set(["failed", "error", "cancelled", "canceled", "rejected"]);
const COMPLETE = new Set(["complete", "completed", "succeeded", "success"]);

export class ServiceError extends Error {
  constructor(message, status = null, unknownOutcome = false) {
    super(message);
    this.status = status;
    this.unknownOutcome = unknownOutcome;
  }
}

export function validateToken(value) {
  const token = typeof value === "string" ? value.trim() : "";
  if (!token || /\s/.test(token) || /^Bearer\b/i.test(token) || token.startsWith("platform-")) {
    throw new ServiceError("Paste only an Ace application API token, without Bearer or spaces.");
  }
  return token;
}

export function validateTaskId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,199}$/.test(id)) {
    throw new ServiceError("Enter the task ID returned by Suno. Do not paste a URL or token.");
  }
  return id;
}

export function generationPayload({ prompt, model, instrumental = true }) {
  const text = typeof prompt === "string" ? prompt.trim() : "";
  if (!text || Array.from(text).length > 500) {
    throw new ServiceError("Describe your music in 1–500 characters.");
  }
  if (!MODELS.includes(model)) throw new ServiceError("Select a supported model; no replacement is used.");
  if (typeof instrumental !== "boolean") throw new ServiceError("Instrumental must be true or false.");
  return { action: "generate", model, prompt: text, custom: false, instrumental, async: true };
}

export function safeMediaUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    // Never publish signed query credentials or URLs containing the application token.
    for (const key of u.searchParams.keys()) {
      if (/token|authorization|api[_-]?key/i.test(key)) return null;
    }
    return u.href;
  } catch {
    return null;
  }
}

export function normalizeResult(raw, requestedTaskId = "", retrieved = false) {
  if (raw === null || raw === undefined) {
    return { status: "pending", taskId: requestedTaskId, traceId: "", tracks: [] };
  }
  if (typeof raw !== "object" || Array.isArray(raw)) throw new ServiceError("Unexpected API response.");
  const id = requestedTaskId || (typeof raw.task_id === "string" ? raw.task_id : "");
  if (raw.id && requestedTaskId && raw.id !== requestedTaskId) {
    throw new ServiceError("Task ID mismatch. Keep your original ID and inspect request history.");
  }
  let body = retrieved && Object.hasOwn(raw, "response") ? raw.response : raw;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) body = {};
  const states = [raw.state, raw.status, body.state, body.status]
    .filter((x) => typeof x === "string").map((x) => x.toLowerCase());
  const data = Array.isArray(body.data) ? body.data : [];
  const itemStates = data.map((x) => x?.state).filter((x) => typeof x === "string")
    .map((x) => x.toLowerCase());
  const unfinished = retrieved && Object.hasOwn(raw, "finished_at") && raw.finished_at === null;
  const failed = !unfinished && (body.success === false || body.error || states.some((s) => FAILED.has(s))
    || itemStates.some((s) => FAILED.has(s)));
  const explicitSuccess = body.success === true || states.some((s) => COMPLETE.has(s));
  const stillRunning = [...states, ...itemStates].some((s) => !COMPLETE.has(s) && !FAILED.has(s));
  const complete = !unfinished && !failed && explicitSuccess && !stillRunning;
  // Preview URLs and HTTP 200 alone never make a task terminal.
  const tracks = complete ? data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const url = safeMediaUrl(item.audio_url);
    return url ? [{ url, title: typeof item.title === "string" ? item.title.slice(0, 200) : "Audio" }] : [];
  }) : [];
  const traceId = typeof body.trace_id === "string" ? body.trace_id :
    typeof raw.trace_id === "string" ? raw.trace_id : "";
  return { status: failed ? "failed" : complete ? "succeeded" : "pending", taskId: id, traceId, tracks };
}

export function createClient(fetchImpl = globalThis.fetch) {
  async function request(path, token, payload, submission) {
    const credential = validateToken(token);
    let response;
    try {
      response = await fetchImpl(API_ORIGIN + path, {
        method: "POST", headers: { Authorization: "Bearer " + credential,
          "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload), credentials: "omit", cache: "no-store",
        redirect: "error", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw new ServiceError(submission ?
        "Connection interrupted. Submission outcome is unknown. Inspect Ace request history before another generation." :
        "Connection interrupted. Query the same task ID again later.", null, submission);
    }
    if (!response.ok) {
      // Do not echo arbitrary upstream text, request objects or tokens into the page.
      throw new ServiceError(`Ace Data Cloud HTTP ${response.status}. Check access, balance and request history. No retry was made.`,
        response.status, submission && response.status >= 500);
    }
    let body;
    try { body = await response.json(); } catch {
      throw new ServiceError("Invalid API response. Inspect request history before resubmitting.", response.status, submission);
    }
    if (body && typeof body === "object" && body.error && !Object.hasOwn(body, "response")) {
      throw new ServiceError("The service reported an error. Inspect Ace request history; do not submit again automatically.",
        response.status, submission);
    }
    return body;
  }
  return {
    async generate(token, input) {
      const body = await request("/suno/audios", token, generationPayload(input), true);
      let result;
      try { result = normalizeResult(body); } catch {
        throw new ServiceError("Unexpected accepted response. Check Ace request history before generating again.", null, true);
      }
      if (!result.taskId) {
        throw new ServiceError("No task ID was returned. Check Ace request history before generating again.", null, true);
      }
      try { validateTaskId(result.taskId); } catch {
        throw new ServiceError("Invalid task ID returned. Check Ace request history before generating again.", null, true);
      }
      if (result.taskId.includes(credentialForRedaction(token))) {
        throw new ServiceError("Unexpected task identity. Check Ace request history before generating again.", null, true);
      }
      result.traceId = result.traceId.replaceAll(credentialForRedaction(token), "[redacted]");
      result.tracks = result.tracks.filter((t) => !t.url.includes(credentialForRedaction(token)))
        .map((t) => ({ ...t, title: t.title.replaceAll(credentialForRedaction(token), "[redacted]") }));
      return result;
    },
    async retrieve(token, taskId) {
      const id = validateTaskId(taskId);
      if (id.includes(credentialForRedaction(token))) throw new ServiceError("Do not use your token as a task ID.");
      const result = normalizeResult(await request("/suno/tasks", token, { action: "retrieve", id }, false), id, true);
      const secret = credentialForRedaction(token);
      result.traceId = result.traceId.replaceAll(secret, "[redacted]");
      result.tracks = result.tracks.filter((t) => !t.url.includes(secret))
        .map((t) => ({ ...t, title: t.title.replaceAll(secret, "[redacted]") }));
      return result;
    },
  };
}

function credentialForRedaction(token) { return validateToken(token); }

export class TaskSession {
  constructor(client, now = () => Date.now()) {
    this.client = client;
    this.now = now;
    this.state = "idle";
    this.taskId = "";
    this.busy = false;
    this.nextQueryAt = 0;
  }
  async generate(token, input, acknowledged) {
    if (this.busy || this.state !== "idle") throw new ServiceError("Keep querying the accepted task; do not regenerate.");
    if (!acknowledged) throw new ServiceError("Review current pricing and acknowledge usage charges first.");
    validateToken(token);
    generationPayload(input);
    this.busy = true;
    try {
      const result = await this.client.generate(token, input);
      this.taskId = result.taskId;
      this.state = result.status;
      this.nextQueryAt = this.now() + 15000;
      return result;
    } catch (error) {
      this.state = error.unknownOutcome ? "unknown" : "idle";
      throw error;
    } finally { this.busy = false; }
  }
  async retrieve(token, taskId) {
    const id = validateTaskId(taskId);
    if (this.busy) throw new ServiceError("A request is already running.");
    if (this.taskId && this.state === "pending" && id !== this.taskId) {
      throw new ServiceError("Continue querying the same accepted task ID.");
    }
    if (this.now() < this.nextQueryAt) throw new ServiceError("Wait at least 15 seconds between task queries.");
    this.busy = true;
    try {
      const result = await this.client.retrieve(token, id);
      this.taskId = id;
      this.state = result.status;
      return result;
    } finally {
      this.nextQueryAt = this.now() + 15000;
      this.busy = false;
    }
  }
  resetAfterHistoryReview(confirmed) {
    if (this.busy || this.state === "pending") throw new ServiceError("Wait for the existing task to finish.");
    if (!confirmed) throw new ServiceError("Review request history before starting another task.");
    this.state = "idle";
    this.taskId = "";
    this.nextQueryAt = 0;
  }
}
