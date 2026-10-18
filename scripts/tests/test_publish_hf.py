import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import hashlib

spec = importlib.util.spec_from_file_location("publish_hf", Path(__file__).resolve().parents[1] / "publish_hf.py")
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class PublisherTests(unittest.TestCase):
    def fixture(self, folder, unsafe=False):
        assets = []
        for slug in publisher.SERVICES:
            path = folder / (slug + "-static-space.zip")
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("README.md", "---\nsdk: static\napp_file: index.html\n---\n")
                archive.writestr("index.html", "Actual artifact fixture")
                if unsafe:
                    archive.writestr("../escape", "bad")
            assets.append({"service": slug, "asset": path.name,
                           "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
        (folder / "release-manifest.json").write_text(json.dumps({"assets": assets}))

    def test_offline_manifest_and_all_five_archives(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            self.fixture(folder)
            _, archives = publisher.checked_archives(folder)
            self.assertEqual(len(archives), 5)

    def test_mismatch_and_archive_traversal_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            self.fixture(folder)
            (folder / "suno-static-space.zip").write_bytes(b"tampered")
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                publisher.checked_archives(folder)
            self.fixture(folder, unsafe=True)
            with self.assertRaisesRegex(ValueError, "Unsafe"):
                publisher.checked_archives(folder)

    def test_identity_and_existing_org_role_are_not_guessed(self):
        identity = {"name": "existing-user", "auth": {"accessToken": {"role": "fineGrained"}},
                    "orgs": [{"name": "existing-company", "roleInOrg": "write"}]}
        valid = publisher.checked_identity(identity, "existing-user", "existing-company")
        self.assertEqual(valid["namespace"], "existing-company")
        with self.assertRaisesRegex(ValueError, "differs"):
            publisher.checked_identity(identity, "different-user", "existing-company")
        with self.assertRaisesRegex(ValueError, "Write/admin"):
            publisher.checked_identity(identity, "existing-user", "guessed-company")
        identity["orgs"][0]["roleInOrg"] = "read"
        with self.assertRaisesRegex(ValueError, "Write/admin"):
            publisher.checked_identity(identity, "existing-user", "existing-company")

    def test_read_token_or_invalid_namespace_does_not_expand_rights(self):
        identity = {"name": "existing-user", "auth": {"accessToken": {"role": "read"}}}
        with self.assertRaisesRegex(ValueError, "write/fine-grained"):
            publisher.checked_identity(identity, "existing-user", "existing-user")
        with self.assertRaisesRegex(ValueError, "exact existing"):
            publisher.checked_identity(identity, "existing-user", "company/other")


if __name__ == "__main__":
    unittest.main()
