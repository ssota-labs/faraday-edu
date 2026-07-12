// The scaffold pipeline (centralized-runtime model). The generated lesson does
// NOT vendor the Faraday layer — it depends on the versioned @faraday-academy/*
// packages and pins them exactly, so the runtime updates centrally via
// `faraday upgrade` instead of being copied + hash-locked into every lesson.
//
// This file only stamps the *plain* starter (app shell + name/title + provenance)
// plus the default packs. Every *capability* — 3D, physics, the AI tutor, and the
// rest — is a **module pack** you add with `faraday pack add <name>` when the
// lesson needs it. There are no capability flags on `faraday new`: the agent maps
// the creator's intent ("a 3D orbit lesson") to the right pack, uniformly, for all
// packs — three/tutor aren't special-cased.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyDirectory, assertDirectory, isEffectivelyEmpty } from "./copy.mjs";
import { sanitizePackageName, normalizeTitle } from "./pkg.mjs";
import { installPack, defaultPackNames } from "./pack.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TITLE_PLACEHOLDER = "Faraday Lesson";

// Seed for .faraday/plan/index.md — the app's build-plan folder. One folder per
// curriculum plan; the orchestrator fills these in during the Curriculum phase.
const PLAN_INDEX_STUB = `# Build plans

This app's curriculum build plans live here — **one folder per plan** (an app can
hold several, e.g. different tracks or audiences):

    <plan-id>/
      overview.md      # brief · audience · methodology · pack decisions · node index
      nodes/
        <id>.md        # one file per lesson node: brief + status (todo→building→verified)

Each lesson node is authored as its own file at \`src/lesson/nodes/<id>.tsx\` and
assembled into the module-scope \`curriculum\` in \`src/lesson/lesson.tsx\`. This keeps
lessons file-isolated so they can be built independently (e.g. one sub-agent per node).

See \`references/orchestration.md\` in the faraday skill for the build loop.

_No plans yet — create one when you design a curriculum._
`;

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
 * @param {boolean} [opts.noDefaults] skip auto-installing the default packs
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false } = opts;
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

  // 5. provenance (VCS-tracked identity). installPack (step 6) appends the
  //    resolved pack tags to `packs` as capabilities are added.
  await fs.mkdir(path.join(targetDir, ".faraday"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".faraday", "provenance.json"),
    JSON.stringify(
      { lessonId: uuid(), createdWith: "faraday@0.1.0", template: "starter@0.1.0", runtime: "@faraday-academy/runtime@0.1.0", packs: [], name: packageName },
      null,
      2,
    ) + "\n",
  );

  // 5b. plan folder — where curriculum build plans live (one folder per plan).
  //     The orchestrator writes overview.md + nodes/<id>.md here and keeps them as
  //     the resumable source of truth while authoring a multi-lesson curriculum.
  //     See references/orchestration.md in the faraday skill.
  await fs.mkdir(path.join(targetDir, ".faraday", "plan"), { recursive: true });
  await fs.writeFile(path.join(targetDir, ".faraday", "plan", "index.md"), PLAN_INDEX_STUB);

  // 6. default packs — skill-only knowledge (pedagogy, audience) every lesson gets
  //    so the agent has it in .faraday/packs/ and it travels with the lesson.
  //    Opt out with --no-defaults.
  if (!opts.noDefaults) {
    for (const dn of await defaultPackNames(opts.templateRoot)) {
      await installPack(dn, { fromDir: targetDir, templateRoot: opts.templateRoot });
    }
  }

  return { targetDir, packageName, title };
}
