"""Create a deterministic local artifact. No credentials, Hub upload or deployment."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = root / "artifacts/suno-static-space.zip"
output.parent.mkdir(exist_ok=True)
paths = ["README.md", "AGENTS.md", "index.html", "client.mjs", "app.mjs", "styles.css", "LICENSE", "PRIVACY.md",
         "readme/README_zh_Hans.md", "assets/get-api-key-en.png", "assets/create-api-key-en.png",
         "docs/asset-sources.json", "docs/attribution-contract.json", "docs/PUBLISHING.md",
         "docs/VALIDATION.md", "docs/API_CONTRACT.md"]
# Keep source-catalog links in the root Suno README resolvable in the archive.
paths = sorted(set(paths + [str(p.relative_to(root)) for folder in ["spaces", "docs"]
                           for p in (root / folder).rglob("*") if p.is_file() and p.suffix in {".md", ".json"}]))
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for name in paths:
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 18, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, (root / name).read_bytes())
print(output)
