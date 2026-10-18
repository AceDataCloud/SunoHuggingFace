import { ServiceError, safeMediaUrl } from "../client.mjs";

const choices = (items) => items.map((value) => ({ value, label: value }));
const field = (key, label, type, extra = {}) => ({ key, label, type, ...extra });
const ratios = ["16:9", "9:16", "1:1", "4:3", "3:4"];

export const PROFILES = Object.freeze({
  seedance: {
    name: "Seedance", slug: "seedance", emoji: "🎬", media: "video",
    title: "Seedance by Ace Data Cloud", tags: ["seedance", "video-generation", "image-to-video", "acedatacloud"],
    description: "Create Seedance video from text, frames or authorized references.",
    generationPaths: ["/seedance/videos"], taskPath: "/seedance/tasks",
    modes: choices(["text", "frames", "reference"]),
    models: { all: choices(["doubao-seedance-2-0-fast-260128", "doubao-seedance-2-0-260128",
      "doubao-seedance-2-0-mini-260615", "doubao-seedance-2-5-260628"]) },
    example: "A white ceramic mug on a marble table, steam rising, slow camera orbit in morning light.",
    fields: [field("prompt", "Describe the video (1–1000 characters)", "textarea", { required: true, maxLength: 1000 }),
      field("firstFrame", "First frame HTTPS image URL", "url", { modes: ["frames"] }),
      field("lastFrame", "Optional last frame HTTPS image URL", "url", { modes: ["frames"] }),
      field("imageUrls", "Reference image HTTPS URLs (one per line, at most 9)", "textarea", { modes: ["reference"] }),
      field("audioUrls", "Reference audio HTTPS URLs (at most 3; each/total 2–15s/15s)", "textarea", { modes: ["reference"] }),
      field("videoUrls", "Reference video HTTPS URLs (at most 3; each/total 2–15s/15s)", "textarea", { modes: ["reference"] }),
      field("resolution", "Resolution (model-specific)", "select", { options: choices(["480p", "720p", "1080p", "4k"]), value: "480p" }),
      field("ratio", "Aspect ratio", "select", { options: choices([...ratios, "21:9", "adaptive"]), value: "16:9" }),
      field("duration", "Duration seconds (-1 automatic; 4–15, or up to 30 for 2.5)", "number", { min: -1, max: 30, value: 5 }),
      field("generateAudio", "Generate audio with the video", "checkbox"),
      field("referenceType", "2.5 reference operation (edit/extend require reference video)", "select", { modes: ["reference"], options: choices(["auto", "reference", "edit", "extend"]), value: "auto" })],
    scope: "Text, strict first/last frames, or multimodal reference are distinct modes. This UI supports a bounded subset of 2.0/2.5 references, not every advanced API option.",
  },
  happyhorse: {
    name: "HappyHorse", slug: "happyhorse", emoji: "🐎", media: "video",
    title: "HappyHorse by Ace Data Cloud", tags: ["happyhorse", "video-generation", "video-editing", "acedatacloud"],
    description: "Generate, animate or edit HappyHorse video; follow one task to final output.",
    generationPaths: ["/happyhorse/videos"], taskPath: "/happyhorse/tasks",
    modes: choices(["generate", "image_to_video", "reference_to_video", "video_edit"]),
    models: {
      generate: choices(["happyhorse-1.1-t2v", "happyhorse-1.0-t2v"]),
      image_to_video: choices(["happyhorse-1.1-i2v", "happyhorse-1.0-i2v"]),
      reference_to_video: choices(["happyhorse-1.1-r2v", "happyhorse-1.0-r2v"]),
      video_edit: choices(["happyhorse-1.0-video-edit"]),
    },
    example: "A white horse in a sunrise meadow, mane moving gently, slow camera push-in.",
    fields: [field("prompt", "Video description or edit instruction", "textarea", { required: true }),
      field("imageUrl", "First frame HTTPS image URL", "url", { modes: ["image_to_video"] }),
      field("imageUrls", "Authorized reference images (one HTTPS URL per line; 1–9 for reference, 0–5 for edit)", "textarea", { modes: ["reference_to_video", "video_edit"] }),
      field("videoUrl", "Source video HTTPS URL", "url", { modes: ["video_edit"] }),
      field("resolution", "Resolution", "select", { options: choices(["720P", "1080P"]), value: "720P" }),
      field("ratio", "Aspect ratio", "select", { modes: ["generate", "reference_to_video"], options: choices(ratios), value: "16:9" }),
      field("duration", "Output duration seconds (3–15)", "number", { modes: ["generate", "image_to_video", "reference_to_video"], min: 3, max: 15, value: 5 }),
      field("audioSetting", "Video edit audio", "select", { modes: ["video_edit"], options: choices(["auto", "origin"]), value: "auto" })],
    scope: "Each action uses a matching exact model. First-frame mode follows its input image ratio. Video edit billing can include source and output duration; review current prices.",
  },
  "gpt-image": {
    name: "GPT Image", slug: "gpt-image", emoji: "🖼️", media: "image",
    title: "GPT Image by Ace Data Cloud", tags: ["gpt-image", "image-generation", "image-editing", "acedatacloud"],
    description: "Generate GPT Image pictures or edit authorized reference images.",
    generationPaths: ["/openai/images/generations", "/openai/images/edits"], taskPath: "/openai/tasks",
    modes: choices(["generate", "edit"]),
    models: { all: choices(["gpt-image-2", "gpt-image-1.5", "gpt-image-1"]) },
    example: "A clean studio photograph of a blue ceramic teapot on a neutral background.",
    fields: [field("prompt", "Image description or edit instruction", "textarea", { required: true }),
      field("imageUrls", "Authorized source images (1–16 HTTPS URLs, one per line)", "textarea", { modes: ["edit"] }),
      field("size", "Output size", "select", { options: choices(["1024x1024", "1536x1024", "1024x1536", "auto"]), value: "1024x1024" }),
      field("quality", "Quality", "select", { options: choices(["auto", "low", "medium", "high"]), value: "auto" }),
      field("count", "Image count (1–4 in this app)", "number", { min: 1, max: 4, value: 1 }),
      field("background", "Background", "select", { options: choices(["auto", "opaque", "transparent"]), value: "auto" }),
      field("outputFormat", "Output format", "select", { options: choices(["png", "jpeg", "webp"]), value: "png" }),
      field("inputFidelity", "Reference input fidelity", "select", { modes: ["edit"], options: choices(["low", "high"]), value: "low" })],
    scope: "Generate and JSON-URL edit use separate native routes. References must already be accessible HTTPS images; this app does not upload local files or masks. URL output is requested; valid returned PNG/JPEG/WebP Base64 can be displayed locally.",
  },
  "nano-banana": {
    name: "Nano Banana", slug: "nano-banana", emoji: "🍌", media: "image",
    title: "Nano Banana by Ace Data Cloud", tags: ["nano-banana", "image-generation", "image-editing", "acedatacloud"],
    description: "Create or edit Nano Banana images with explicit count, ratio and resolution.",
    generationPaths: ["/nano-banana/images"], taskPath: "/nano-banana/tasks",
    modes: choices(["generate", "edit"]),
    models: { all: choices(["nano-banana-2-lite", "nano-banana-2", "nano-banana-2.1", "nano-banana-pro"]) },
    example: "A playful yellow ceramic banana sculpture on a clean white shelf.",
    fields: [field("prompt", "Image description or edit instruction", "textarea", { required: true }),
      field("imageUrls", "Authorized reference images (1–4 HTTPS URLs, one per line)", "textarea", { modes: ["edit"] }),
      field("count", "Image count (1–4)", "number", { min: 1, max: 4, value: 1 }),
      field("aspectRatio", "Aspect ratio", "select", { options: choices(["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"]), value: "1:1" }),
      field("resolution", "Resolution", "select", { options: choices(["1K", "2K", "4K"]), value: "1K" })],
    scope: "Generate and edit retain separate actions. Editing requires your own authorized reference URLs. This app bounds references to four; no local upload or unrequested alternate model.",
  },
});

