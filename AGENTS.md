# SunoHuggingFace

Independent Suno integration for Hugging Face Static Spaces. Canonical source is
this repository; do not copy or modify the shared MCP/SDK implementations.

- Run `npm test` (Node built-in test discovery) and `npm run check` before a PR.
- No runtime dependencies, server, analytics, or build step. HF entry is `index.html`.
- Keep API origin fixed to `https://api.acedata.cloud`. Only `/suno/audios` submits
  generation; `/suno/tasks` queries the same ID. Never retry generation or replace models.
- Default UI is task lookup. Generation requires explicit cost acknowledgment.
- Tokens stay in the password input/browser memory. Never persist, log, include
  them in a URL, export, or echo them in result/error text. No shared owner token.
- No network generation in tests. Fixtures are synthetic, and do not prove live use.
- Do not enable automatic HF publishing, accept terms, or upgrade any account.
  Publication requires a verified existing organization and user-authorized release.
- Use Ace Data Cloud Dev for commits/PRs. Before follow-up pushes verify PR OPEN.
