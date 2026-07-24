import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  assertDirectory,
  copyDirectory,
  isEffectivelyEmpty,
  pathExists,
  replaceInFile,
} from "./fs.mjs";
import { normalizeTitle, sanitizePackageName } from "./pkg.mjs";

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TITLE_PLACEHOLDER = "STEM Lesson";
const NAME_PLACEHOLDER = "stem-lesson";

function runInstall(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["install"], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm install failed (exit ${code}): ${stderr.slice(-500)}`));
    });
  });
}

/**
 * @param {object} opts
 * @param {string} opts.targetDir
 * @param {string} opts.name
 * @param {boolean} [opts.force]
 * @param {boolean} [opts.skipInstall]
 * @param {string} [opts.templateRoot]
 */
export async function scaffoldLesson(opts) {
  const { targetDir, name, force = false, skipInstall = false } = opts;
  const templateRoot = opts.templateRoot ?? path.join(SKILL_ROOT, "templates", "lesson");
  await assertDirectory(templateRoot, "lesson template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`target is not empty: ${targetDir} (pass --force to overwrite)`);
    err.code = "USAGE";
    throw err;
  }

  if (await pathExists(targetDir)) {
    // force: clear non-node_modules contents lightly by requiring empty or force mkdir
    await fs.mkdir(targetDir, { recursive: true });
  }

  await copyDirectory(templateRoot, targetDir);

  const pkgName = sanitizePackageName(name);
  const title = normalizeTitle(name);
  const base = path.basename(pkgName);

  await replaceInFile(path.join(targetDir, "package.json"), NAME_PLACEHOLDER, base);
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);
  await replaceInFile(path.join(targetDir, "src/App.tsx"), TITLE_PLACEHOLDER, title);
  await replaceInFile(path.join(targetDir, "README.md"), TITLE_PLACEHOLDER, title);

  const provenance = {
    skill: "3d-stem",
    template: "lesson",
    createdAt: new Date().toISOString(),
    name: base,
    title,
  };
  await fs.mkdir(path.join(targetDir, ".stem"), { recursive: true });
  await fs.writeFile(
    path.join(targetDir, ".stem/provenance.json"),
    `${JSON.stringify(provenance, null, 2)}\n`,
  );

  let installed = false;
  const skip =
    skipInstall ||
    process.env.FARADAY_SKIP_INSTALL === "1" ||
    process.env.STEM_SKIP_INSTALL === "1";
  if (!skip) {
    try {
      await runInstall(targetDir);
      installed = true;
    } catch (error) {
      const err = new Error(
        `scaffold wrote files but install failed: ${error instanceof Error ? error.message : error}`,
      );
      err.code = "ENV";
      err.result = {
        ok: false,
        dir: targetDir,
        name: base,
        title,
        installed: false,
      };
      throw err;
    }
  }

  return {
    ok: true,
    dir: targetDir,
    name: base,
    title,
    installed,
    next: installed
      ? [`cd ${targetDir}`, "pnpm dev"]
      : [`cd ${targetDir}`, "pnpm install", "pnpm dev"],
  };
}

export { SKILL_ROOT };
