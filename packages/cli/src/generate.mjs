// The scaffold pipeline (centralized-runtime model). The generated lesson does
// NOT vendor the Faraday layer — it depends on the versioned @faraday-academy/*
// packages and pins them exactly, so the runtime updates centrally via
// `faraday upgrade` instead of being copied + hash-locked into every lesson.
//
// This file now only stamps the *plain* starter (app shell + name/title +
// provenance). Every capability — 3D, physics, the AI tutor — is a **module
// pack** applied through the shared installer in pack.mjs. The `--3d`/`--physics`/
// `--tutor` flags on `faraday new` are thin aliases that call `installPack(...)`
// with `scaffold: true` so a fresh lesson also gets the pack's demo; the exact
// same code path runs when you `faraday pack add` later.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyDirectory, assertDirectory, isEffectivelyEmpty } from "./copy.mjs";
import { sanitizePackageName, normalizeTitle } from "./pkg.mjs";
import { installPack, defaultPackNames } from "./pack.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLE_PLACEHOLDER = "Faraday Lesson";

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
 * @param {boolean} [opts.threeD]  alias for the `three` pack
 * @param {boolean} [opts.physics] alias for the `three` pack (physics variant)
 * @param {boolean} [opts.tutor]   alias for the `tutor` pack
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false, threeD = false, physics = false, tutor = false } = opts;
  const use3d = threeD || physics; // physics implies 3D
  const templateRoot = opts.templateRoot ?? PACKAGE_ROOT;
  const starter = path.join(templateRoot, "templates", "starter");
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(starter, "starter template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`Target directory is not empty: ${targetDir} (use --overwrite)`);
    err.exitCode = 2;
    throw err;
  }

  const packageName = sanitizePackageName(name);
  const title = normalizeTitle(name);

  // 1. app shell -> project root (already consumes @faraday-academy/runtime)
  await copyDirectory(starter, targetDir);

  // 2. npm strips .gitignore from published packages, so the template ships it
  //    as dotless "gitignore"; restore the real name at generation time.
  const dotless = path.join(targetDir, "gitignore");
  try {
    await fs.rename(dotless, path.join(targetDir, ".gitignore"));
  } catch {
    /* template may already use .gitignore in dev */
  }

  // 3. inject package name + privacy
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.name = packageName;
  pkg.private = true;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 4. inject display title into the HTML shell
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);

  // 5. provenance (VCS-tracked identity; records the runtime line + addon flags).
  //    installPack (step 6) appends the resolved pack tags to `packs`.
  const addons = [use3d && (physics ? "physics" : "3d"), tutor && "tutor"].filter(Boolean);
  await fs.mkdir(path.join(targetDir, ".faraday"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".faraday", "provenance.json"),
    JSON.stringify(
      { lessonId: uuid(), createdWith: "faraday@0.1.0", template: "starter@0.1.0", runtime: "@faraday-academy/runtime@0.1.0", addons, name: packageName },
      null,
      2,
    ) + "\n",
  );

  // 6. addon flags -> module packs (deps, css, file copies, skill guide, demo).
  //    scaffold:true stamps each pack's new-lesson demo — the same installer runs
  //    for a later `faraday pack add`, minus the scaffold.
  if (use3d) {
    await installPack("three", {
      fromDir: targetDir,
      variant: physics ? "physics" : null,
      scaffold: true,
      templateRoot: opts.templateRoot,
    });
  }
  if (tutor) {
    await installPack("tutor", { fromDir: targetDir, scaffold: true, templateRoot: opts.templateRoot });
  }

  // 7. default packs — skill-only knowledge (pedagogy, audience) every lesson gets
  //    so the agent has it in .faraday/packs/ and it travels with the lesson.
  //    Opt out with --no-defaults.
  if (!opts.noDefaults) {
    for (const dn of await defaultPackNames(opts.templateRoot)) {
      await installPack(dn, { fromDir: targetDir, templateRoot: opts.templateRoot });
    }
  }

  return { targetDir, packageName, title };
}
