#!/usr/bin/env node
/**
 * Emit shadcn-compatible registry JSON into public/r/.
 * Run from apps/ui (or via pnpm --filter @faraday-academy/edu-ui registry:build).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "r");
const SRC = path.join(ROOT, "src", "components", "param-control.tsx");

const source = await fs.readFile(SRC, "utf8");

const paramControlItem = {
  name: "param-control",
  type: "registry:ui",
  title: "Param Control",
  description:
    "Sparse HUD slider + readout for a single manipulable STEM parameter over a fullscreen 3D canvas.",
  dependencies: ["react"],
  files: [
    {
      path: "components/param-control.tsx",
      type: "registry:ui",
      content: source,
    },
  ],
};

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "faraday-edu",
  homepage: "https://github.com/ssota-labs/faraday-academy",
  items: [
    {
      name: paramControlItem.name,
      type: paramControlItem.type,
      title: paramControlItem.title,
      description: paramControlItem.description,
      dependencies: paramControlItem.dependencies,
      files: paramControlItem.files.map(({ path: p, type }) => ({ path: p, type })),
    },
  ],
};

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
await fs.writeFile(
  path.join(OUT, "param-control.json"),
  `${JSON.stringify(paramControlItem, null, 2)}\n`,
);
console.log("Wrote public/r/registry.json and public/r/param-control.json");
