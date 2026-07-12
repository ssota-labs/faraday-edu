// Tests for `faraday doctor` + `faraday upgrade`. pnpm is simulated via an
// injected runCommand so no network/registry is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { runFaradayCli } from "./cli.mjs";

async function tmp() {
  return fs.mkdtemp(path.join(os.tmpdir(), "faraday-doctor-"));
}
const read = (dir, rel) => fs.readFile(path.join(dir, rel), "utf8");
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

async function scaffold(base, name) {
  await runFaradayCli(
    ["new", name, "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, throwOnError: true },
  );
  return path.join(base, name);
}

/** A fake `pnpm` that rewrites @faraday-academy/* pins on `add` and (optionally)
 *  writes a lockfile on `install`. */
function fakePnpm(root, { lockOnInstall = true, failOnAdd = false } = {}) {
  return async (command, args) => {
    assert.equal(command, "pnpm");
    if (args[0] === "add") {
      if (failOnAdd) throw new Error("pnpm add exited with code 1");
      const group = args.includes("--save-dev") ? "devDependencies" : "dependencies";
      const specs = args.filter((a) => a.startsWith("@faraday-academy/"));
      const pkgPath = path.join(root, "package.json");
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
      for (const s of specs) {
        const at = s.lastIndexOf("@");
        pkg[group][s.slice(0, at)] = s.slice(at + 1);
      }
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    } else if (args[0] === "install") {
      if (lockOnInstall) await fs.writeFile(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    }
  };
}

test("doctor passes on an installed (lockfile present) lesson", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "healthy");
  await fs.writeFile(path.join(dir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  let out = "";
  await runFaradayCli(["doctor", "--dir", dir], { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true });
  assert.match(out, /healthy/);
  await fs.rm(base, { recursive: true, force: true });
});

test("doctor fails (exit 3) when the lockfile is missing", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "uninstalled");
  let code = 0;
  await runFaradayCli(["doctor", "--dir", dir], { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) });
  assert.equal(code, 3);
  await fs.rm(base, { recursive: true, force: true });
});

test("doctor fails (exit 3) when a required file is missing", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "broken");
  await fs.writeFile(path.join(dir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  await fs.rm(path.join(dir, "src", "app.css"));
  let code = 0;
  await runFaradayCli(["doctor", "--dir", dir], { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) });
  assert.equal(code, 3);
  await fs.rm(base, { recursive: true, force: true });
});

test("upgrade moves the runtime pin exactly, then passes doctor", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "bumpable");
  assert.equal(JSON.parse(await read(dir, "package.json")).dependencies["@faraday-academy/runtime"], "0.1.0");

  let out = "";
  await runFaradayCli(
    ["upgrade", "--to", "0.2.0", "--dir", dir],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, runCommand: fakePnpm(dir), throwOnError: true },
  );
  assert.match(out, /@faraday-academy\/runtime@0\.2\.0/);
  assert.equal(JSON.parse(await read(dir, "package.json")).dependencies["@faraday-academy/runtime"], "0.2.0");
  assert.ok(await exists(path.join(dir, "pnpm-lock.yaml")), "install should have produced a lockfile");
  await fs.rm(base, { recursive: true, force: true });
});

test("upgrade rolls back package.json (exit 3) when doctor fails afterward", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "willfail");
  const before = await read(dir, "package.json");

  let code = 0;
  await runFaradayCli(
    ["upgrade", "--to", "0.2.0", "--dir", dir],
    { cwd: base, stdout: () => {}, stderr: () => {}, runCommand: fakePnpm(dir, { lockOnInstall: false }), setExitCode: (c) => (code = c) },
  );
  assert.equal(code, 3);
  assert.equal(await read(dir, "package.json"), before, "package.json must be restored to pre-upgrade");
  await fs.rm(base, { recursive: true, force: true });
});

test("upgrade reverts (exit 4) when pnpm add fails", async () => {
  const base = await tmp();
  const dir = await scaffold(base, "envfail");
  const before = await read(dir, "package.json");

  let code = 0;
  await runFaradayCli(
    ["upgrade", "--to", "9.9.9", "--dir", dir],
    { cwd: base, stdout: () => {}, stderr: () => {}, runCommand: fakePnpm(dir, { failOnAdd: true }), setExitCode: (c) => (code = c) },
  );
  assert.equal(code, 4);
  assert.equal(await read(dir, "package.json"), before, "package.json must be untouched after a failed add");
  await fs.rm(base, { recursive: true, force: true });
});
