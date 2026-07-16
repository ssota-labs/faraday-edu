#!/usr/bin/env node
// Stage 1 cold-path smoke (local CLI stand-in for Claude/Codex agent E2E).
// Covers: marketplace URL · minimal vinext scaffold · attach-style init · cold build.
// Exit 0 on pass. Real marketplace install in Claude/Codex remains a human gate.

import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, rmSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
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

function runInstall(cmd, args, cwd = root) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
  if ((r.status ?? 1) !== 0) throw new Error(`failed: ${cmd} ${args.join(" ")}`);
}

function patchAcademyPins(lessonDir) {
  const pkgPath = path.join(lessonDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.dependencies = pkg.dependencies ?? {};
  for (const name of ["ui", "kit"]) {
    pkg.dependencies[`@faraday-academy/${name}`] = `file:${path.join(root, "packages", name)}`;
  }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function restoreAcademyPins(lessonDir, version = "0.3.0") {
  const pkgPath = path.join(lessonDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.dependencies = pkg.dependencies ?? {};
  for (const name of ["ui", "kit"]) {
    pkg.dependencies[`@faraday-academy/${name}`] = version;
  }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function linkAcademy(lessonDir) {
  const nm = path.join(lessonDir, "node_modules", "@faraday-academy");
  mkdirSync(nm, { recursive: true });
  for (const pkg of ["ui", "kit", "lms"]) {
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

async function main() {
  assertMarketplace();

  console.log("\n── Skill sets in sync (claude-code == codex) ──");
  run("node", ["scripts/sync-skills.mjs", "--check"]);

  console.log("\n── CLI unit tests ──");
  run("node", ["--test", "packages/cli/src/*.test.mjs"]);

  console.log("\n── Scaffold minimal vinext lesson (skip-install) ──");
  const work = mkdtempSync(path.join(tmpdir(), "faraday-cold-"));
  const s1 = path.join(work, "s1");
  run("node", [cli, "new", "s1", "--at", s1, "--skip-install", "--overwrite"]);
  const pkg = JSON.parse(readFileSync(path.join(s1, "package.json"), "utf8"));
  if (
    pkg.dependencies?.["@faraday-academy/kit"] !== "0.3.0" ||
    pkg.dependencies?.["@faraday-academy/ui"] !== "0.3.0"
  ) {
    throw new Error(`${s1}: kit/ui pins missing`);
  }
  patchAcademyPins(s1);
  linkAcademy(s1);
  runInstall("pnpm", ["install"], s1);
  restoreAcademyPins(s1);
  run("pnpm", ["check"], s1);
  run("pnpm", ["typecheck"], s1);
  run("pnpm", ["build"], s1);

  const attached = path.join(work, "attached");
  mkdirSync(attached, { recursive: true });
  await import("node:fs/promises").then(({ writeFile }) =>
    writeFile(
      path.join(attached, "package.json"),
      JSON.stringify({ name: "attached", dependencies: { react: "^19.2.0" } }, null, 2),
    ),
  );
  run("node", [cli, "init", "--dir", attached, "--skip-install"]);
  console.log("scaffold + attach checks OK");

  console.log("\nCold E2E passed (CLI + marketplace URL + vinext scaffold build).");
  console.log("Human gate remaining: Claude Code / Codex `/plugin marketplace add ssota-labs/faraday-academy`.");
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
