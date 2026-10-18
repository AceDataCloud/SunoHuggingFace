# v0.2.0 released; existing HF account handoff

2026-10-19. Product PR #1 merged at `621bfa7827d2e1f64c4aad335c2701d18627b1ab`.
The cancellation/failure precedence fix passes 28 tests. Official GitHub release:
<https://github.com/AceDataCloud/SunoHuggingFace/releases/tag/v0.2.0>.
All five independent Static Space zip files, release-manifest.json and SHA256SUMS
were uploaded and downloaded again; each hash matches the exact merged source.
This is a **GitHub artifact release**, not a HF deployment/listing/install receipt.

## What was actually checked

The executing environment has no HF token in environment variables, the two
standard HF token caches or the project's .claude/.env. Git credential helpers
for huggingface.co/hf.co returned no existing credential without a login prompt.
The source repo has no Actions secrets, variables, environments, or HF deployment
workflow. Only its validation workflow runs on pushes. Direct HF identity/search/
policy requests time out from this host. None of this proves the company has no
HF account. No private browser cookie or unrelated credential store was read.

## One existing-account action, no new registration

1. The existing company account holder opens <https://huggingface.co/login>, signs
   in to their **existing** authorized account, then reads
   <https://huggingface.co/settings/organizations>. Confirm the exact already-owned
   namespace and current Write/admin role. Do not create a new account/organization
   or change member permissions.
2. Open <https://huggingface.co/settings/tokens> to select an **existing approved**
   credential with write access to the five intended Static Space repos. Use the
   company's approved secret handoff/environment (HF_TOKEN); never paste it into
   a chat, static app, artifact, public repository or HF Static Space variable.
   Token scopes do not grant organization rights the account does not already have.
   If no approved token/session exists, the account holder must decide/configure
   one under the existing role; this task does not create tokens or expand rights.
3. Confirm full current <https://huggingface.co/content-guidelines> and applicable
   service/brand rights. No one should accept a new agreement/CLA or make rights
   claims on the holder's behalf. Missing legal permission remains a real gate.

Why human: company identity, existing member role and publishing-secret possession
cannot be established from a guessed public username. The browser is controlled
by the coordinator, which can perform these read-only checks in its existing
session. New payments, plans, roles, identities and agreements are not requested.

## Prepared continuation

Download all release assets into a private local directory. `SHA256SUMS` and the
manifest identify the reviewed archives. The helper defaults to offline checks:

```sh
python3 scripts/publish_hf.py --release-dir /path/to/release-assets
```

When the existing identity is available, install `requirements-publish.txt` in a
temporary virtualenv; set HF_TOKEN through the approved secret mechanism. First
run **read-only** `--check-identity --namespace VERIFIED_NAMESPACE --expected-user
VERIFIED_EXISTING_USER`. The helper refuses mismatched users, missing organization
Write/admin, read-only tokens, private/non-static targets, unsafe archives or any
publisher token in the files. Fine-grained target permissions stay server-enforced.

The user has authorized necessary free publishing. With the established rights,
add `--publish` to create/update only these five public Static repos:
`suno-by-ace-data-cloud`, `seedance-by-ace-data-cloud`,
`happyhorse-by-ace-data-cloud`, `gpt-image-by-ace-data-cloud`,
`nano-banana-by-ace-data-cloud`. No model generation, billing, token/role change,
plan upgrade, agreement or background publishing workflow is part of the helper.
It records exact commit IDs after each upload. It does not claim search/install
success; the coordinator then checks service-term search, normal open/duplicate,
no-Key UI and screenshots. Existing completed-task same-ID readback is a separate
authorized validation, never a new paid generation.

The official Provider partner route remains
<https://huggingface.co/docs/inference-providers/register-as-a-provider> and its
linked technical discussion. Formal Provider submission needs the verified
company identity, exact fixed model/service rights and settlement facts; the
Space release does not fulfill those or imply default/featured status.
