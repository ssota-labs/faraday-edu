#!/usr/bin/env node
// Bundle the official packs INTO the CLI so a published tarball is self-contained.
// Copies packages/official-packs/<name>/ -> packages/cli/packs/<name>/ (the bundled
// dir, gitignored). Runs on `prepack`. In dev this is optional — pack.mjs's packsRoot()
// falls back to packages/official-packs when packages/cli/packs is absent.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyDirectory } from "../src/copy.mjs";

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.resolve(CLI_ROOT, "..", "official-packs");
const DEST = path.join(CLI_ROOT, "packs");
const CATALOG_SOURCE = path.resolve(CLI_ROOT, "..", "registry", "generated", "catalog.json");
const CATALOG_DEST = path.join(CLI_ROOT, "catalog.json");

// Files at the official-packs root that are NOT packs (schema, docs).
const NON_PACK_ENTRIES = new Set(["pack.schema.json", "README.md"]);

async function hasPackJson(dir) {
  try {
    await fs.access(path.join(dir, "pack.json"));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.rm(DEST, { recursive: true, force: true });
  const bundled = [];
  // Packs are organised into category folders (<category>/<name>/); a flat
  // <name>/ is still supported. Preserve the layout so packsRoot() finds them the
  // same way whether reading source or the bundle.
  for (const entry of await fs.readdir(SOURCE, { withFileTypes: true })) {
    if (!entry.isDirectory() || NON_PACK_ENTRIES.has(entry.name)) continue;
    const entryDir = path.join(SOURCE, entry.name);
    if (await hasPackJson(entryDir)) {
      await copyDirectory(entryDir, path.join(DEST, entry.name));
      bundled.push(entry.name);
      continue;
    }
    for (const child of await fs.readdir(entryDir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue;
      const childDir = path.join(entryDir, child.name);
      if (!(await hasPackJson(childDir))) continue;
      await copyDirectory(childDir, path.join(DEST, entry.name, child.name));
      bundled.push(`${entry.name}/${child.name}`);
    }
  }
  await fs.copyFile(CATALOG_SOURCE, CATALOG_DEST);
  // Log to stderr so `npm pack --json` stdout stays pure JSON (publish gate).
  process.stderr.write(`bundle-packs: copied ${bundled.length} pack(s) + catalog.json (${bundled.sort().join(", ")})\n`);
}

main().catch((err) => {
  process.stderr.write(`bundle-packs failed: ${err.message}\n`);
  process.exit(1);
});
