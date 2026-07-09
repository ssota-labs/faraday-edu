#!/usr/bin/env node
// Verify the lesson still has the layout the runtime expects. Exit 3 on drift.
import fs from "node:fs/promises";
import path from "node:path";

const required = [
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "src/main.tsx",
  "src/lesson/lesson.tsx",
  "src/faraday/faraday.css",
  "src/faraday/runtime/index.ts",
  "src/faraday/blocks/index.ts",
  "src/faraday/ui/button.tsx",
  ".faraday-manifest.json",
];

const missing = [];
for (const rel of required) {
  try {
    await fs.stat(path.join(process.cwd(), rel));
  } catch {
    missing.push(rel);
  }
}

if (missing.length) {
  console.error("check-structure: missing required files:\n" + missing.map((m) => "  " + m).join("\n"));
  process.exit(3);
}
console.log("check-structure: ok — lesson layout intact");
