#!/usr/bin/env node
/** Local fail-closed gate for a scaffolded 3d-stem lesson (no skill path required). */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED = [
  "package.json",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "src/main.tsx",
  "src/App.tsx",
  "src/scene/LessonScene.tsx",
  ".stem/provenance.json",
];

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

const problems = [];
for (const rel of REQUIRED) {
  if (!(await exists(path.join(ROOT, rel)))) problems.push(`missing required file: ${rel}`);
}

const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
for (const name of Object.keys(deps)) {
  if (name.startsWith("@faraday-academy/")) {
    problems.push(`forbidden product dependency: ${name}`);
  }
}
for (const need of ["react", "three", "@react-three/fiber", "vite"]) {
  if (!deps[need]) problems.push(`missing dependency: ${need}`);
}

const scene = await fs.readFile(path.join(ROOT, "src/scene/LessonScene.tsx"), "utf8").catch(() => "");
if (scene && !/Canvas|@react-three\/fiber|three/i.test(scene)) {
  problems.push("LessonScene.tsx does not look like a 3D/R3F scene");
}

const app = await fs.readFile(path.join(ROOT, "src/App.tsx"), "utf8").catch(() => "");
if (app && !/LessonScene/.test(app)) {
  problems.push("App.tsx must render LessonScene");
}

if (problems.length) {
  console.error("check failed:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("check ok");
