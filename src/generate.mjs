// The scaffold pipeline. Self-contained vendoring (toolcraft-style): the whole
// Faraday layer (shadcn ui + blocks + runtime + styles + lib) is copied INTO the
// generated app under src/faraday/**, then locked with a SHA-256 manifest. No
// import rewriting is needed — the templates already reference the vendored code
// via the "@/faraday/*" path alias the generated tsconfig/vite config provide.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyDirectory, assertDirectory, isEffectivelyEmpty } from "./copy.mjs";
import { writeManifest } from "./manifest.mjs";
import { sanitizePackageName, normalizeTitle } from "./pkg.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLE_PLACEHOLDER = "Faraday Lesson";

function sourcePaths(root = PACKAGE_ROOT) {
  return {
    starter: path.join(root, "templates", "starter"),
    faraday: path.join(root, "templates", "faraday"),
    addon3d: path.join(root, "templates", "addon-3d"),
  };
}

// Deps added only for `--3d` lessons, so 2D lessons never install three.
const THREE_DEPS = {
  dependencies: {
    "@react-three/drei": "^10.0.0",
    "@react-three/fiber": "^9.0.0",
    three: "^0.171.0",
  },
  devDependencies: { "@types/three": "^0.171.0" },
};

// Physics engine — only for `--physics` lessons (implies 3D).
const RAPIER_DEP = { "@react-three/rapier": "^2.1.0" };

async function replaceInFile(file, from, to) {
  const text = await fs.readFile(file, "utf8");
  if (!text.includes(from)) return false;
  await fs.writeFile(file, text.split(from).join(to));
  return true;
}

/**
 * @param {object} opts
 * @param {string} opts.targetDir  absolute path to create the lesson in
 * @param {string} opts.name       raw user name (for package name + title)
 * @param {boolean} [opts.force]   allow a non-empty target
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false, threeD = false, physics = false } = opts;
  const use3d = threeD || physics; // physics implies 3D
  const src = sourcePaths(opts.templateRoot);
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(src.starter, "starter template");
  await assertDirectory(src.faraday, "faraday template");
  if (use3d) await assertDirectory(src.addon3d, "3d addon template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`Target directory is not empty: ${targetDir} (use --overwrite)`);
    err.exitCode = 2;
    throw err;
  }

  const packageName = sanitizePackageName(name);
  const title = normalizeTitle(name);

  // 1. app shell -> project root
  await copyDirectory(src.starter, targetDir);

  // 2. npm strips .gitignore from published packages, so the template ships it
  //    as dotless "gitignore"; restore the real name at generation time.
  const dotless = path.join(targetDir, "gitignore");
  try {
    await fs.rename(dotless, path.join(targetDir, ".gitignore"));
  } catch {
    /* template may already use .gitignore in dev */
  }

  // 3. vendor the Faraday layer into the protected tree
  const protectedDir = path.join(targetDir, "src", "faraday");
  await fs.rm(protectedDir, { recursive: true, force: true });
  await copyDirectory(src.faraday, protectedDir);

  // 3b. opt-in 3D: vendor the three block + swap in the demo lesson (physics or
  //     space), drop the example lessons in docs/, and copy assets to public/.
  if (use3d) {
    await copyDirectory(path.join(src.addon3d, "three"), path.join(protectedDir, "three"));
    await fs.copyFile(
      path.join(src.addon3d, physics ? "physics-lesson.tsx" : "lesson.tsx"),
      path.join(targetDir, "src", "lesson", "lesson.tsx"),
    );
    await copyDirectory(path.join(src.addon3d, "examples"), path.join(targetDir, "docs", "examples"));
    await copyDirectory(path.join(src.addon3d, "assets"), path.join(targetDir, "public", "models"));
    // physics-only extras (need @react-three/rapier): the walkable RPG world pack.
    if (physics) {
      await copyDirectory(path.join(src.addon3d, "physics-extra", "three"), path.join(protectedDir, "three"));
      await copyDirectory(path.join(src.addon3d, "physics-extra", "examples"), path.join(targetDir, "docs", "examples"));
    }
  }

  // 4. inject package name (+ three deps for 3D lessons)
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.name = packageName;
  pkg.private = true;
  if (use3d) {
    pkg.dependencies = { ...pkg.dependencies, ...THREE_DEPS.dependencies };
    pkg.devDependencies = { ...pkg.devDependencies, ...THREE_DEPS.devDependencies };
    if (physics) pkg.dependencies = { ...pkg.dependencies, ...RAPIER_DEP };
    // keep dependency keys sorted (matches the rest of the template)
    for (const group of ["dependencies", "devDependencies"]) {
      pkg[group] = Object.fromEntries(Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)));
    }
  }
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 5. inject display title into the HTML shell
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);

  // 6. provenance (VCS-tracked identity)
  await fs.mkdir(path.join(targetDir, ".faraday"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".faraday", "provenance.json"),
    JSON.stringify(
      { lessonId: uuid(), createdWith: "faraday@0.1.0", template: "starter@0.1.0", name: packageName },
      null,
      2,
    ) + "\n",
  );

  // 7. integrity manifest over the protected tree (LAST — records final bytes)
  const manifest = await writeManifest(targetDir, protectedDir, "src/faraday");

  return {
    targetDir,
    packageName,
    title,
    protectedFiles: Object.keys(manifest.files).length,
  };
}
