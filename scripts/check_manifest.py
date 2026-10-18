"""Validate the actual HF static entry and the approved four-label CTA contract."""
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

root = Path(__file__).resolve().parents[1]
text = (root / "README.md").read_text()
assert text.startswith("---\n")
frontmatter = text.split("---", 2)[1]
for line in ["sdk: static", "app_file: index.html", "title: Suno by Ace Data Cloud"]:
    assert line in frontmatter, line
assert "models:" not in frontmatter, "Do not claim an unverified HF model identity."
for path in ["index.html", "app.mjs", "client.mjs", "styles.css"]:
    assert (root / path).is_file(), path
contract = json.loads((root / "docs/attribution-contract.json").read_text())["contract"]
assert contract["utm_keys"] == ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
for readme in [text, (root / "readme/README_zh_Hans.md").read_text()]:
    for url in re.findall(r"https://platform\.acedata\.cloud/[^\s)\"<>]+", readme):
        qs = parse_qs(urlparse(url).query)
        assert set(contract["utm_keys"]) <= qs.keys(), url
        assert qs["utm_source"] == ["huggingface"]
        for key in contract["utm_keys"]:
            assert re.fullmatch(contract["tag_pattern"], qs[key][0]), (key, url)
print("HF static manifest, app assets and four-label CTA contract validated.")
