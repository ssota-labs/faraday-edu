// Integration tests for the scaffold pipeline (centralized-kit model). Uses a
// real tmpdir, no install.
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

  // required files exist (no vendored src/faraday tree, no integrity manifest)
  for (const rel of [
    "index.html",
    "package.json",
    "components.json",
    ".gitignore",
    "src/main.tsx",
    "src/app.css",
    "src/lesson/lesson.tsx",
    ".faraday/provenance.json",
  ]) {
    assert.ok(await exists(path.join(target, rel)), `missing ${rel}`);
  }

  // the kit is NOT vendored — it's a pinned dependency
  assert.equal(await exists(path.join(target, "src/faraday")), false, "kit must not be vendored");
  assert.equal(await exists(path.join(target, ".faraday-manifest.json")), false, "no integrity manifest");

  // name + title injected; kit pinned to an exact version
  const pkg = JSON.parse(await read(target, "package.json"));
  assert.equal(pkg.name, "my-cool-lesson");
  assert.equal(pkg.private, true);
  const pin = pkg.dependencies["@faraday-academy/kit"];
  assert.ok(pin && !/^[\^~*]/.test(pin), `kit must be pinned exactly, got ${pin}`);
  assert.match(await read(target, "index.html"), /<title>My Cool Lesson<\/title>/);

  // app.css wires the kit stylesheet + scans the lesson
  const css = await read(target, "src/app.css");
  assert.match(css, /@import "@faraday-academy\/kit\/styles\.css"/);
  assert.match(css, /@source "\.\/lesson/);

  // dotless template gitignore did not survive
  assert.equal(await exists(path.join(target, "gitignore")), false);

  // provenance carries the injected id + the kit line
  const prov = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.equal(prov.lessonId, "fixed-id");
  assert.match(prov.kit, /@faraday-academy\/kit@/);

  await fs.rm(base, { recursive: true, force: true });
});

test("addon flags are a usage error while addons are being repackaged (exit 2)", async () => {
  const base = await tmp();
  for (const flag of ["--3d", "--physics", "--tutor"]) {
    let code = 0;
    await runFaradayCli(
      ["new", "addon-lesson", flag, "--skip-install", "--at", path.join(base, flag.slice(2))],
      { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) },
    );
    assert.equal(code, 2, `${flag} should be a usage error`);
    assert.equal(await exists(path.join(base, flag.slice(2), "package.json")), false, `${flag} must not emit files`);
  }
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

test("faraday check fails when the kit pin is a range, not exact (exit 1)", async () => {
  const base = await tmp();
  const dir = path.join(base, "ranged");
  await runFaradayCli(
    ["new", "ranged", "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, throwOnError: true },
  );
  // tamper: loosen the exact pin to a caret range
  const pkgPath = path.join(dir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.dependencies["@faraday-academy/kit"] = "^0.1.0";
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
