#!/usr/bin/env node
// Verify the lesson still has the layout + the pinned kit the runtime expects.
// In the centralized model there is no vendored src/faraday tree to hash — the
// kit is a versioned dependency, so "integrity" becomes: required files exist
// and @faraday-academy/kit is pinned to an exact version. Exit 3 on drift.
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const required = [
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "src/main.tsx",
  "src/app.css",
  "src/lesson/lesson.tsx",
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

// The kit must be present and pinned to an EXACT version (no ^/~), so a lesson
// builds reproducibly and `faraday upgrade` is the only way to move the pin.
try {
  const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const pin = pkg.dependencies?.["@faraday-academy/kit"];
  if (!pin) {
    problems.push("@faraday-academy/kit is not a dependency in package.json");
  } else if (/^[\^~]/.test(pin) || pin === "*") {
    problems.push(`@faraday-academy/kit must be pinned to an exact version, found "${pin}"`);
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
