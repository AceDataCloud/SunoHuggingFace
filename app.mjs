import { createClient, TaskSession, safeMediaUrl } from "./client.mjs";

const $ = (id) => document.getElementById(id);
const session = new TaskSession(createClient());
for (const link of document.querySelectorAll("[data-cta]")) {
  const url = new URL(link.href);
  Object.entries({ utm_source: "huggingface", utm_medium: "referral", utm_campaign: "evergreen",
    utm_content: `sunohuggingface_space_${link.dataset.cta.replaceAll("-", "_")}` })
    .forEach(([key, value]) => url.searchParams.set(key, value));
  link.href = url.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function setBusy(busy) {
  $("query").disabled = busy;
  $("generate").disabled = busy || session.state !== "idle";
  $("new-task").disabled = busy || session.state === "pending";
}

function showResult(result) {
  $("tracks").replaceChildren();
  $("status").textContent = result.status === "pending" ?
    "Pending. Preserve this task ID and retrieve it again after 15 seconds. Do not regenerate." :
    result.status === "failed" ? "Task failed. Check Ace request history with this task ID." :
    "Task succeeded. Final audio is shown below when returned by the service.";
  $("identity").textContent = `Task: ${result.taskId || "not provided"}` +
    (result.traceId ? ` · Trace: ${result.traceId}` : "");
  $("task-id").value = result.taskId;
  for (const track of result.tracks) {
    const url = safeMediaUrl(track.url);
    // Defense in depth: never send the API credential to a returned media URL.
    if (!url || url.includes($("token").value.trim())) continue;
    const card = document.createElement("article");
    const title = document.createElement("h3"); title.textContent = track.title;
    const audio = document.createElement("audio"); audio.controls = true; audio.preload = "none"; audio.src = url;
    const link = document.createElement("a"); link.href = url; link.textContent = "Open final audio";
    link.target = "_blank"; link.rel = "noopener noreferrer"; link.referrerPolicy = "no-referrer";
    card.append(title, audio, link); $("tracks").append(card);
  }
}

async function perform(operation) {
  setBusy(true);
  $("status").textContent = "Waiting for the service. Do not submit another generation.";
  $("tracks").replaceChildren();
  try { showResult(await operation()); }
  catch (error) {
    // Only controlled client messages are displayed. No raw server body is echoed.
    $("status").textContent = error.message;
  } finally { $("acknowledge").checked = false; setBusy(false); }
}

$("query-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (session.busy) return;
  perform(() => session.retrieve($("token").value, $("task-id").value));
});
$("generation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (session.busy) return;
  perform(() => session.generate($("token").value, { prompt: $("prompt").value,
    model: $("model").value, instrumental: $("instrumental").checked }, $("acknowledge").checked));
});
$("clear-token").addEventListener("click", () => { $("token").value = ""; });
$("new-task").addEventListener("click", () => {
  try {
    session.resetAfterHistoryReview(window.confirm("Confirm you checked Ace request history and saved any task ID. A new task may incur another charge."));
    $("task-id").value = ""; $("identity").textContent = ""; $("tracks").replaceChildren();
    $("status").textContent = "Ready for an explicitly authorized new generation. No request was sent.";
  } catch (error) { $("status").textContent = error.message; }
  setBusy(false);
});
