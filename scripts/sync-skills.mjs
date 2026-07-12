// Keep the two faraday skill sets in lock-step.
//
// The `faraday` skill ships twice — once for Claude Code, once for Codex — and the
// READMEs promise "both ship the same skill". They drifted once (6 reference files
// diverged) because they were hand-maintained. This script makes claude-code the
// single source of truth for the shared `references/**` and lets CI fail on any
// future drift.
//
//   node scripts/sync-skills.mjs            # write: mirror canonical -> codex
//   node scripts/sync-skills.mjs --check    # verify identical; exit 1 on drift (CI)
//
// SKILL.md is intentionally NOT byte-identical: each agent carries a tiny declared
// overlay (Codex's `$faraday` invocation note; Claude Code's slash-commands section
// and `/faraday-deploy` verb). Everything else — every references/*.md — must match.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = path.join(ROOT, "plugins/claude-code/skills/faraday/references");
const MIRROR = path.join(ROOT, "plugins/codex/skills/faraday/references");

async function listMd(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name).sort();
}

async function main() {
  const check = process.argv.includes("--check");
  const canonicalFiles = await listMd(CANONICAL);
  const mirrorFiles = await listMd(MIRROR);
  const problems = [];

  // 1. same file set
  const canonicalSet = new Set(canonicalFiles);
  const mirrorSet = new Set(mirrorFiles);
  for (const f of canonicalFiles) if (!mirrorSet.has(f)) problems.push(`missing in codex: references/${f}`);
  for (const f of mirrorFiles) if (!canonicalSet.has(f)) problems.push(`extra in codex (not in canonical): references/${f}`);

  // 2. identical content for shared files
  for (const f of canonicalFiles) {
    if (!mirrorSet.has(f)) continue;
    const a = await fs.readFile(path.join(CANONICAL, f), "utf8");
    const b = await fs.readFile(path.join(MIRROR, f), "utf8");
    if (a !== b) problems.push(`content differs: references/${f}`);
  }

  if (check) {
    if (problems.length === 0) {
      process.stdout.write(`sync-skills: ${canonicalFiles.length} reference files in sync\n`);
      return;
    }
    process.stderr.write("sync-skills: the two faraday skill sets have drifted:\n");
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    process.stderr.write("Run `node scripts/sync-skills.mjs` to re-mirror from claude-code (canonical).\n");
    process.exitCode = 1;
    return;
  }

  // write mode: mirror canonical -> codex, and drop mirror files not in canonical
  for (const f of mirrorFiles) {
    if (!canonicalSet.has(f)) await fs.rm(path.join(MIRROR, f));
  }
  for (const f of canonicalFiles) {
    await fs.copyFile(path.join(CANONICAL, f), path.join(MIRROR, f));
  }
  process.stdout.write(`sync-skills: mirrored ${canonicalFiles.length} reference files to codex\n`);
}

main();
