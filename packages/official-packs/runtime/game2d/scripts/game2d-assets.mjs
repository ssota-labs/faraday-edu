#!/usr/bin/env node
/**
 * Thin wrapper around `@assetvault/cli` for Faraday `game2d` lessons.
 * Always installs into `public/assets/game2d/` (Vite public URLs).
 *
 * Usage (from lesson root, after `faraday pack add game2d`):
 *   node scripts/game2d-assets.mjs search ui
 *   node scripts/game2d-assets.mjs info kenney/ui-pack
 *   node scripts/game2d-assets.mjs add kenney/ui-pack
 *   node scripts/game2d-assets.mjs starter
 *   node scripts/game2d-assets.mjs verify
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LESSON_ROOT = process.cwd();
const ASSET_DIR = path.join(LESSON_ROOT, "public", "assets", "game2d");
const LOCK_FILE = path.join(ASSET_DIR, "assetvault.lock.json");
const RECOMMENDED = path.join(ASSET_DIR, "recommended.json");

function assetvault(args) {
  const r = spawnSync("npx", ["--no-install", "assetvault", ...args], {
    cwd: LESSON_ROOT,
    stdio: "inherit",
    shell: true,
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
}

function readRecommended() {
  if (!fs.existsSync(RECOMMENDED)) {
    console.error(`missing ${path.relative(LESSON_ROOT, RECOMMENDED)} — reinstall the game2d pack`);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(RECOMMENDED, "utf8"));
}

const [cmd, ...rest] = process.argv.slice(2);

if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
  console.log(`game2d assets — wraps @assetvault/cli (install dir: public/assets/game2d)

Commands:
  search <query>     Search the AssetVault catalog
  info <id>          Show pack metadata + license
  add <id>           Install one pack (--force / --accept-license forwarded)
  starter            Install all packs in recommended.json
  verify             Check assetvault.lock.json against disk

Examples:
  node scripts/game2d-assets.mjs search platformer
  node scripts/game2d-assets.mjs add kenney/ui-pack
  node scripts/game2d-assets.mjs starter
`);
  process.exit(0);
}

fs.mkdirSync(ASSET_DIR, { recursive: true });

if (cmd === "search" || cmd === "info") {
  assetvault([cmd, ...rest]);
} else if (cmd === "add") {
  const id = rest[0];
  if (!id) {
    console.error("usage: game2d-assets add <pack-id> [--force] [--accept-license]");
    process.exit(2);
  }
  assetvault(["add", id, "--to", ASSET_DIR, ...rest.slice(1)]);
} else if (cmd === "starter") {
  const { starter } = readRecommended();
  for (const pack of starter) {
    console.log(`\n→ ${pack.id} (${pack.use})`);
    assetvault(["add", pack.id, "--to", ASSET_DIR]);
  }
  console.log("\nStarter packs installed. Lock file:", path.relative(LESSON_ROOT, LOCK_FILE));
} else if (cmd === "verify") {
  const lock = fs.existsSync(LOCK_FILE) ? LOCK_FILE : path.join(LESSON_ROOT, "assetvault.lock.json");
  assetvault(["verify", lock]);
} else {
  console.error(`unknown command: ${cmd}`);
  process.exit(2);
}
