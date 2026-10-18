# Four-service validation and free UI queue

2026-10-18. `npm test` uses synthetic fixtures only. `npm run check` validates
modules, contracts, metadata and four-label CTA links. `python3 scripts/build_spaces.py`
builds offline artifacts; it never uploads or starts a server.

## Coordinator-only browser queue

Before authorized publication, the coordinator may serve the **actual generated
artifact** locally and inspect it with no key and no API request. The generated
app is real implementation, not a drawn/reference success screenshot. No browser
or GUI service is started by this task.

For each service:

1. Open its generated static entry. Verify the service title, independent-by-Ace
   disclaimer, password input, permitted APIs, same-ID query and collapsed cost
   consent. Blank token must fail locally without network requests.
2. Seedance: switch text/frames/reference; see different content inputs. Reject
   last-frame without first-frame, 2.0 audio-only reference and incompatible
   resolution; 2.5 edit/extend requires a reference video.
3. HappyHorse: switch each action; exact matching models change. First-frame mode
   has no ratio, video edit uses video URL/audio retention and not generation
   duration. References limited to 1–9, or 0–5 for edit.
4. GPT Image: generate/edit switches native path and reference fields; size,
   quality, count, format/background and edit fidelity controls remain explicit.
   URL-only source images in this UI; no local upload/mask support claimed.
5. Nano Banana: edit requires authorized reference images; generation does not
   send stale reference values; count, ratio and resolution map correctly.
6. Offline test harness only: pending previews hidden; failed never shown as
   successful; explicit completed video gets a player, completed image gets a
   gallery. Valid PNG/JPEG/WebP base64 allowed only as image media, not scripts/SVG.
7. Verify no cookies, storage, third-party scripts or owner token; record dated
   redacted screenshots and exact source revision. Do not claim fixtures prove
   service generation or billing.

After authorized release, inspect service-term search, public app and duplicate
on the real HF URLs. Current Source PR/zip is not official listing/install proof.
