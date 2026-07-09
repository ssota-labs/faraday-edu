#!/usr/bin/env node
// Verify the vendored, protected tree (src/faraday/**) has not been edited, by
// re-deriving SHA-256 hashes and comparing to .faraday-manifest.json.
// Exit 1 on any drift. Self-contained: no external imports.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const protectedDir = path.join(root, "src", "faraday");
const manifestPath = path.join(root, ".faraday-manifest.json");

async function listFiles(dir, base = dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFiles(abs, base)));
    else if (e.isFile()) out.push(path.relative(base, abs).split(path.sep).join("/"));
  }
  return out.sort();
}

async function hash(abs) {
  return crypto.createHash("sha256").update(await fs.readFile(abs)).digest("hex");
}

let manifest;
try {
  manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
} catch {
  console.error("check-integrity: .faraday-manifest.json is missing or unreadable");
  process.exit(1);
}

const expected = manifest.files ?? {};
const rels = await listFiles(protectedDir);
const current = {};
for (const rel of rels) current[rel] = await hash(path.join(protectedDir, rel));

const findings = [];
for (const [rel, h] of Object.entries(expected)) {
  if (!(rel in current)) findings.push(`  [missing]  src/faraday/${rel}`);
  else if (current[rel] !== h) findings.push(`  [modified] src/faraday/${rel}`);
}
for (const rel of Object.keys(current)) {
  if (!(rel in expected)) findings.push(`  [added]    src/faraday/${rel}`);
}

if (findings.length) {
  console.error("check-integrity: protected tree drifted from manifest\n" + findings.join("\n"));
  console.error("\nsrc/faraday/** is vendored and locked. Author your lesson in src/lesson/ instead.");
  process.exit(1);
}
console.log("check-integrity: ok — src/faraday/** matches manifest");
