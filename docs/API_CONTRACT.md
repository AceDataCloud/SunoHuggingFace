# Current contract and ownership

Verified 2026-10-18 through Ace's authoritative PlatformBackend OpenAPI sources:

- [`/suno/audios`](https://github.com/AceDataCloud/PlatformBackend/blob/main/openapi/09a26295-5972-4392-9318-dcd9b218f90d.json): POST bearer application token, action=generate, prompt, selected model, custom=false, instrumental, async=true. The simple app deliberately omits unrelated custom lyrics/duration/edit fields.
- [`/suno/tasks`](https://github.com/AceDataCloud/PlatformBackend/blob/main/openapi/f1143f0b-8146-4fc0-b02c-ac8db969392d.json): POST action=retrieve,id=<same ID>. No generation call is used for polling.
- [Existing Suno task guidance](https://github.com/AceDataCloud/SunoMCP/blob/main/tools/task_tools.py): missing terminal success is pending; intermediate URLs are not final output.

No service worker implementation, MCP server or SDK is duplicated. The new code
owns only the HF static app, small browser transport, state gate and render layer.
Runtime errors retain HTTP 429/403/500 and do not switch models or retry creation.

2026-10-18 unauthenticated CORS preflight OPTIONS to both routes returned HTTP 200,
`Access-Control-Allow-Origin: *`, and accepted POST and Authorization headers.
No token, task query or generation was submitted for that check. It proves the
current preflight boundary, not a successful authenticated browser call.

The committed four-label attribution snapshot is read from AuthBackend's current
`contracts/marketing-attribution.json` (producer PlatformBackend). Labels follow
that contract; signup/first-use/revenue results remain unverified. No global
attribution rules were changed.
