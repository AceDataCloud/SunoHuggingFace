"""Verify standalone archive entries, local imports, doc links and shared runtime."""
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote
import json
import posixpath
import re
import zipfile

root = Path(__file__).resolve().parents[1]
builds = json.loads((root / "artifacts/spaces-build.json").read_text())
results = []
for build in builds:
    with zipfile.ZipFile(build["archive"]) as archive:
        names = set(archive.namelist())
        assert "README.md" in names and "README_zh_Hans.md" in names
        assert not any(".env" in name or name.startswith(".github/") for name in names)
        html = archive.read("index.html").decode()
        assert f'data-service="{build["slug"]}"' in html
        assert "__SERVICE" not in html
        links = 0
        for name in names:
            text = archive.read(name).decode() if name.endswith((".md", ".mjs")) else ""
            targets = re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', text) if name.endswith(".md") else \
                re.findall(r'from\s+"([^"]+)"', text)
            for target in targets:
                parsed = urlsplit(target)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                normalized = posixpath.normpath(str(PurePosixPath(name).parent / unquote(parsed.path)))
                assert normalized in names, (build["slug"], name, target, normalized)
                links += 1
        for shared in ["client.mjs", "styles.css", "studio/app.mjs", "studio/runtime.mjs", "studio/services.mjs"]:
            assert archive.read(shared) == (root / shared).read_bytes(), shared
        results.append({"slug": build["slug"], "files": len(names), "relative_links_and_imports": links,
                        "standalone": True, "shared_runtime_matches": True})
print(json.dumps(results, indent=2))
