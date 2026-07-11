// The scaffold pipeline (centralized-kit model). The generated lesson does NOT
// vendor the Faraday layer — it depends on the versioned `@faraday-academy/*`
// packages and pins them exactly, so the kit updates centrally via
// `faraday upgrade` instead of being copied + hash-locked into every lesson.
// The starter template already imports the kit as `@faraday-academy/kit/*`; the
// generation-time work is injecting the package name/title, wiring opt-in addon
// dependencies (3D/physics), and writing provenance. No integrity manifest.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyDirectory, assertDirectory, isEffectivelyEmpty } from "./copy.mjs";
import { sanitizePackageName, normalizeTitle } from "./pkg.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLE_PLACEHOLDER = "Faraday Lesson";

// Exact pin for the @faraday-academy/three addon (checked by `faraday doctor`).
const THREE_PIN = "0.1.0";
// R3F is a PEER of @faraday-academy/three: the lesson provides it directly so
// authored lesson code can `import { useFrame } from "@react-three/fiber"` etc.
// (ordinary external deps — caret ranges; `faraday upgrade` only moves the
// @faraday-academy pins).
const R3F_DEPS = {
  "@react-three/drei": "^10.0.0",
  "@react-three/fiber": "^9.0.0",
  three: "^0.171.0",
};
const R3F_DEV_DEPS = { "@types/three": "^0.171.0" };
// @react-three/rapier — only for --physics.
const RAPIER_RANGE = "^2.1.0";

function sourcePaths(root = PACKAGE_ROOT) {
  return {
    starter: path.join(root, "templates", "starter"),
    addon3d: path.join(root, "templates", "addon-3d"),
  };
}

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
 * @param {boolean} [opts.threeD]  add the @faraday-academy/three block + a 3D demo
 * @param {boolean} [opts.physics] like threeD, plus @react-three/rapier + a physics demo
 * @param {boolean} [opts.tutor]   (addon — deferred to a later phase)
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false, threeD = false, physics = false, tutor = false } = opts;
  const use3d = threeD || physics; // physics implies 3D

  // The tutor addon (durable Nitro + Workflow server) is still being repackaged.
  if (tutor) {
    const err = new Error(
      "--tutor is being repackaged as the @faraday-academy/tutor package and is temporarily unavailable. Scaffold without it for now.",
    );
    err.exitCode = 2;
    throw err;
  }

  const src = sourcePaths(opts.templateRoot);
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(src.starter, "starter template");
  if (use3d) await assertDirectory(src.addon3d, "3d addon template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`Target directory is not empty: ${targetDir} (use --overwrite)`);
    err.exitCode = 2;
    throw err;
  }

  const packageName = sanitizePackageName(name);
  const title = normalizeTitle(name);

  // 1. app shell -> project root (already consumes @faraday-academy/kit)
  await copyDirectory(src.starter, targetDir);

  // 2. npm strips .gitignore from published packages, so the template ships it
  //    as dotless "gitignore"; restore the real name at generation time.
  const dotless = path.join(targetDir, "gitignore");
  try {
    await fs.rename(dotless, path.join(targetDir, ".gitignore"));
  } catch {
    /* template may already use .gitignore in dev */
  }

  // 3. opt-in 3D: the three block is a DEPENDENCY (@faraday-academy/three), not
  //    vendored. Here we only drop in the 3D demo lesson, the model asset, the
  //    example lessons, and add the three stylesheet to the content scan.
  if (use3d) {
    await fs.copyFile(
      path.join(src.addon3d, physics ? "physics-lesson.tsx" : "lesson.tsx"),
      path.join(targetDir, "src", "lesson", "lesson.tsx"),
    );
    await fs.mkdir(path.join(targetDir, "public", "models"), { recursive: true });
    await fs.copyFile(
      path.join(src.addon3d, "assets", "fox.glb"),
      path.join(targetDir, "public", "models", "fox.glb"),
    );
    await copyDirectory(path.join(src.addon3d, "examples"), path.join(targetDir, "docs", "examples"));
    if (physics) {
      await copyDirectory(path.join(src.addon3d, "physics-extra", "examples"), path.join(targetDir, "docs", "examples"));
    }
    // the three block uses Tailwind utilities (Label3D overlay chips); its
    // stylesheet self-scans its own tsx, so pull it into the app content scan.
    await replaceInFile(
      path.join(targetDir, "src", "app.css"),
      '@import "@faraday-academy/kit/styles.css";',
      '@import "@faraday-academy/kit/styles.css";\n@import "@faraday-academy/three/styles.css";',
    );
  }

  // 4. inject package name (+ addon deps)
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.name = packageName;
  pkg.private = true;
  if (use3d) {
    pkg.dependencies["@faraday-academy/three"] = THREE_PIN;
    Object.assign(pkg.dependencies, R3F_DEPS);
    pkg.devDependencies = { ...pkg.devDependencies, ...R3F_DEV_DEPS };
  }
  if (physics) pkg.dependencies["@react-three/rapier"] = RAPIER_RANGE;
  if (use3d) {
    for (const group of ["dependencies", "devDependencies"]) {
      pkg[group] = Object.fromEntries(
        Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)),
      );
    }
  }
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 5. inject display title into the HTML shell
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);

  // 6. provenance (VCS-tracked identity; records the kit line + addons)
  const addons = [use3d && (physics ? "physics" : "3d")].filter(Boolean);
  await fs.mkdir(path.join(targetDir, ".faraday"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".faraday", "provenance.json"),
    JSON.stringify(
      {
        lessonId: uuid(),
        createdWith: "faraday@0.1.0",
        template: "starter@0.1.0",
        kit: "@faraday-academy/kit@0.1.0",
        addons,
        name: packageName,
      },
      null,
      2,
    ) + "\n",
  );

  return { targetDir, packageName, title };
}
