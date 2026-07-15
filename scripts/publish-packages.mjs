#!/usr/bin/env node
// Publish @faraday-academy/{ui,kit,three,tutor,cli} to npm in dependency order.
// Requires NPM_TOKEN (or an existing `npm whoami` session) with publish rights
// on the @faraday-academy org. Exit 4 on auth/environment failure; 1 on publish failure.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORDER = ["ui", "kit", "three", "tutor", "cli"];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: opts.cwd ?? root, env: opts.env ?? process.env });
  return r.status ?? 1;
}

function loadDotEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

loadDotEnvLocal();

const dry = process.argv.includes("--dry-run");

if (process.env.NPM_TOKEN) {
  // Scoped auth for registry.npmjs.org without writing secrets to disk beyond the session.
  process.env.NPM_CONFIG_USERCONFIG = path.join(root, ".npmrc.publish");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(
    process.env.NPM_CONFIG_USERCONFIG,
    `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\nalways-auth=true\n`,
  );
}

if (!dry) {
  const who = spawnSync("npm", ["whoami"], { encoding: "utf8", cwd: root, env: process.env });
  if (who.status !== 0) {
    console.error("npm auth required: set NPM_TOKEN (Cursor Secret / CI) or run `npm login`.");
    console.error(who.stderr || who.stdout);
    process.exit(4);
  }
  console.log(`npm whoami → ${who.stdout.trim()}`);
} else {
  console.log("dry-run: skipping npm auth (pack only)");
}

for (const name of ORDER) {
  const pkgDir = path.join(root, "packages", name);
  const pkg = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));
  console.log(`\n── ${pkg.name}@${pkg.version}${dry ? " (dry-run)" : ""} ──`);

  // fair-code: the license MUST ship in every tarball. `npm pack` runs the
  // package's prepack (which copies ../../LICENSE.md in) then lists the contents;
  // verify LICENSE.md is there before publishing, so we never publish without terms.
  const packRes = spawnSync("npm", ["pack", "--dry-run", "--json"], { cwd: pkgDir, encoding: "utf8", env: process.env });
  if (packRes.status !== 0) {
    console.error(packRes.stderr || packRes.stdout);
    process.exit(1);
  }
  let tarFiles = [];
  try {
    // prepack scripts may print to stdout; extract the trailing JSON array.
    const raw = packRes.stdout.trim();
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    const json = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
    tarFiles = (JSON.parse(json)[0]?.files ?? []).map((f) => f.path);
  } catch {
    console.error(`could not parse \`npm pack --dry-run --json\` for ${pkg.name}`);
    process.exit(1);
  }
  if (!tarFiles.some((p) => p === "LICENSE.md" || p.endsWith("/LICENSE.md"))) {
    console.error(
      `✗ ${pkg.name}: LICENSE.md not in the tarball — the fair-code license must ship.\n` +
        `  Check the package's prepack (copies ../../LICENSE.md) and its \`files\` list.`,
    );
    process.exit(1);
  }
  console.log(`  ✓ LICENSE.md ships (${tarFiles.length} files)`);

  if (dry) continue;

  const pub = run("npm", ["publish", "--access", "public"], { cwd: pkgDir });
  if (pub !== 0) {
    console.error(`publish failed for ${pkg.name}`);
    process.exit(1);
  }
}

if (dry) {
  console.log("\nDry-run OK. Re-run without --dry-run to publish (requires NPM_TOKEN).");
} else {
  console.log("\nPublished:", ORDER.map((n) => `@faraday-academy/${n}`).join(", "));
}
