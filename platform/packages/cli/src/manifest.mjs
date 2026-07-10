// SHA-256 integrity manifest over the vendored (protected) tree, src/faraday/**.
// Mirrors toolcraft's guardrail: the agent assembles a lesson in src/lesson/**,
// but must not edit the vendored shadcn ui / blocks / runtime. check-integrity.mjs
// re-derives these hashes and fails if the protected tree drifted.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const MANIFEST_NAME = ".faraday-manifest.json";
export const MANIFEST_VERSION = 1;

/** Recursively list files under `dir`, returned as POSIX-style relative paths. */
export async function listFiles(dir, base = dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(abs, base)));
    } else if (entry.isFile()) {
      out.push(path.relative(base, abs).split(path.sep).join("/"));
    }
  }
  return out.sort();
}

async function hashFile(abs) {
  const buf = await fs.readFile(abs);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/** Build { version, root, files: { relpath: sha256 } } for everything under protectedDir. */
export async function buildManifest(protectedDir, rootLabel = "src/faraday") {
  const rels = await listFiles(protectedDir);
  const files = {};
  for (const rel of rels) files[rel] = await hashFile(path.join(protectedDir, rel));
  return { version: MANIFEST_VERSION, root: rootLabel, files };
}

/** Compare on-disk protectedDir against a manifest. Returns findings[] (empty = ok). */
export async function verifyManifest(protectedDir, manifest) {
  const findings = [];
  const current = await buildManifest(protectedDir, manifest.root);
  const expected = manifest.files ?? {};
  for (const [rel, hash] of Object.entries(expected)) {
    if (!(rel in current.files)) {
      findings.push({ code: "missing", file: `${manifest.root}/${rel}`, message: "protected file was deleted" });
    } else if (current.files[rel] !== hash) {
      findings.push({ code: "modified", file: `${manifest.root}/${rel}`, message: "protected file was modified" });
    }
  }
  for (const rel of Object.keys(current.files)) {
    if (!(rel in expected)) {
      findings.push({ code: "added", file: `${manifest.root}/${rel}`, message: "unexpected file added to protected tree" });
    }
  }
  return findings;
}

export async function writeManifest(targetDir, protectedDir, rootLabel = "src/faraday") {
  const manifest = await buildManifest(protectedDir, rootLabel);
  await fs.writeFile(
    path.join(targetDir, MANIFEST_NAME),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  return manifest;
}
