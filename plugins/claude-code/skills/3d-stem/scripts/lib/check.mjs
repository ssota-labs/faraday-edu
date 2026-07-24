import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "./fs.mjs";

export const REQUIRED_FILES = [
  "package.json",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "src/main.tsx",
  "src/App.tsx",
  "src/scene/LessonScene.tsx",
  ".stem/provenance.json",
];

const FORBIDDEN_SCOPES = ["@faraday-academy/"];

/**
 * @param {string} start
 */
export async function findLessonRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    const pkgPath = path.join(dir, "package.json");
    const stemPath = path.join(dir, ".stem/provenance.json");
    if ((await pathExists(pkgPath)) && (await pathExists(stemPath))) return dir;
    if (await pathExists(pkgPath)) {
      try {
        const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["@react-three/fiber"] || deps.three) return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * @param {string} root
 * @returns {Promise<string[]>}
 */
export async function collectFindings(root) {
  const problems = [];

  for (const rel of REQUIRED_FILES) {
    if (!(await pathExists(path.join(root, rel)))) {
      problems.push(`missing required file: ${rel}`);
    }
  }

  const pkgPath = path.join(root, "package.json");
  if (await pathExists(pkgPath)) {
    try {
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
      for (const group of ["dependencies", "devDependencies", "peerDependencies"]) {
        for (const name of Object.keys(pkg[group] ?? {})) {
          if (FORBIDDEN_SCOPES.some((s) => name.startsWith(s))) {
            problems.push(
              `forbidden product dependency: ${name} (use open stack + optional shadcn registry copy)`,
            );
          }
        }
      }
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const need of ["react", "three", "@react-three/fiber", "vite"]) {
        if (!deps[need]) problems.push(`missing dependency: ${need}`);
      }
    } catch {
      problems.push("package.json is not valid JSON");
    }
  }

  const scenePath = path.join(root, "src/scene/LessonScene.tsx");
  if (await pathExists(scenePath)) {
    const scene = await fs.readFile(scenePath, "utf8");
    if (!/Canvas|@react-three\/fiber|three/i.test(scene)) {
      problems.push("LessonScene.tsx does not look like a 3D/R3F scene");
    }
  }

  const appPath = path.join(root, "src/App.tsx");
  if (await pathExists(appPath)) {
    const app = await fs.readFile(appPath, "utf8");
    if (!/LessonScene/.test(app)) {
      problems.push("App.tsx must render LessonScene (fullscreen 3D surface)");
    }
  }

  const provPath = path.join(root, ".stem/provenance.json");
  if (await pathExists(provPath)) {
    try {
      const prov = JSON.parse(await fs.readFile(provPath, "utf8"));
      if (prov.skill !== "3d-stem") {
        problems.push(`.stem/provenance.json skill must be "3d-stem" (got ${JSON.stringify(prov.skill)})`);
      }
    } catch {
      problems.push(".stem/provenance.json is not valid JSON");
    }
  }

  return problems;
}
