"""Check service-specific metadata, source links and the unchanged CTA contract."""
from pathlib import Path
from urllib.parse import parse_qs, urlsplit, unquote
import json
import re

root = Path(__file__).resolve().parents[1]
names = {"seedance": "Seedance", "happyhorse": "HappyHorse", "gpt-image": "GPT Image", "nano-banana": "Nano Banana"}
contract = json.loads((root / "docs/attribution-contract.json").read_text())["contract"]
count = 0
for slug, name in names.items():
    folder = root / "spaces" / slug
    text = (folder / "README.md").read_text()
    frontmatter = text.split("---", 2)[1]
    assert f"title: {name} by Ace Data Cloud" in frontmatter
    assert "sdk: static" in frontmatter and "app_file: index.html" in frontmatter
    assert "models:" not in frontmatter
    for doc in folder.glob("*.md"):
        body = doc.read_text()
        for target in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", body):
            parsed = urlsplit(target)
            if not parsed.scheme and parsed.path:
                assert (folder / unquote(parsed.path)).is_file(), (doc, target)
            if parsed.netloc == "platform.acedata.cloud":
                qs = parse_qs(parsed.query)
                assert set(contract["utm_keys"]) <= qs.keys(), target
                assert qs["utm_source"] == ["huggingface"]
                for key in contract["utm_keys"]:
                    assert re.fullmatch(contract["tag_pattern"], qs[key][0])
                count += 1
print(f"Four independent HF manifests/guides and {count} four-label CTA links validated.")
