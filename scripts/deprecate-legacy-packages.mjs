#!/usr/bin/env node
// Mark pre-0.3.0 npm packages as deprecated (do not unpublish).
// Requires NPM_TOKEN with publish rights on @faraday-academy.
// Exit 4 on auth failure; 1 on deprecate failure.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const DEPRECATIONS = [
  {
    spec: "@faraday-academy/runtime@0.1.0",
    message: "Renamed to @faraday-academy/kit. Use kit@0.3.0.",
  },
  {
    spec: "@faraday-academy/three",
    message: "Removed in Faraday 0.3.0 Phase 1 reset. Do not use for new lessons.",
  },
  {
    spec: "@faraday-academy/tutor",
    message: "Removed in Faraday 0.3.0 Phase 1 reset. Do not use for new lessons.",
  },
];

if (!dry) {
  const who = spawnSync("npm", ["whoami"], { encoding: "utf8", cwd: root, env: process.env });
  if (who.status !== 0) {
    console.error("npm auth required: set NPM_TOKEN or run `npm login`.");
    process.exit(4);
  }
  console.log(`npm whoami → ${who.stdout.trim()}`);
}

for (const { spec, message } of DEPRECATIONS) {
  const args = ["deprecate", spec, message];
  console.log(`\n$ npm ${args.join(" ")}`);
  if (dry) continue;
  const r = spawnSync("npm", args, { stdio: "inherit", cwd: root, env: process.env });
  if ((r.status ?? 1) !== 0) {
    console.error(`failed: ${spec}`);
    process.exit(1);
  }
}

console.log(dry ? "\nDry-run OK. Re-run without --dry-run to deprecate." : "\nDeprecated legacy packages.");
