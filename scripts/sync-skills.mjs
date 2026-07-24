// Mirror canonical skills/3d-stem into marketplace plugin skill trees.
//
//   node scripts/sync-skills.mjs            # write mirrors
//   node scripts/sync-skills.mjs --check    # fail on drift (CI)
//
// Canonical SSOT: skills/3d-stem/**
// Mirrors: plugins/claude-code/skills/3d-stem, plugins/codex/skills/3d-stem
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = path.join(ROOT, "skills/3d-stem");
const MIRRORS = [
  path.join(ROOT, "plugins/claude-code/skills/3d-stem"),
  path.join(ROOT, "plugins/codex/skills/3d-stem"),
];

async function walk(dir, base = dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...(await walk(abs, base)));
    } else if (entry.isFile()) {
      out.push(path.relative(base, abs));
    }
  }
  return out.sort();
}

async function pathExists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function mirrorTo(dest, { check }) {
  const canonicalFiles = await walk(CANONICAL);
  /** @type {string[]} */
  const problems = [];

  if (!(await pathExists(dest))) {
    if (check) {
      problems.push(`missing mirror directory: ${path.relative(ROOT, dest)}`);
      return problems;
    }
    await fs.mkdir(dest, { recursive: true });
  }

  const mirrorFiles = (await pathExists(dest)) ? await walk(dest) : [];
  const canonicalSet = new Set(canonicalFiles);
  const mirrorSet = new Set(mirrorFiles);

  for (const f of canonicalFiles) {
    const aPath = path.join(CANONICAL, f);
    const bPath = path.join(dest, f);
    if (check) {
      if (!(await pathExists(bPath))) {
        problems.push(`missing in ${path.relative(ROOT, dest)}: ${f}`);
        continue;
      }
      const a = await fs.readFile(aPath);
      const b = await fs.readFile(bPath);
      if (!a.equals(b)) problems.push(`content differs: ${path.relative(ROOT, dest)}/${f}`);
    } else {
      await fs.mkdir(path.dirname(bPath), { recursive: true });
      await fs.copyFile(aPath, bPath);
    }
  }

  for (const f of mirrorFiles) {
    if (!canonicalSet.has(f)) {
      if (check) problems.push(`extra in ${path.relative(ROOT, dest)}: ${f}`);
      else await fs.rm(path.join(dest, f), { force: true });
    }
  }

  // Drop empty dirs left behind after deletes (best-effort)
  if (!check) {
    for (const f of mirrorFiles) {
      if (canonicalSet.has(f)) continue;
      let dir = path.dirname(path.join(dest, f));
      while (dir.startsWith(dest) && dir !== dest) {
        try {
          await fs.rmdir(dir);
        } catch {
          break;
        }
        dir = path.dirname(dir);
      }
    }
  }

  return problems;
}

async function main() {
  const check = process.argv.includes("--check");
  if (!(await pathExists(CANONICAL))) {
    console.error(`sync-skills: canonical missing: ${CANONICAL}`);
    process.exitCode = 1;
    return;
  }

  /** @type {string[]} */
  const problems = [];
  for (const mirror of MIRRORS) {
    problems.push(...(await mirrorTo(mirror, { check })));
  }

  // Retire leftover faraday skill trees if present (check warns; write removes references? keep stub handled elsewhere)
  if (check) {
    if (problems.length === 0) {
      const n = (await walk(CANONICAL)).length;
      process.stdout.write(`sync-skills: ${n} files in sync across ${MIRRORS.length} mirrors\n`);
      return;
    }
    process.stderr.write("sync-skills: 3d-stem skill mirrors have drifted:\n");
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    process.stderr.write("Run `node scripts/sync-skills.mjs` to re-mirror from skills/3d-stem.\n");
    process.exitCode = 1;
    return;
  }

  const n = (await walk(CANONICAL)).length;
  process.stdout.write(`sync-skills: mirrored ${n} files to ${MIRRORS.length} plugin skill trees\n`);
}

main();
