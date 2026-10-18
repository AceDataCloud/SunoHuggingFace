---
title: HappyHorse by Ace Data Cloud
emoji: 🐎
colorFrom: blue
colorTo: purple
sdk: static
app_file: index.html
short_description: Generate, animate or edit HappyHorse video; follow one task to final output.
tags:
  - happyhorse
  - video-generation
  - video-editing
  - acedatacloud
license: mit
pinned: false
---

# HappyHorse by Ace Data Cloud — Hugging Face Space candidate

Independent service integration by **Ace Data Cloud**, not an official product or endorsement of HappyHorse or Hugging Face. **Source is merged and v0.2.0 artifacts are released (2026-10-19); there is still no verified public HF Space URL, listing, installation, real generation or invoice.** This directory is a real service-specific app profile built from one shared canonical source repository, not a tutorial substitute or an empty repository.

[简体中文](README_zh_Hans.md) · [Current pricing](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsehuggingface_readme_pricing) · [Publication gates](../../docs/TOP5_PUBLISHING.md)

## 1. Find the official entry after release

After separately authorized publication, search [HF Spaces for HappyHorse](https://huggingface.co/spaces?search=happyhorse), confirm **HappyHorse by Ace Data Cloud** and the verified Ace publisher, open its app, or use **⋮ → Duplicate this Space**. GitHub release0.2.0 is available; HF install link/version is unknown; do not mistake an unrelated brand demo for this integration. HF Static Spaces have no paid-plan requirement, but API requests are separately billed by Ace. This static app has no MCP badge and does not register Ace as an Inference Provider.

## 2. Register/sign in and get an application API Token

Open [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsehuggingface_readme_api_key); register or sign in. Find **General application** or initialize it if absent. Check HappyHorse service access, Allowed APIs, expiry, current price and balance. Copy the Token using the copy icon marked1, or **Manage Keys** marked2 for a dedicated credential.

![Actual redacted Ace Console copy/manage API Key](../../assets/get-api-key-en.png)

Create an optional dedicated credential named **Hugging Face HappyHorse**. The unchanged historical image says Dify tutorial; use your own name. If Allowed APIs is enabled, include `/happyhorse/videos, /happyhorse/tasks`. A `platform-...` management token is not an application API token. Paste only the Token, without Bearer, quotes or redaction marks.

![Actual redacted Ace Console create-key dialog; historical name retained](../../assets/create-api-key-en.png)

Real Console screenshots from SunoDify fixed commit8d3d03570e73324220f111f7fe343da0792a8071, fetched2026-10-18. Actual capture date unrecorded. They are not HF installation or successful-run images; credentials/balance are redacted. [Provenance](../../docs/asset-sources.json).

## 3. Paste it in this Space

The app has **1. Connect your Ace account → Ace application API token**, a password input. No API URL is required. Token stays in this tab's memory, goes only to api.acedata.cloud, and is not stored in cookies/local/session storage or logs. Do not configure a shared owner credential in Static Space secrets/variables; these are client-visible. **Clear token** clears the field; close shared-device tabs. [Privacy](../../PRIVACY.md).

HF UI screenshots for this candidate are pending coordinator-only validation; this text describes implemented `studio/index.html` controls, not a fabricated screenshot or live receipt.

## 4. Choose this service's actual parameters

Four native actions, each with its own exact model: generate(t2v), image_to_video(i2v), reference_to_video(r2v), video_edit. First-frame input follows its image ratio, so ratio is omitted. Reference uses1–9 images, video edit uses source video and0–5 references plus auto/origin audio. Output duration3–15 applies to creation, not video-edit billing.

| Field | Implemented control |
|---|---|
| prompt | Video description or edit instruction |
| imageUrl | First frame HTTPS image URL |
| imageUrls | Authorized reference images (one HTTPS URL per line; 1–9 for reference, 0–5 for edit) |
| videoUrl | Source video HTTPS URL |
| resolution | Resolution |
| ratio | Aspect ratio |
| duration | Output duration seconds (3–15) |
| audioSetting | Video edit audio |

The initial example configuration is `happyhorse-1.1-t2v; mode=generate; resolution=720P; ratio=16:9; duration=5`. Enter your own prompt; the empty form does not auto-send it. Start with text-only media you have permission to process. All selected model IDs are explicit; no fallback or automatic paid retry. Reference duration/format/file size and current model capability remain server-validated; valid URL syntax is not proof the media meets those limits.

## 5. Submit once, then query the same ID

Existing successful task? Use **2. Retrieve the same existing task**, paste its **Ace task ID** and click **Retrieve same task**. This calls `/happyhorse/tasks` with `action=retrieve,id=<same id>` only. Do not use an upstream nested data.id instead.

For a new request, expand **Create or edit media — uses your Ace balance**, select mode/exact model and the corresponding fields. Check [current pricing and balance](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsehuggingface_readme_first_run), acknowledge the explicit usage/input-rights checkbox, then **Submit once — uses Ace balance**. One async request is sent; pending/task ID is not completion. Save the ID. Pending or ambiguous accepted responses block another generation; network/5xx/invalid2xx require checking history first. New tabs do not know old submissions.

Manual same-ID queries are15seconds apart. Explicit pending state, missing terminal proof or preview links never become final results. Failed wins over success. Explicit terminal success displays a video player and final links; permitted image Base64 is rendered locally only for image services. Check actual charge in [Ace history](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsehuggingface_readme_history) by task/trace ID. This candidate has no verified live final media, unique invoice or signup/revenue.

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

One canonical source: [SunoHuggingFace](https://github.com/AceDataCloud/SunoHuggingFace). `studio/services.mjs` owns this service's native parameters, `studio/runtime.mjs` owns media status, and `client.mjs` shares fixed-origin transport/Token/task session. No copied MCP/SDK service worker. Run npm test/check; `python3 scripts/build_spaces.py` produces an independent happyhorse-static-space.zip without upload/deployment.

[Publication checklist](../../docs/TOP5_PUBLISHING.md) · [Free UI queue](../../docs/TOP5_VALIDATION.md) · [Issues](https://github.com/AceDataCloud/SunoHuggingFace/issues) · dev@acedata.cloud. No new account, agreement, paid plan, production publication or generation was performed.
