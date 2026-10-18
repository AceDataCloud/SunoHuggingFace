---
title: Seedance by Ace Data Cloud
emoji: 🎬
colorFrom: blue
colorTo: purple
sdk: static
app_file: index.html
short_description: Create Seedance video from text, frames or authorized references.
tags:
  - seedance
  - video-generation
  - image-to-video
  - acedatacloud
license: mit
pinned: false
---

# Seedance by Ace Data Cloud — Hugging Face Space candidate

Independent service integration by **Ace Data Cloud**, not an official product or endorsement of Seedance or Hugging Face. **Source is merged and v0.2.0 artifacts are released (2026-10-19); there is still no verified public HF Space URL, listing, installation, real generation or invoice.** This directory is a real service-specific app profile built from one shared canonical source repository, not a tutorial substitute or an empty repository.

[简体中文](README_zh_Hans.md) · [Current pricing](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_pricing) · [Publication gates](../../docs/TOP5_PUBLISHING.md)

## 1. Find the official entry after release

After separately authorized publication, search [HF Spaces for Seedance](https://huggingface.co/spaces?search=seedance), confirm **Seedance by Ace Data Cloud** and the verified Ace publisher, open its app, or use **⋮ → Duplicate this Space**. GitHub release0.2.0 is available; HF install link/version is unknown; do not mistake an unrelated brand demo for this integration. HF Static Spaces have no paid-plan requirement, but API requests are separately billed by Ace. This static app has no MCP badge and does not register Ace as an Inference Provider.

## 2. Register/sign in and get an application API Token

Open [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_api_key); register or sign in. Find **General application** or initialize it if absent. Check Seedance service access, Allowed APIs, expiry, current price and balance. Copy the Token using the copy icon marked1, or **Manage Keys** marked2 for a dedicated credential.

![Actual redacted Ace Console copy/manage API Key](../../assets/get-api-key-en.png)

Create an optional dedicated credential named **Hugging Face Seedance**. The unchanged historical image says Dify tutorial; use your own name. If Allowed APIs is enabled, include `/seedance/videos, /seedance/tasks`. A `platform-...` management token is not an application API token. Paste only the Token, without Bearer, quotes or redaction marks.

![Actual redacted Ace Console create-key dialog; historical name retained](../../assets/create-api-key-en.png)

Real Console screenshots from SunoDify fixed commit8d3d03570e73324220f111f7fe343da0792a8071, fetched2026-10-18. Actual capture date unrecorded. They are not HF installation or successful-run images; credentials/balance are redacted. [Provenance](../../docs/asset-sources.json).

## 3. Paste it in this Space

The app has **1. Connect your Ace account → Ace application API token**, a password input. No API URL is required. Token stays in this tab's memory, goes only to api.acedata.cloud, and is not stored in cookies/local/session storage or logs. Do not configure a shared owner credential in Static Space secrets/variables; these are client-visible. **Clear token** clears the field; close shared-device tabs. [Privacy](../../PRIVACY.md).

HF UI screenshots for this candidate are pending coordinator-only validation; this text describes implemented `studio/index.html` controls, not a fabricated screenshot or live receipt.

## 4. Choose this service's actual parameters

Text, strict first/last-frame image animation, or bounded reference image/audio/video modes. Seedance 2.0 uses 4–15 seconds or -1; 2.5 up to30. Fast/Mini480p/720p, standard up to4k;2.5 up to1080p. Set generate_audio explicitly. No mixing strict frames with multimodal references. Audio-only reference is2.5-only; edit/extend requires2.5+reference video. This UI uses at most9 images/3audio/3video, not the full2.5 maxima.

| Field | Implemented control |
|---|---|
| prompt | Describe the video (1–1000 characters) |
| firstFrame | First frame HTTPS image URL |
| lastFrame | Optional last frame HTTPS image URL |
| imageUrls | Reference image HTTPS URLs (one per line, at most 9) |
| audioUrls | Reference audio HTTPS URLs (at most 3; each/total 2–15s/15s) |
| videoUrls | Reference video HTTPS URLs (at most 3; each/total 2–15s/15s) |
| resolution | Resolution (model-specific) |
| ratio | Aspect ratio |
| duration | Duration seconds (-1 automatic; 4–15, or up to 30 for 2.5) |
| generateAudio | Generate audio with the video |
| referenceType | 2.5 reference operation (edit/extend require reference video) |

The initial example configuration is `doubao-seedance-2-0-fast-260128; mode=text; resolution=480p; ratio=16:9; duration=5; generateAudio=false`. Enter your own prompt; the empty form does not auto-send it. Start with text-only media you have permission to process. All selected model IDs are explicit; no fallback or automatic paid retry. Reference duration/format/file size and current model capability remain server-validated; valid URL syntax is not proof the media meets those limits.

## 5. Submit once, then query the same ID

Existing successful task? Use **2. Retrieve the same existing task**, paste its **Ace task ID** and click **Retrieve same task**. This calls `/seedance/tasks` with `action=retrieve,id=<same id>` only. Do not use an upstream nested data.id instead.

For a new request, expand **Create or edit media — uses your Ace balance**, select mode/exact model and the corresponding fields. Check [current pricing and balance](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_first_run), acknowledge the explicit usage/input-rights checkbox, then **Submit once — uses Ace balance**. One async request is sent; pending/task ID is not completion. Save the ID. Pending or ambiguous accepted responses block another generation; network/5xx/invalid2xx require checking history first. New tabs do not know old submissions.

Manual same-ID queries are15seconds apart. Explicit pending state, missing terminal proof or preview links never become final results. Failed wins over success. Explicit terminal success displays a video player and final links; permitted image Base64 is rendered locally only for image services. Check actual charge in [Ace history](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=seedancehuggingface_readme_history) by task/trace ID. This candidate has no verified live final media, unique invoice or signup/revenue.

## Troubleshooting

| Symptom | Action |
|---|---|
| 400 | Check mode/model compatibility, required references and exact native fields above. |
| 401 / wrong Token | Use the full application Token without Bearer; check expiry. |
| 403 | Check service access, input permissions, moderation, balance and Allowed APIs. |
| Pending / preview | Query the same ID later, never regenerate to poll. |
| 429 | Reduce query frequency/concurrency; no automatic retry was sent. |
| Network/5xx after submit | Outcome may be unknown. Inspect history before any new paid request. |
| Final media inaccessible | Verify terminal state and actual returned HTTPS link; it may expire. |

## Source, offline validation and release

One canonical source: [SunoHuggingFace](https://github.com/AceDataCloud/SunoHuggingFace). `studio/services.mjs` owns this service's native parameters, `studio/runtime.mjs` owns media status, and `client.mjs` shares fixed-origin transport/Token/task session. No copied MCP/SDK service worker. Run npm test/check; `python3 scripts/build_spaces.py` produces an independent seedance-static-space.zip without upload/deployment.

[Publication checklist](../../docs/TOP5_PUBLISHING.md) · [Free UI queue](../../docs/TOP5_VALIDATION.md) · [Issues](https://github.com/AceDataCloud/SunoHuggingFace/issues) · dev@acedata.cloud. No new account, agreement, paid plan, production publication or generation was performed.
