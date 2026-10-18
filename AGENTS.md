# SunoHuggingFace

Canonical source for Suno plus four independent HF Static Space builds. The
`studio/` profiles own Seedance/HappyHorse/GPT Image/Nano Banana parameters while
sharing `client.mjs` transport/state. Do not copy or modify shared MCP/SDK sources.

- Run `npm test` (Node built-in test discovery) and `npm run check` before a PR.
- No runtime dependencies, server, analytics, or build step. HF entry is `index.html`.
- Keep API origin fixed to `https://api.acedata.cloud` and the reviewed path allowlist.
  Each profile's generation/edit path is separate from same-ID retrieval. Never
  retry generation or replace models. Test each service's native contract.
- Default UI is task lookup. Generation requires explicit cost acknowledgment.
- Tokens stay in the password input/browser memory. Never persist, log, include
  them in a URL, export, or echo them in result/error text. No shared owner token.
- No network generation in tests. Fixtures are synthetic, and do not prove live use.
- Do not enable automatic HF publishing, accept terms, or upgrade any account.
  Publication requires a verified existing organization and user-authorized release.
- Use Ace Data Cloud Dev for commits/PRs. Before follow-up pushes verify PR OPEN.
