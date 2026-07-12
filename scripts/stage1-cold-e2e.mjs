#!/usr/bin/env node
// Stage 1 cold-path smoke (local CLI stand-in for Claude/Codex agent E2E).
// Covers: marketplace URL · CLI scaffold 2D + `pack add three` · example check/typecheck/build.
// Exit 0 on pass. Real marketplace install in Claude/Codex remains a human gate.

import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, rmSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "packages/cli/bin/faraday.mjs");

function run(cmd, args, cwd = root) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, FARADAY_SKIP_INSTALL: "1" },
  });
  if ((r.status ?? 1) !== 0) throw new Error(`failed: ${cmd} ${args.join(" ")}`);
}

function linkAcademy(lessonDir) {
  const nm = path.join(lessonDir, "node_modules", "@faraday-academy");
  mkdirSync(nm, { recursive: true });
  for (const pkg of ["runtime", "three", "tutor"]) {
    const link = path.join(nm, pkg);
    try {
      rmSync(link, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    symlinkSync(path.join(root, "packages", pkg), link);
  }
}

function assertMarketplace() {
  const market = JSON.parse(readFileSync(path.join(root, ".claude-plugin/marketplace.json"), "utf8"));
  const url = market.owner?.url;
  if (url !== "https://github.com/ssota-labs/faraday-academy") {
    throw new Error(`marketplace owner.url wrong: ${url}`);
  }
  for (const rel of [
    "plugins/claude-code/README.md",
    "plugins/codex/README.md",
    "plugins/README.md",
  ]) {
    const text = readFileSync(path.join(root, rel), "utf8");
    if (text.includes("titanism/faraday-edu") || text.includes("ssota-labs/faraday-edu")) {
      throw new Error(`${rel} still references old marketplace slug`);
    }
    if (!text.includes("ssota-labs/faraday-academy")) {
      throw new Error(`${rel} missing ssota-labs/faraday-academy`);
    }
  }
  console.log("marketplace URL smoke OK");
}

function main() {
  assertMarketplace();

  console.log("\n── CLI unit tests ──");
  run("node", ["--test", "packages/cli/src/*.test.mjs"]);

  console.log("\n── Scaffold 2D + pack add three (skip-install) ──");
  const work = mkdtempSync(path.join(tmpdir(), "faraday-cold-"));
  const s1 = path.join(work, "s1");
  const s2 = path.join(work, "s2");
  run("node", [cli, "new", "s1", "--at", s1, "--skip-install", "--overwrite"]);
  run("node", [cli, "new", "s2", "--at", s2, "--skip-install", "--overwrite"]);
  run("node", [cli, "pack", "add", "three", "--dir", s2]);

  for (const dir of [s1, s2]) {
    const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
    if (pkg.dependencies?.["@faraday-academy/runtime"] !== "0.1.0") {
      throw new Error(`${dir}: runtime pin missing`);
    }
    linkAcademy(dir);
    run("node", ["scripts/check-structure.mjs"], dir);
  }
  console.log("scaffold + structure check OK");

  console.log("\n── Example demos (workspace) ──");
  run("pnpm", ["install"]);
  for (const name of ["compound-interest", "voyage-log"]) {
    const dir = path.join(root, "examples", name);
    if (!existsSync(dir)) throw new Error(`missing ${name}`);
    run("pnpm", ["check"], dir);
    run("pnpm", ["typecheck"], dir);
    run("pnpm", ["build"], dir);
  }

  console.log("\nCold E2E passed (CLI + marketplace URL + demo builds).");
  console.log("Human gate remaining: Claude Code / Codex `/plugin marketplace add ssota-labs/faraday-academy`.");
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
