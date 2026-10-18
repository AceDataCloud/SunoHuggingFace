---
title: Suno by Ace Data Cloud
emoji: 🎵
colorFrom: blue
colorTo: green
sdk: static
app_file: index.html
short_description: Create Suno music with your Ace token and retrieve the same task.
tags:
  - suno
  - music-generation
  - text-to-audio
  - audio
  - acedatacloud
license: mit
pinned: false
---

# Suno by Ace Data Cloud for Hugging Face Spaces

Create music from a prompt, preserve the generation task ID, and play only the completed audio. This is an **independent integration provided by Ace Data Cloud**, not an official Suno product or endorsement by Suno or Hugging Face.

**Publication status:** source candidate under review. A public Hugging Face Space has **not** been published or verified. There is no working official-install link yet, no paid live acceptance run, and no claim that Ace is in Hugging Face Inference Providers. The actual Space uses native Hugging Face Static Spaces hosting; no custom API base URL is required from users.

[简体中文](readme/README_zh_Hans.md) · [Current API pricing](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_readme_pricing) · [Publication checklist](docs/PUBLISHING.md)

## 1. Open the correct Space

After publication, search [Hugging Face Spaces for Suno](https://huggingface.co/spaces?search=suno) and confirm the title **Suno by Ace Data Cloud** and the verified Ace publisher. Until that listing is verified, use this repository for source review; do not mistake another Suno demo for this integration.

A public Static Space can be opened directly and duplicated with **⋮ → Duplicate this Space** into your own existing account. Static hosting does not require a paid HF plan under the [current official rules](https://huggingface.co/docs/hub/spaces-sdks-static). API generation is a separate Ace charge. This static app does not receive an MCP badge; that requires a separate Gradio MCP app and its applicable account plan. No unverified model ID is added to the HF `models` metadata.

## 2. Get an Ace application API token

1. Register or sign in at [Ace Data Cloud → Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_readme_api_key).
2. Open **General application**. If absent, choose **Initialize General Application**. A general key can use the services your account is entitled to; a dedicated application's key is limited to its service. Check **Suno** access, current pricing and balance.
3. Copy the API Key using the icon marked **1**, or open **Manage Keys** marked **2** to create a separate key.

![Actual Ace Console: copy a redacted API key or open Manage Keys](assets/get-api-key-en.png)

4. In **Manage Keys → Create**, name the key `Hugging Face Suno`. The historical screenshot below uses `Dify tutorial`; enter your own name. Set expiry and usage/API restrictions as appropriate. If **Allowed APIs** is enabled, include both `/suno/audios` and `/suno/tasks`.

![Actual Ace Console: create an optional dedicated credential; historical name is Dify tutorial](assets/create-api-key-en.png)

Screenshots are reused unchanged from the existing [SunoDify onboarding](https://github.com/AceDataCloud/SunoDify/tree/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial), fetched 2026-10-18. Original capture date was not separately recorded; they are Ace Console screenshots, **not HF installation or successful-use evidence**. Credentials and balances are redacted. [Asset provenance](docs/asset-sources.json).

Copy only the token string. Do not add `Bearer `, quotes, or redaction characters. A `platform-...` management token is not an application generation key. Never paste a key into a prompt, URL, public Space secret, issue, or shared screenshot.

## 3. Connect in the Space

In the app, find **1. Connect your Ace account → Ace application API token** and paste the token into that password field. You do not fill an API address. **Clear token** removes the field value. The app does not store the token in cookies, local/session storage, an owner secret, analytics or logs.

The key is sent directly from your tab to `https://api.acedata.cloud` over HTTPS. HF hosts the app's public code; the Space owner must not add a shared key as a Static Space secret because static variables/secrets are client-visible. On shared computers, clear the field and close the tab. Browser extensions and password managers are outside the app's control. See [Privacy](PRIVACY.md).

HF UI screenshot status: this version has not been opened in the coordinator-controlled browser, so no HF screenshot is presented as proof. The exact free browser checks are in [VALIDATION.md](docs/VALIDATION.md). All visible controls exist in `index.html`; the README does not invent a provider setting.

## 4. First use: retrieve or create one task

**Free of new generation:** if you already have a task ID, paste it under **2. Retrieve an existing task** and click **Retrieve same task**. A lookup uses `/suno/tasks` and never generates music. Check current API rules for your account; the app does not claim an invoice solely from a successful query.

To create music when you authorize the API charge:

1. Open **Create new music — uses your Ace balance**.
2. Choose the exact model (`chirp-v6`, `chirp-v6-wild`, or `chirp-v6-mini`), keep **Instrumental** selected for a first example, and enter: `A gentle instrumental piano melody for a sunrise, no vocals.` The simple prompt mode accepts up to 500 characters. Model availability and price remain subject to Ace's current service.
3. Review [current pricing, permissions and balance](https://platform.acedata.cloud/models?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_readme_first_run), check the consent box, then click **Generate once — uses Ace balance**. This sends one `action=generate`, `custom=false`, `async=true` request. It does not retry or replace the model.

The initial accepted response is normally **pending**, not success. Its task ID fills the lookup field; save it before closing the tab. Pending tasks and uncertain connection outcomes block another generation in the tab.

## 5. Follow the same ID and play final audio

Click **Retrieve same task** no more than once every 15 seconds. There is no automatic background polling and no call to the generation endpoint from this control. A playable URL in an unfinished result is only a preview and is hidden. **Succeeded** is shown only with explicit terminal success and no pending/failed state. Final HTTPS audio links then appear with audio controls; **failed** directs you to history.

If a connection fails after submission, inspect the task/request history in [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=sunohuggingface_readme_history). Do not regenerate merely to poll. A new tab cannot know earlier submissions; check history before starting over. After a terminal or reviewed uncertain request, **I reviewed history — prepare another task** resets this tab for a new explicitly authorized generation.

Use the task/trace ID to reconcile the actual charge in Ace history. No paid-generation, media reachability, unique final invoice or customer acquisition has been verified for this Space yet.

## Troubleshooting

| Symptom | Action |
|---|---|
| Invalid token / 401 | Copy the full application API token without `Bearer`; check expiry and restrictions. |
| Access/balance / 403 | Check Suno access, Allowed APIs and current balance; the app does not silently switch models. |
| Pending / no audio | Keep the same ID and query later. HTTP 200 or a preview URL does not prove completion. |
| 429 | Reduce query frequency/concurrency. No automatic retry was sent. |
| Network / 5xx after generation | Outcome may be unknown. Inspect history before another submission. |
| Audio cannot play | Verify terminal status and returned HTTPS URL; link validity may expire. |
| Space is missing from search | Publication and indexing have not been verified; source tests are not a public listing. |

## Development and release

No runtime dependencies or server. Run `npm test` and `npm run check`. Build a release archive with `python3 scripts/package_space.py`; this packages a Static Space and **does not upload or deploy** it. [Contribution rules](AGENTS.md), [API/source contract](docs/API_CONTRACT.md), [release checklist](docs/PUBLISHING.md).

## Additional independent service Space candidates

The same canonical source now builds four **separate service apps**, each with its own
HF metadata, native parameters, bilingual onboarding and terminal video/image UI.
This root entry remains the focused Suno app, not an all-services selector.

| Independent entry | Native workflow | Source metadata/guide |
|---|---|---|
| Seedance by Ace Data Cloud | text, strict frames or multimodal references → final video | [Seedance](spaces/seedance/README.md) |
| HappyHorse by Ace Data Cloud | text/image/reference/video-edit actions with matched models → video | [HappyHorse](spaces/happyhorse/README.md) |
| GPT Image by Ace Data Cloud | separate generation/JSON-URL edit → image gallery | [GPT Image](spaces/gpt-image/README.md) |
| Nano Banana by Ace Data Cloud | generate/edit, own references/count/ratio/resolution → gallery | [Nano Banana](spaces/nano-banana/README.md) |

Run `python3 scripts/build_spaces.py` to build all four independent directories/zips;
`python3 scripts/check_space_packages.py` verifies imports, documentation and exact
shared runtime. No upload, account creation, local browser service or paid request.
All five candidates share a single fixed-origin transport/task-session source.
No MCP/SDK implementation is copied. [Policy/publication boundary](docs/TOP5_PUBLISHING.md).
HF listings, normal installation, live media and billing remain unverified for all five.

[Source](https://github.com/AceDataCloud/SunoHuggingFace) · [Issues](https://github.com/AceDataCloud/SunoHuggingFace/issues) · dev@acedata.cloud
