// Integration tests for the scaffold pipeline (centralized-runtime model). Uses
// a real tmpdir, no install.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateLesson } from "./generate.mjs";
import { runFaradayCli } from "./cli.mjs";

async function tmp() {
  return fs.mkdtemp(path.join(os.tmpdir(), "faraday-test-"));
}
const read = (dir, rel) => fs.readFile(path.join(dir, rel), "utf8");
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

test("generateLesson produces the expected tree + injections", async () => {
  const base = await tmp();
  const target = path.join(base, "out");
  const result = await generateLesson({ targetDir: target, name: "My Cool Lesson", uuid: () => "fixed-id" });

  assert.equal(result.packageName, "my-cool-lesson");
  assert.equal(result.title, "My Cool Lesson");

  for (const rel of [
    "package.json",
    "components.json",
    ".gitignore",
    "app/layout.tsx",
    "app/page.tsx",
    "app/globals.css",
    "src/lesson/lesson.tsx",
    ".faraday/provenance.json",
  ]) {
    assert.ok(await exists(path.join(target, rel)), `missing ${rel}`);
  }

  // the runtime is NOT vendored — it's a pinned dependency
  assert.equal(await exists(path.join(target, "src/faraday")), false, "runtime must not be vendored");
  assert.equal(await exists(path.join(target, ".faraday-manifest.json")), false, "no integrity manifest");

  const pkg = JSON.parse(await read(target, "package.json"));
  assert.equal(pkg.name, "my-cool-lesson");
  assert.equal(pkg.private, true);
  const pin = pkg.dependencies["@faraday-academy/kit"];
  assert.ok(pin && /^\d+\.\d+\.\d+/.test(pin), `runtime must be pinned exactly, got ${pin}`);
  assert.equal(pkg.dependencies["@faraday-academy/ui"], "0.2.0");
  assert.match(await read(target, "app/layout.tsx"), /<title>My Cool Lesson<\/title>/);

  const css = await read(target, "app/globals.css");
  assert.match(css, /@import "@faraday-academy\/kit\/styles\.css"/);
  assert.match(css, /@source "\.\.\/src/);

  assert.equal(await exists(path.join(target, "gitignore")), false);

  const prov = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.equal(prov.lessonId, "fixed-id");
  assert.match(prov.runtime, /@faraday-academy\/kit@/);

  await fs.rm(base, { recursive: true, force: true });
});

test("generateLesson scaffolds the .faraday/plan/ folder", async () => {
  const base = await tmp();
  const target = path.join(base, "out");
  await generateLesson({ targetDir: target, name: "Plan Lesson", uuid: () => "fixed-id" });
  assert.ok(await exists(path.join(target, ".faraday/plan/index.md")), "plan/index.md must exist");
  const idx = await read(target, ".faraday/plan/index.md");
  assert.match(idx, /one folder per plan/i);
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday init attaches Faraday to an existing project", async () => {
  const base = await tmp();
  await fs.writeFile(
    path.join(base, "package.json"),
    JSON.stringify({ name: "existing-app", dependencies: { react: "^19.2.0" } }),
  );
  let out = "";
  await runFaradayCli(
    ["init", "--skip-install", "--json"],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.command, "init");
  assert.equal(parsed.packageName, "existing-app");
  assert.ok(await exists(path.join(base, "AGENTS.md")));
  assert.match(await read(base, "AGENTS.md"), /## Faraday/);
  assert.ok(await exists(path.join(base, ".faraday/provenance.json")));
  const pkg = JSON.parse(await read(base, "package.json"));
  assert.equal(pkg.dependencies["@faraday-academy/kit"], "0.2.0");
  assert.equal(pkg.dependencies["@faraday-academy/ui"], "0.2.0");
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday new inside a repo (apps/ present) lands under apps/", async () => {
  const base = await tmp();
  await fs.mkdir(path.join(base, "apps"));
  let out = "";
  await runFaradayCli(
    ["new", "second-app", "--skip-install", "--json"],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.dir, path.join(base, "apps", "second-app"));
  assert.ok(await exists(path.join(base, "apps/second-app/src/lesson/lesson.tsx")));
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday new outside a repo stays standalone (backward compatible)", async () => {
  const base = await tmp();
  let out = "";
  await runFaradayCli(
    ["new", "solo", "--skip-install", "--json"],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.dir, path.join(base, "solo"));
  assert.equal(await exists(path.join(base, "apps")), false, "no apps/ dir when standalone");
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday new --json --skip-install reports structured output", async () => {
  const base = await tmp();
  let out = "";
  await runFaradayCli(
    ["new", "sort-steps", "--skip-install", "--json"],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.packageName, "sort-steps");
  assert.equal(parsed.installed, false);
  assert.ok(await exists(path.join(base, "sort-steps", "src", "lesson", "lesson.tsx")));
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday check passes on a freshly-generated lesson", async () => {
  const base = await tmp();
  await runFaradayCli(
    ["new", "checkable", "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, throwOnError: true },
  );
  let out = "";
  await runFaradayCli(
    ["check", "--dir", path.join(base, "checkable")],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  assert.match(out, /lesson layout intact, kit pinned/);
  await fs.rm(base, { recursive: true, force: true });
});

test("faraday check fails when the runtime pin is a range, not exact (exit 1)", async () => {
  const base = await tmp();
  const dir = path.join(base, "ranged");
  await runFaradayCli(
    ["new", "ranged", "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, throwOnError: true },
  );
  const pkgPath = path.join(dir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.dependencies["@faraday-academy/kit"] = "^0.2.0";
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  let code = 0;
  await runFaradayCli(
    ["check", "--dir", dir],
    { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) },
  );
  assert.equal(code, 1);
  await fs.rm(base, { recursive: true, force: true });
});

test("non-empty target without --overwrite is a usage error (exit 2)", async () => {
  const base = await tmp();
  const dir = path.join(base, "taken");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "keep.txt"), "x");
  let code = 0;
  await runFaradayCli(
    ["new", "taken", "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) },
  );
  assert.equal(code, 2);
  await fs.rm(base, { recursive: true, force: true });
});
