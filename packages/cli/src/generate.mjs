// The scaffold pipeline (centralized-runtime model). The generated lesson does
// NOT vendor the Faraday layer — it depends on the versioned @faraday-academy/*
// packages and pins them exactly, so the runtime updates centrally via
// `faraday upgrade` instead of being copied + hash-locked into every lesson.
// The starter template already imports the runtime as `@faraday-academy/runtime/*`;
// generation-time work is injecting the package name/title, wiring opt-in addon
// dependencies, and writing provenance. No integrity manifest.
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
// authored 3D code can `import { useFrame } from "@react-three/fiber"` etc.
const R3F_DEPS = {
  "@react-three/drei": "^10.0.0",
  "@react-three/fiber": "^9.0.0",
  three: "^0.171.0",
};
const R3F_DEV_DEPS = { "@types/three": "^0.171.0" };
// @react-three/rapier — only for --physics.
const RAPIER_RANGE = "^2.1.0";

// The tutor addon: the <Tutor> widget is the pinned @faraday-academy/tutor
// package, but the durable Nitro + Workflow SERVER is copied into the lesson as
// author-editable files (api/ + workflows/) — the author tunes persona/grounding
// there. So the lesson also gets the server-side deps directly.
const TUTOR_PIN = "0.1.0";
const TUTOR_SERVER_DEPS = {
  "@ai-sdk/workflow": "^1.0.11",
  ai: "^7.0.11",
  // stable nitro 3.0.0 is deprecated + predates the serverDir config the Workflow
  // SDK's Vite guide needs, so pin the current beta (what `latest` resolves to).
  nitro: "3.0.260610-beta",
  workflow: "^4.5.0",
  zod: "^4.0.0",
};

function sourcePaths(root = PACKAGE_ROOT) {
  return {
    starter: path.join(root, "templates", "starter"),
    addon3d: path.join(root, "templates", "addon-3d"),
    addonTutor: path.join(root, "templates", "addon-tutor"),
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
 * @param {boolean} [opts.threeD]  (addon — packaged in a later step)
 * @param {boolean} [opts.physics] (addon — packaged in a later step)
 * @param {boolean} [opts.tutor]   (addon — packaged in a later step)
 * @param {string} [opts.templateRoot] override package root (tests)
 * @param {() => string} [opts.uuid]   injectable id generator (tests)
 */
export async function generateLesson(opts) {
  const { targetDir, name, force = false, threeD = false, physics = false, tutor = false } = opts;
  const use3d = threeD || physics; // physics implies 3D

  const src = sourcePaths(opts.templateRoot);
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(src.starter, "starter template");
  if (use3d) await assertDirectory(src.addon3d, "3d addon template");
  if (tutor) await assertDirectory(src.addonTutor, "tutor addon template");

  if (!force && !(await isEffectivelyEmpty(targetDir))) {
    const err = new Error(`Target directory is not empty: ${targetDir} (use --overwrite)`);
    err.exitCode = 2;
    throw err;
  }

  const packageName = sanitizePackageName(name);
  const title = normalizeTitle(name);

  // 1. app shell -> project root (already consumes @faraday-academy/runtime)
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
  //    vendored. Drop in the 3D demo lesson, the model asset, the example lessons,
  //    and add the three stylesheet to the content scan.
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
    await replaceInFile(
      path.join(targetDir, "src", "app.css"),
      '@import "@faraday-academy/runtime/styles.css";',
      '@import "@faraday-academy/runtime/styles.css";\n@import "@faraday-academy/three/styles.css";',
    );
  }

  // 3b. opt-in tutor: the <Tutor> widget is the pinned @faraday-academy/tutor
  //     package, but the durable server is AUTHOR-EDITABLE — copy api/ + workflows/
  //     + the Vite+Nitro config into the lesson tree so the author can tune the
  //     persona/grounding. This is the one addon that makes the lesson server-backed.
  if (tutor) {
    await copyDirectory(path.join(src.addonTutor, "api"), path.join(targetDir, "api"));
    await copyDirectory(path.join(src.addonTutor, "workflows"), path.join(targetDir, "workflows"));
    await fs.copyFile(path.join(src.addonTutor, "vite.config.ts"), path.join(targetDir, "vite.config.ts"));
    await fs.copyFile(path.join(src.addonTutor, "tsconfig.node.json"), path.join(targetDir, "tsconfig.node.json"));
    await fs.copyFile(path.join(src.addonTutor, "env.example"), path.join(targetDir, "env.example"));
    await fs.copyFile(path.join(src.addonTutor, "docs", "tutor.md"), path.join(targetDir, "docs", "tutor.md"));
    await copyDirectory(path.join(src.addonTutor, "examples"), path.join(targetDir, "docs", "examples"));
    await replaceInFile(
      path.join(targetDir, "src", "app.css"),
      '@import "@faraday-academy/runtime/styles.css";',
      '@import "@faraday-academy/runtime/styles.css";\n@import "@faraday-academy/tutor/styles.css";',
    );
    // The Workflow step bundler (esbuild) mis-resolves ajv's dynamic require through
    // pnpm's nested .pnpm store, 500-ing the model step in dev. A flat node_modules
    // fixes it. Tutor-only; non-tutor lessons keep pnpm's strict isolation.
    await fs.appendFile(
      path.join(targetDir, "pnpm-workspace.yaml"),
      "\n# Tutor: flatten node_modules so the Workflow step bundler resolves ajv's\n" +
        "# dynamic requires in dev (nested .pnpm paths otherwise 500 the model step).\n" +
        "nodeLinker: hoisted\n",
    );
    const tutorPointer =
      '\n> **AI Tutor:** scaffolded with `--tutor`. Embed `<Tutor context={…} />` from ' +
      '`@faraday-academy/tutor`; the durable server lives in author-editable `api/` + ' +
      '`workflows/tutor-agent.ts`. Needs `AI_GATEWAY_API_KEY` (see `env.example`). ' +
      'Guide: [docs/tutor.md](docs/tutor.md).\n';
    for (const doc of ["docs/authoring.md", "AGENTS.md"]) {
      await fs.appendFile(path.join(targetDir, doc), tutorPointer).catch(() => {});
    }
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
  if (tutor) {
    pkg.dependencies["@faraday-academy/tutor"] = TUTOR_PIN;
    Object.assign(pkg.dependencies, TUTOR_SERVER_DEPS);
  }
  if (use3d || tutor) {
    for (const group of ["dependencies", "devDependencies"]) {
      if (!pkg[group]) continue;
      pkg[group] = Object.fromEntries(Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)));
    }
  }
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 5. inject display title into the HTML shell
  await replaceInFile(path.join(targetDir, "index.html"), TITLE_PLACEHOLDER, title);

  // 6. provenance (VCS-tracked identity; records the runtime line + addons)
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

  return { targetDir, packageName, title };
}
