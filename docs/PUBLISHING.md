# HF Static Space publication gate

This repository is canonical. HF is the distribution mirror. No Space was created,
uploaded, deployed, indexed or tested live by this source PR.

Official sources, read 2026-10-18:

- [Static Spaces](https://huggingface.co/docs/hub/spaces-sdks-static): `sdk: static`, index HTML, no paid account plan required.
- [Metadata](https://huggingface.co/docs/hub/spaces-config-reference): title, short_description, tags, emoji, app_file. No keyword field or search ranking guarantee is invented.
- [Creation/visibility/duplication](https://huggingface.co/docs/hub/spaces-overview): use an existing organization with write rights; public Space can be opened and cloned/duplicated. Gradio/Docker creation requires a paid plan under current rules; CPU Basic hourly cost alone does not remove that plan requirement.
- [Official sync](https://huggingface.co/docs/hub/spaces-github-actions): GitHub source can be mirrored to the HF repo. This PR does not enable it or set secrets.
- [MCP Spaces](https://huggingface.co/docs/hub/spaces-mcp-servers): MCP badge is for MCP-enabled Gradio Spaces. This static app is not advertised as an MCP server.

## Prepared artifact

Run `npm test`, `npm run check`, then `python3 scripts/package_space.py`. The
deterministic zip contains the static entry, modules, styles, assets, README and
privacy/license only. No credentials, tests, workflow or local state is uploaded.

## Remaining release steps (not executed)

1. Existing company administrator confirms the exact already-owned HF namespace
   and current write access. Do not guess `AceDataCloud` from a public username.
2. Review the implementation PR and publication/brand/data-processing rules. The
   title is **Suno by Ace Data Cloud**, tags are only the relevant music/Suno task.
   No endorsement, fake users, duplicate variants or unverified Hub `models` link.
3. Verify the existing authorized publishing credential is scoped to the intended
   Space. No new account/permission upgrade/paid plan/agreement is needed for this
   candidate; if the actual account requires a new agreement, stop at that gate.
4. After authorized release, create one **public Static Space** under that verified
   namespace, upload the reviewed archive files, and record the exact HF revision.
   This is deployment and has **not** been performed in this task.
5. Confirm normal-user Spaces search for `suno`/`Suno by Ace Data Cloud`, open the
   real app, duplicate on a free existing account, and test free no-key validation.
   Then update README with the exact verified Space URL; no fake install badge now.
6. Use only an already-completed task ID for a specifically authorized read-only
   check. New paid generation, final audio, unique bill and growth need separate
   evidence/approval; publication cannot substitute for those.

The static app's only user credential is their own Ace application token. Never
add a shared publisher token to HF Static Space secrets (those are client-visible).
Only after scope and account checks may the organization choose to enable its
normal publishing chain; no automatic publish workflow is included here.