function need(condition, message) { if (!condition) throw new ServiceError(message); }
function pick(value, values, label) { need(values.includes(value), `Select a valid ${label}; no replacement is used.`); return value; }
function text(value, max = 10000) {
  const s = typeof value === "string" ? value.trim() : "";
  need(s && Array.from(s).length <= max, `Enter a prompt of 1–${max} characters.`); return s;
}
function integer(value, min, max, label) {
  need(value !== "" && value !== undefined && value !== null && typeof value !== "boolean", `Enter ${label}.`);
  const n = Number(value); need(Number.isInteger(n) && n >= min && n <= max, `Invalid ${label}.`); return n;
}
export function referenceUrls(value, min, max) {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
  need(list.length >= min && list.length <= max, `Provide ${min}–${max} authorized HTTPS reference URLs.`);
  return list.map((s) => { const url = safeMediaUrl(s); need(url, "Reference must be an HTTPS URL without credentials or token query fields."); return url; });
}
export function prepareRequest(slug, input) {
  const profile = PROFILES[slug]; need(profile, "Unknown media service.");
  const mode = pick(input.mode, profile.modes.map((x) => x.value), "operation");
  const model = pick(input.model, (profile.models[mode] || profile.models.all).map((x) => x.value), "model");
  const prompt = text(input.prompt, slug === "seedance" ? 1000 : 10000);
  let body, path = profile.generationPaths[0];
  if (slug === "seedance") {
    const resolution = pick(input.resolution, ["480p", "720p", "1080p", "4k"], "resolution");
    const standard = model === "doubao-seedance-2-0-260128", v25 = model === "doubao-seedance-2-5-260628";
    need(standard || (v25 ? resolution !== "4k" : ["480p", "720p"].includes(resolution)), "Resolution is not supported by the selected Seedance model.");
    const duration = integer(input.duration, -1, v25 ? 30 : 15, "duration");
    need(duration === -1 || duration >= 4, "Seedance duration must be -1 or at least 4 seconds.");
    need(input.generateAudio === undefined || typeof input.generateAudio === "boolean", "Generate audio must be a boolean.");
    const content = [{ type: "text", text: prompt }];
    if (mode === "frames") {
      content.push({ type: "image_url", role: "first_frame", image_url: { url: referenceUrls([input.firstFrame], 1, 1)[0] } });
      if (input.lastFrame) content.push({ type: "image_url", role: "last_frame", image_url: { url: referenceUrls([input.lastFrame], 1, 1)[0] } });
    }
    if (mode === "reference") {
      const images = referenceUrls(input.imageUrls, 0, 9), audio = referenceUrls(input.audioUrls, 0, 3), videos = referenceUrls(input.videoUrls, 0, 3);
      need(images.length + audio.length + videos.length > 0, "Reference mode needs authorized reference media.");
      need(v25 || images.length + videos.length > 0, "Seedance 2.0 audio reference also requires an image or video.");
      for (const [urls, type, role] of [[images, "image_url", "reference_image"], [audio, "audio_url", "reference_audio"], [videos, "video_url", "reference_video"]]) {
        for (const url of urls) content.push({ type, role, [type]: { url } });
      }
      const operation = input.referenceType || "auto";
      pick(operation, ["auto", "reference", "edit", "extend"], "reference operation");
      need(v25 || operation === "auto", "Reference edit/extend controls apply to Seedance 2.5 only.");
      need(!["edit", "extend"].includes(operation) || videos.length > 0, "Edit/extend requires a reference video.");
      if (v25) body = { omni_reference_task_type: operation };
    }
    body = { ...body, model, content, resolution, ratio: pick(input.ratio, [...ratios, "21:9", "adaptive"], "ratio"),
      duration, generate_audio: Boolean(input.generateAudio), async: true };
  } else if (slug === "happyhorse") {
    body = { action: mode, model, prompt, resolution: pick(input.resolution, ["720P", "1080P"], "resolution"), async: true };
    if (mode === "image_to_video") body.image_url = referenceUrls([input.imageUrl], 1, 1)[0];
    if (mode === "reference_to_video") body.image_urls = referenceUrls(input.imageUrls, 1, 9);
    if (mode === "video_edit") {
      body.video_url = referenceUrls([input.videoUrl], 1, 1)[0];
      const images = referenceUrls(input.imageUrls, 0, 5); if (images.length) body.image_urls = images;
      body.audio_setting = pick(input.audioSetting, ["auto", "origin"], "audio setting");
    } else {
      body.duration = integer(input.duration, 3, 15, "duration");
      if (mode !== "image_to_video") body.ratio = pick(input.ratio, ratios, "ratio");
    }
  } else if (slug === "gpt-image") {
    body = { model, prompt, n: integer(input.count, 1, 4, "image count"),
      size: pick(input.size, ["auto", "1024x1024", "1536x1024", "1024x1536"], "size"),
      quality: pick(input.quality, ["auto", "low", "medium", "high"], "quality"),
      background: pick(input.background, ["auto", "opaque", "transparent"], "background"),
      output_format: pick(input.outputFormat, ["png", "jpeg", "webp"], "format"), response_format: "url", async: true };
    need(body.background !== "transparent" || body.output_format !== "jpeg", "Transparent output needs PNG or WebP.");
    if (mode === "edit") {
      path = profile.generationPaths[1]; body.image = referenceUrls(input.imageUrls, 1, 16);
      body.input_fidelity = pick(input.inputFidelity, ["low", "high"], "input fidelity");
    }
  } else {
    body = { action: mode, model, prompt, count: integer(input.count, 1, 4, "image count"),
      aspect_ratio: pick(input.aspectRatio, ["1:1", "3:2", "2:3", "16:9", "9:16", "4:3", "3:4"], "ratio"),
      resolution: pick(input.resolution, ["1K", "2K", "4K"], "resolution"), async: true };
    if (mode === "edit") body.image_urls = referenceUrls(input.imageUrls, 1, 4);
  }
  return { path, body };
}
