#!/usr/bin/env node
// Verify the lesson still has the layout + the pinned kit the app expects.
// In the centralized model there is no vendored src/faraday tree to hash — the
// kit is a versioned dependency, so "integrity" becomes: required files
// exist and @faraday-academy/kit is pinned to an exact version. Exit 3 on drift.
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const required = [
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "src/lesson/lesson.tsx",
  ".faraday/provenance.json",
  "package.json",
];

const problems = [];

for (const rel of required) {
  try {
    await fs.stat(path.join(root, rel));
  } catch {
    problems.push(`missing required file: ${rel}`);
  }
}

// UI primitives live in the pinned @faraday-academy/ui package. Never vendor
// a local shadcn tree or run `shadcn add` in a lesson.
try {
  await fs.stat(path.join(root, "src/components/ui"));
  problems.push("src/components/ui/ must not exist — import from @faraday-academy/ui/components/ui/* (never shadcn add)");
} catch {
  /* expected missing */
}

try {
  const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const pin = pkg.dependencies?.["@faraday-academy/kit"];
  if (!pin) {
    problems.push("@faraday-academy/kit is not a dependency in package.json");
  } else if (!/^\d+\.\d+\.\d+/.test(pin)) {
    problems.push(`@faraday-academy/kit must be pinned to an exact version, found "${pin}"`);
  }
  const uiPin = pkg.dependencies?.["@faraday-academy/ui"];
  if (!uiPin) {
    problems.push("@faraday-academy/ui is not a dependency in package.json");
  } else if (!/^\d+\.\d+\.\d+/.test(uiPin)) {
    problems.push(`@faraday-academy/ui must be pinned to an exact version, found "${uiPin}"`);
  }
  if (pkg.devDependencies?.shadcn || pkg.dependencies?.shadcn) {
    problems.push("shadcn must not be a lesson dependency — UI is provided by @faraday-academy/ui");
  }
} catch {
  problems.push("package.json is missing or unreadable");
}

if (problems.length) {
  console.error("check-structure: lesson layout/pin drift:\n" + problems.map((m) => "  " + m).join("\n"));
  console.error("\nAuthor your lesson in src/lesson/. The kit is a pinned dependency — move it with `faraday upgrade`.");
  process.exit(3);
}
console.log("check-structure: ok — lesson layout intact, kit pinned");
