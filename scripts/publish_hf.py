"""Verify a reviewed release and publish with an existing authorized HF identity.

Default is offline validation. --check-identity is read-only. --publish is the
explicit mutation switch. HF_TOKEN is process-only and never enters Space files.
Install requirements-publish.txt only when using authenticated HF operations.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import tempfile
import zipfile

SERVICES = ("suno", "seedance", "happyhorse", "gpt-image", "nano-banana")


def checked_archives(directory):
    """Validate exact released bytes and reject unsafe/unexpected archive paths."""
    directory = Path(directory)
    manifest = json.loads((directory / "release-manifest.json").read_text())
    assets = manifest["assets"]
    if sorted(a["service"] for a in assets) != sorted(SERVICES):
        raise ValueError("Manifest must contain exactly the five reviewed services.")
    verified = []
    for asset in assets:
        expected_name = asset["service"] + "-static-space.zip"
        if asset["asset"] != expected_name:
            raise ValueError("Unexpected release asset name.")
        path = directory / expected_name
        if hashlib.sha256(path.read_bytes()).hexdigest() != asset["sha256"]:
            raise ValueError("Release SHA-256 mismatch: " + expected_name)
        with zipfile.ZipFile(path) as archive:
            if len(archive.namelist()) != len(set(archive.namelist())):
                raise ValueError("Duplicate archive members.")
            for member in archive.infolist():
                parts = PurePosixPath(member.filename).parts
                if (not parts or member.filename.startswith("/") or ".." in parts
                        or "\\" in member.filename or member.is_dir()
                        or any(p in {".git", ".github"} or p.startswith(".env") for p in parts)
                        or (member.external_attr >> 16) & 0o170000 == 0o120000):
                    raise ValueError("Unsafe archive member.")
            text = archive.read("README.md").decode()
            header = text.split("---", 2)[1]
            if "sdk: static" not in header or "app_file: index.html" not in header:
                raise ValueError("Only reviewed Static Space artifacts may be uploaded.")
        verified.append((asset["service"], path))
    return manifest, verified


def checked_identity(identity, expected_user, namespace):
    """Never infer company namespace ownership from a public account name."""
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", namespace or ""):
        raise ValueError("Provide the exact existing HF namespace.")
    if not expected_user or identity.get("name") != expected_user:
        raise ValueError("Authenticated HF user differs from --expected-user.")
    if namespace != expected_user:
        organizations = {x.get("name"): x.get("roleInOrg") or x.get("role")
                         for x in identity.get("orgs", [])}
        if organizations.get(namespace) not in {"write", "admin"}:
            raise ValueError("Existing organization Write/admin role was not verified. No role change attempted.")
    token_role = identity.get("auth", {}).get("accessToken", {}).get("role")
    if token_role not in {"write", "fineGrained", "fine-grained"}:
        raise ValueError("Existing token is not a write/fine-grained publishing credential.")
    # Fine-grained permissions are enforced per target by HF; never broaden them.
    return {"user": expected_user, "namespace": namespace, "token_role": token_role,
            "org_roles": [{"name": x.get("name"), "role": x.get("roleInOrg") or x.get("role")}
                          for x in identity.get("orgs", []) if x.get("name") == namespace]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-dir", required=True)
    parser.add_argument("--namespace")
    parser.add_argument("--expected-user")
    parser.add_argument("--check-identity", action="store_true")
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--receipt", default="artifacts/hf-publish-receipt.json")
    args = parser.parse_args()
    manifest, archives = checked_archives(args.release_dir)
    receipt = {"source_sha": manifest["released_source_sha"], "version": manifest["version"],
               "artifact_count": len(archives), "mode": "offline_validate", "spaces": []}
    if args.check_identity or args.publish:
        token = os.environ.get("HF_TOKEN")
        if not token:
            parser.error("HF_TOKEN is absent. Use an existing authorized credential via secure environment; do not paste it into chat.")
        if not args.namespace or not args.expected_user:
            parser.error("--namespace and --expected-user must name the verified existing account context.")
        from huggingface_hub import HfApi
        api = HfApi(endpoint="https://huggingface.co", token=token)
        receipt["identity"] = checked_identity(api.whoami(), args.expected_user, args.namespace)
        receipt["mode"] = "read_only_identity"
        if args.publish:
            receipt["mode"] = "publish_static"
            for slug, path in archives:
                repo_id = args.namespace + "/" + slug + "-by-ace-data-cloud"
                # Server enforces existing account/token rights. No plan, member,
                # permission, secret, or legal-agreement APIs are used here.
                from huggingface_hub.errors import RepositoryNotFoundError
                try:
                    info = api.repo_info(repo_id, repo_type="space")
                except RepositoryNotFoundError:
                    api.create_repo(repo_id, repo_type="space", space_sdk="static", private=False)
                    info = api.repo_info(repo_id, repo_type="space")
                if info.private or getattr(info, "sdk", None) != "static":
                    raise ValueError("Existing target is private or non-static; refusing to alter it.")
                with tempfile.TemporaryDirectory(prefix="ace-hf-release-") as tmp:
                    with zipfile.ZipFile(path) as archive:
                        archive.extractall(tmp)  # Every member was validated above.
                    # Defense in depth: reject accidental publisher credential in any file.
                    if any(token.encode() in p.read_bytes() for p in Path(tmp).rglob("*") if p.is_file()):
                        raise ValueError("Publishing credential detected in artifact; refusing upload.")
                    commit = api.upload_folder(repo_id=repo_id, repo_type="space", folder_path=tmp,
                                               commit_message="Publish reviewed Ace media Space " + manifest["version"])
                receipt["spaces"].append({"service": slug, "repo_id": repo_id,
                    "url": "https://huggingface.co/spaces/" + repo_id,
                    "commit": getattr(commit, "oid", None), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
                # Persist progress after each service; no blind duplicate creation on restart.
                target = Path(args.receipt)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(json.dumps(receipt, indent=2) + "\n")
    target = Path(args.receipt)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
