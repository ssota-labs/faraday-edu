// Unit tests for scripts/setup-env-local.mjs (no real secrets in repo).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "setup-env-local.mjs");

async function tmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "setup-env-local-"));
}

async function runSetup(dir, env = {}) {
  const { stdout, stderr } = await execFileAsync("node", [SCRIPT, "--dir", dir], {
    env: { ...process.env, ...env },
  });
  return `${stdout}${stderr}`;
}

test("no-op when .env.example is missing", async () => {
  const dir = await tmpDir();
  const log = await runSetup(dir);
  assert.match(log, /no \.env\.example found/);
  await assert.rejects(() => fs.access(path.join(dir, ".env.local")));
});

test("writes matching runtime secrets from process.env", async () => {
  const dir = await tmpDir();
  await fs.writeFile(
    path.join(dir, ".env.example"),
    "# comment\nFARADAY_SKIP_INSTALL=\nNPM_TOKEN=\n",
  );
  const log = await runSetup(dir, {
    FARADAY_SKIP_INSTALL: "1",
    NPM_TOKEN: "npm_test_token",
    UNLISTED_SECRET: "ignored",
  });
  assert.match(log, /wrote \.env\.local/);
  assert.match(log, /FARADAY_SKIP_INSTALL/);
  assert.match(log, /NPM_TOKEN/);
  assert.doesNotMatch(log, /npm_test_token/);

  const local = await fs.readFile(path.join(dir, ".env.local"), "utf8");
  assert.match(local, /FARADAY_SKIP_INSTALL=1/);
  assert.match(local, /NPM_TOKEN=npm_test_token/);
  assert.doesNotMatch(local, /UNLISTED_SECRET/);
});

test("preserves existing .env.local keys not refreshed from env", async () => {
  const dir = await tmpDir();
  await fs.writeFile(path.join(dir, ".env.example"), "KEEP=\nREFRESH=\n");
  await fs.writeFile(path.join(dir, ".env.local"), "KEEP=old\nREFRESH=stale\n");
  await runSetup(dir, { REFRESH: "new" });

  const local = await fs.readFile(path.join(dir, ".env.local"), "utf8");
  assert.match(local, /KEEP=old/);
  assert.match(local, /REFRESH=new/);
});

test("does not overwrite with empty env values", async () => {
  const dir = await tmpDir();
  await fs.writeFile(path.join(dir, ".env.example"), "NPM_TOKEN=\n");
  await fs.writeFile(path.join(dir, ".env.local"), "NPM_TOKEN=keep-me\n");
  await runSetup(dir, { NPM_TOKEN: "" });

  const local = await fs.readFile(path.join(dir, ".env.local"), "utf8");
  assert.match(local, /NPM_TOKEN=keep-me/);
});

test("quotes values that need escaping", async () => {
  const dir = await tmpDir();
  await fs.writeFile(path.join(dir, ".env.example"), "NPM_TOKEN=\n");
  await runSetup(dir, { NPM_TOKEN: "has spaces" });

  const local = await fs.readFile(path.join(dir, ".env.local"), "utf8");
  assert.match(local, /NPM_TOKEN="has spaces"/);
});
