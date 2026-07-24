import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const STEM = fileURLToPath(new URL("./stem.mjs", import.meta.url));

function runStem(args, { cwd } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [STEM, ...args], {
      cwd: cwd ?? process.cwd(),
      env: { ...process.env, STEM_SKIP_INSTALL: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => {
      stdout += String(c);
    });
    child.stderr.on("data", (c) => {
      stderr += String(c);
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("scaffold creates a checkable lesson without @faraday-academy deps", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "stem-"));
  const dir = path.join(tmp, "orbit-demo");
  const scaffolded = await runStem([
    "scaffold",
    "orbit-demo",
    "--dir",
    dir,
    "--json",
    "--skip-install",
  ]);
  assert.equal(scaffolded.code, 0, scaffolded.stderr);
  const payload = JSON.parse(scaffolded.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.installed, false);

  const pkg = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of Object.keys(deps)) {
    assert.equal(name.startsWith("@faraday-academy/"), false, name);
  }

  const checked = await runStem(["check", "--dir", dir, "--json"]);
  assert.equal(checked.code, 0, checked.stderr + checked.stdout);
  const checkPayload = JSON.parse(checked.stdout);
  assert.equal(checkPayload.ok, true);
});

test("check fails closed when LessonScene is missing", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "stem-"));
  const dir = path.join(tmp, "broken");
  await runStem(["scaffold", "broken", "--dir", dir, "--json", "--skip-install"]);
  await fs.rm(path.join(dir, "src/scene/LessonScene.tsx"));
  const checked = await runStem(["check", "--dir", dir, "--json"]);
  assert.equal(checked.code, 1);
  const payload = JSON.parse(checked.stdout);
  assert.equal(payload.ok, false);
  assert.ok(payload.problems.some((p) => /LessonScene/.test(p)));
});
