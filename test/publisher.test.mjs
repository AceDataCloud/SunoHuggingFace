import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("publisher validates released archives and existing identity without network", () => {
  const result = spawnSync("python3", ["-m", "unittest", "discover", "-s", "scripts/tests", "-v"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
