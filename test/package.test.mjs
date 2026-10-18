import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("four standalone Space builds resolve docs/imports and share exact source runtime", () => {
  for (const script of ["scripts/build_spaces.py", "scripts/check_space_packages.py"]) {
    const result = spawnSync("python3", [script], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
  const suno = spawnSync("python3", ["scripts/package_space.py"], { encoding: "utf8" });
  assert.equal(suno.status, 0, suno.stdout + suno.stderr);
});
