---
title: ACE Music by Ace Data Cloud
emoji: 🎵
colorFrom: blue
colorTo: green
sdk: static
app_file: index.html
short_description: Create songs and lyrics, work with reference audio, and recover tasks.
tags:
  - acemusic
  - music-generation
  - audio
  - acedatacloud
license: mit
pinned: false
---

# ACE Music for Hugging Face Spaces

Play and download the two candidates from a completed ACE Music song task, write editable lyrics, or create a cover from a track you own. This ZIP is a standalone Static Space with no runtime dependencies. [简体中文](README_zh_Hans.md)

[Standalone GitHub source](https://github.com/AceDataCloud/ACEMusicHuggingFace) · [Shared source and tests](https://github.com/AceDataCloud/SunoHuggingFace)

## Run the Space

Extract `acemusic-static-space.zip`, run `python3 -m http.server 8000` from the extracted directory, and open `http://localhost:8000`. To use your own Hugging Face Static Space, upload the extracted files, including this README and `index.html`, at its root.

Paste an [Ace application API key](https://platform.acedata.cloud/console/credentials?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=acemusic_space_key) in the password field. The key stays in the tab and is sent directly to the Ace API. Do not put it in the ZIP or HF Space variables. [View ACE Music access and pricing](https://platform.acedata.cloud/services/acemusic?utm_source=huggingface&utm_medium=referral&utm_campaign=evergreen&utm_content=acemusic_space_pricing)

## Retrieve or create

- **Retrieve a task.** Paste its original `task_id` and click **Retrieve same task**. This free read can return two finished audio players, one uploaded reference, or editable lyrics. A partial failure can still return an individual finished track.
- **Create music.** Choose **Generate from an idea** or **Generate from custom lyrics**. Select `acemusic-v1.1` or `acemusic-v1`. Custom songs require a title, lyrics and musical style. You can use **Write lyrics** as a separately charged operation.
- **Use references.** Upload a publicly accessible HTTPS MP3 as a separately charged operation. Retrieve the result and copy the displayed track ID. A cover takes one owned track ID, a mashup takes two different compatible track IDs. Choose `acemusic-v1.1` and supply lyrics and style.
- **Recover results.** Save the task ID immediately and use it for subsequent lookups. After an uncertain submission, check your Ace history before creating another task. No preview audio is presented while the group is processing.

[Song guide](https://docs.acedata.cloud/en/guides/acemusic/acemusic_audios.md) · [Task guide](https://docs.acedata.cloud/en/guides/acemusic/acemusic_tasks.md) · [OpenAPI](https://docs.acedata.cloud/openapi/acemusic.json)
