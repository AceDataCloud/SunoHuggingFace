"""Build four independent HF Static Space directories/zips from one source tree.

No network, account creation, Hub upload, or paid request. The artifacts are real
apps; they have distinct native parameters while sharing the reviewed runtime.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import zipfile

root = Path(__file__).resolve().parents[1]
profiles = json.loads(subprocess.check_output(
    ["node", "--input-type=module", "-e",
     "import { PROFILES } from './studio/services.mjs'; console.log(JSON.stringify(PROFILES))"],
    cwd=root, text=True,
))
summary = []
for slug, profile in profiles.items():
    target = root / "artifacts/spaces" / slug
    target.mkdir(parents=True, exist_ok=True)
    entry = (root / "studio/index.html").read_text().replace(
        "__SERVICE_SLUG__", slug).replace("__SERVICE_NAME__", profile["name"])
    (target / "index.html").write_text(entry)
    for name in ["client.mjs", "styles.css", "AGENTS.md", "LICENSE", "PRIVACY.md"]:
        shutil.copy2(root / name, target / name)
    for name in ["services.mjs", "runtime.mjs", "app.mjs"]:
        (target / "studio").mkdir(exist_ok=True)
        shutil.copy2(root / "studio" / name, target / "studio" / name)
    for name in ["get-api-key-en.png", "create-api-key-en.png"]:
        (target / "assets").mkdir(exist_ok=True)
        shutil.copy2(root / "assets" / name, target / "assets" / name)
    for name in ["README.md", "README_zh_Hans.md"]:
        # Source docs use ../../ to reference the common assets/docs; packaged
        # README lives at root with those same paths, without duplicated prose.
        text = (root / "spaces" / slug / name).read_text().replace("../../", "")
        (target / name).write_text(text)
    for name in ["asset-sources.json", "attribution-contract.json", "TOP5_PUBLISHING.md", "ACCOUNT_AND_RELEASE.md",
                 "TOP5_VALIDATION.md", "top5-20261018/brand-policy-review.json",
                 "top5-20261018/backend-openapi-sources.json"]:
        dest = target / "docs" / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(root / "docs" / name, dest)
    archive = root / "artifacts" / f"{slug}-static-space.zip"
    names = sorted(str(p.relative_to(target)) for p in target.rglob("*") if p.is_file())
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as out:
        for name in names:
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 18, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            out.writestr(info, (target / name).read_bytes())
    summary.append({"service": profile["name"], "slug": slug, "directory": str(target),
                    "archive": str(archive), "files": len(names),
                    "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
                    "publication": "not uploaded or deployed"})
(root / "artifacts/spaces-build.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))
