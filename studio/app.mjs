import { TaskSession } from "../client.mjs";
import { PROFILES } from "./services.mjs";
import { createMediaClient } from "./runtime.mjs";

const $ = (id) => document.getElementById(id), slug = document.documentElement.dataset.service;
const profile = PROFILES[slug];
if (!profile) throw new Error("Invalid packaged service profile.");
const session = new TaskSession(createMediaClient(slug));
$("title").textContent = profile.title; $("description").textContent = profile.description;
$("scope").textContent = profile.scope;
$("allowed-apis").textContent = "Allowed APIs: " + [...profile.generationPaths, profile.taskPath].join(", ");
for (const [id, route, part] of [["token-link", "console/applications", "api_key"], ["price-link", "models", "pricing"]]) {
  const url = new URL("https://platform.acedata.cloud/" + route);
  Object.entries({ utm_source: "huggingface", utm_medium: "referral", utm_campaign: "evergreen",
    utm_content: `${slug.replaceAll("-", "")}huggingface_space_${part}` }).forEach(([k, v]) => url.searchParams.set(k, v));
  $(id).href = url.href; $(id).target = "_blank"; $(id).rel = "noopener noreferrer";
}
function options(element, values) {
  element.replaceChildren();
  for (const value of values) { const o = document.createElement("option"); o.value = value.value; o.textContent = value.label; element.append(o); }
}
options($("mode"), profile.modes);
const controls = new Map();
for (const spec of profile.fields) {
  const block = document.createElement("div"), label = document.createElement("label");
  const input = document.createElement(spec.type === "textarea" ? "textarea" : spec.type === "select" ? "select" : "input");
  input.id = `field-${spec.key}`; label.htmlFor = input.id; label.textContent = spec.label;
  if (spec.type === "select") options(input, spec.options);
  else if (spec.type === "textarea") input.rows = 3;
  else input.type = spec.type;
  if (spec.value !== undefined) input.value = spec.value;
  if (spec.min !== undefined) input.min = spec.min;
  if (spec.max !== undefined) input.max = spec.max;
  if (spec.maxLength) input.maxLength = spec.maxLength;
  if (spec.key === "prompt") input.placeholder = profile.example;
  input.autocomplete = "off";
  block.append(label, input); $("fields").append(block); controls.set(spec.key, { spec, block, input });
}
function modeChanged() {
  options($("model"), profile.models[$("mode").value] || profile.models.all);
  for (const { spec, block, input } of controls.values()) {
    const visible = !spec.modes || spec.modes.includes($("mode").value);
    block.hidden = !visible; input.disabled = !visible; input.required = visible && Boolean(spec.required);
  }
}
$("mode").addEventListener("change", modeChanged); modeChanged();
function inputs() {
  const result = { mode: $("mode").value, model: $("model").value };
  for (const [key, { input }] of controls) if (!input.disabled) result[key] = input.type === "checkbox" ? input.checked : input.value;
  return result;
}
function buttons() {
  $("query").disabled = session.busy;
  $("generate").disabled = session.busy || session.state !== "idle";
  $("new-task").disabled = session.busy || session.state === "pending";
}
function render(result) {
  $("media").replaceChildren();
  $("status").textContent = result.status === "pending" ? "Pending. Keep this ID and query again after 15 seconds. Do not regenerate." :
    result.status === "failed" ? "Task failed. Inspect the original task/trace in Ace history." : "Task succeeded. Final media returned by the service is below.";
  $("task-id").value = result.taskId;
  $("identity").textContent = `Task: ${result.taskId || "synchronous result; inspect request history"}` + (result.traceId ? ` · Trace: ${result.traceId}` : "");
  for (const item of result.media) {
    const card = document.createElement("article"), heading = document.createElement("h3"); heading.textContent = item.title;
    const element = document.createElement(item.kind === "video" ? "video" : "img");
    element.src = item.url;
    if (item.kind === "video") { element.controls = true; element.preload = "none"; }
    else { element.alt = profile.name + " final output"; element.loading = "lazy"; element.referrerPolicy = "no-referrer"; }
    card.append(heading, element);
    const link = document.createElement("a"); link.href = item.url; link.textContent = "Open/download final result";
    if (item.url.startsWith("data:image/")) link.download = profile.slug + "-result";
    else { link.target = "_blank"; link.rel = "noopener noreferrer"; link.referrerPolicy = "no-referrer"; }
    card.append(link); $("media").append(card);
  }
}
async function perform(operation) {
  $("media").replaceChildren(); $("status").textContent = "Waiting for the service. Do not resubmit generation.";
  // Session marks busy synchronously before its first await.
  try { const pending = operation(); buttons(); render(await pending); }
  catch (error) { $("status").textContent = error.message; }
  finally { $("acknowledge").checked = false; buttons(); }
}
$("query-form").addEventListener("submit", (event) => {
  event.preventDefault(); if (!session.busy) perform(() => session.retrieve($("token").value, $("task-id").value));
});
$("generation-form").addEventListener("submit", (event) => {
  event.preventDefault(); if (!session.busy) perform(() => session.generate($("token").value, inputs(), $("acknowledge").checked));
});
$("clear-token").addEventListener("click", () => { $("token").value = ""; });
$("new-task").addEventListener("click", () => {
  try {
    session.resetAfterHistoryReview(window.confirm("Confirm you checked Ace history and saved the old task ID. A new request can incur another charge."));
    $("task-id").value = ""; $("identity").textContent = ""; $("media").replaceChildren(); $("status").textContent = "Ready for one explicitly authorized request. No request sent.";
  } catch (error) { $("status").textContent = error.message; }
  buttons();
});
