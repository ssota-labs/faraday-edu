// The scaffold pipeline (centralized-kit model). The generated lesson does NOT
// vendor the Faraday layer — it depends on the versioned `@faraday-academy/*`
// packages and pins them exactly, so the kit updates centrally via
// `faraday upgrade` instead of being copied + hash-locked into every lesson.
// The starter template already imports the kit as `@faraday-academy/kit/*`; the only
// generation-time work is injecting the package name/title and writing
// provenance. No file copying into a protected tree, no integrity manifest.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyDirectory, assertDirectory, isEffectivelyEmpty } from "./copy.mjs";
import { sanitizePackageName, normalizeTitle } from "./pkg.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLE_PLACEHOLDER = "Faraday Lesson";

function sourcePaths(root = PACKAGE_ROOT) {
  return {
    starter: path.join(root, "templates", "starter"),
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
 * @param {boolean} [opts.threeD]  (addon — deferred to Phase 5)
 * @param {boolean} [opts.physics] (addon — deferred to Phase 5)
 * @param {boolean} [opts.tutor]   (addon — deferred to Phase 5)
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false, threeD = false, physics = false, tutor = false } = opts;

  // Addons vendored their block into the (now-removed) protected tree, so they
  // need repackaging as `@faraday-academy/three` / `@faraday-academy/tutor` before they
  // work in the centralized model. Fail loudly rather than emit a broken lesson.
  if (threeD || physics || tutor) {
    const err = new Error(
      "--3d/--physics/--tutor are being repackaged as @faraday-academy/* addon packages and are temporarily unavailable in the centralized kit. Scaffold a 2D lesson for now.",
    );
    err.exitCode = 2;
    throw err;
  }

  const src = sourcePaths(opts.templateRoot);
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(src.starter, "starter template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`Target directory is not empty: ${targetDir} (use --overwrite)`);
    err.exitCode = 2;
    throw err;
  }

  const packageName = sanitizePackageName(name);
  const title = normalizeTitle(name);

  // 1. app shell -> project root (this already consumes @faraday-academy/kit)
  await copyDirectory(src.starter, targetDir);

  // 2. npm strips .gitignore from published packages, so the template ships it
  //    as dotless "gitignore"; restore the real name at generation time.
  const dotless = path.join(targetDir, "gitignore");
  try {
    await fs.rename(dotless, path.join(targetDir, ".gitignore"));
  } catch {
    /* template may already use .gitignore in dev */
  }

  // 3. inject package name
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.name = packageName;
  pkg.private = true;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 4. inject display title into the HTML shell
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);

  // 5. provenance (VCS-tracked identity; records the kit line it was created with)
  await fs.mkdir(path.join(targetDir, ".faraday"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".faraday", "provenance.json"),
    JSON.stringify(
      { lessonId: uuid(), createdWith: "faraday@0.1.0", template: "starter@0.1.0", kit: "@faraday-academy/kit@0.1.0", name: packageName },
      null,
      2,
    ) + "\n",
  );

  return { targetDir, packageName, title };
}
