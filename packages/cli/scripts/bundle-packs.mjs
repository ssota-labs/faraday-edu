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

// Files at the official-packs root that are NOT packs (schema, docs).
const NON_PACK_ENTRIES = new Set(["pack.schema.json", "README.md"]);

async function main() {
  await fs.rm(DEST, { recursive: true, force: true });
  const entries = await fs.readdir(SOURCE, { withFileTypes: true });
  const bundled = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || NON_PACK_ENTRIES.has(entry.name)) continue;
    const manifest = path.join(SOURCE, entry.name, "pack.json");
    try {
      await fs.access(manifest);
    } catch {
      continue; // not a pack (no manifest)
    }
    await copyDirectory(path.join(SOURCE, entry.name), path.join(DEST, entry.name));
    bundled.push(entry.name);
  }
  process.stdout.write(`bundle-packs: copied ${bundled.length} pack(s) -> packs/ (${bundled.sort().join(", ")})\n`);
}

main().catch((err) => {
  process.stderr.write(`bundle-packs failed: ${err.message}\n`);
  process.exit(1);
});
