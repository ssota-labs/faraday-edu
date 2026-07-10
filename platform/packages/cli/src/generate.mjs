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

// The Faraday runtime layer lives in a sibling workspace package
// (@faraday/runtime) and is still vendored (copied + SHA-locked) into generated
// apps — it is a first-class package, not an installed dependency. The starter +
// addon scaffolding assets stay CLI-owned under this package's templates/.
const RUNTIME_ROOT = path.resolve(PACKAGE_ROOT, "..", "runtime");

function sourcePaths(root = PACKAGE_ROOT, runtimeRoot = RUNTIME_ROOT) {
  return {
    starter: path.join(root, "templates", "starter"),
    faraday: runtimeRoot,
    addon3d: path.join(root, "templates", "addon-3d"),
    addonTutor: path.join(root, "templates", "addon-tutor"),
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

// Deps added only for `--tutor` lessons — the durable AI tutor turns the static
// Vite app into a Vite + Nitro + Workflow hybrid (server-backed). Versions pinned
// to the mirror-dimension reference install (ai@7 / @ai-sdk/workflow@1 / workflow@4.5).
const TUTOR_DEPS = {
  dependencies: {
    "@ai-sdk/react": "^4.0.12",
    "@ai-sdk/workflow": "^1.0.11",
    ai: "^7.0.11",
    // Chat UI: the tutor docks beside the lesson (react-resizable-panels), uses the
    // canonical shadcn MessageScroller (@shadcn/react), and renders the assistant's
    // Markdown + KaTeX math via Streamdown (@streamdown/math for the math plugin).
    // @base-ui/react + katex are already core deps (shadcn base UI + the TeX block).
    "@shadcn/react": "^0.2.1",
    "@streamdown/math": "^1.0.2",
    "react-resizable-panels": "^4.12.1",
    streamdown: "^2.5.0",
    // Nitro serves the api/ routes + provides `nitro/vite`. The stable 3.0.0 is
    // deprecated AND predates the `serverDir` config the Workflow SDK's Vite guide
    // requires, so we pin the current beta (what `latest` resolves to and what the
    // workflow docs target). Bump when a stable 3.0.x ships with serverDir.
    nitro: "3.0.260610-beta",
    workflow: "^4.5.0",
    zod: "^4.0.0",
  },
};

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
  const { targetDir, name, force = false, threeD = false, physics = false, tutor = false } = opts;
  const use3d = threeD || physics; // physics implies 3D
  const src = sourcePaths(opts.templateRoot);
  const uuid = opts.uuid ?? (() => crypto.randomUUID());

  await assertDirectory(src.starter, "starter template");
  await assertDirectory(src.faraday, "faraday template");
  if (use3d) await assertDirectory(src.addon3d, "3d addon template");
  if (tutor) await assertDirectory(src.addonTutor, "tutor addon template");

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
  // The runtime package's own manifest (@faraday/runtime) is a workspace artifact
  // — deps declared only so the monorepo can typecheck/preview it. It must never
  // ship inside the vendored src/faraday/ tree.
  await fs.rm(path.join(protectedDir, "package.json"), { force: true });

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

  // 3c. opt-in tutor: this is the one addon that makes the app server-backed. It
  //     vendors the chat UI into the locked tree, drops the durable workflow +
  //     Nitro api routes at the project root (author-editable), swaps in the
  //     Vite+Nitro+Workflow config, and ships an env template + example lesson.
  if (tutor) {
    await copyDirectory(path.join(src.addonTutor, "faraday", "tutor"), path.join(protectedDir, "tutor"));
    await copyDirectory(path.join(src.addonTutor, "api"), path.join(targetDir, "api"));
    await copyDirectory(path.join(src.addonTutor, "workflows"), path.join(targetDir, "workflows"));
    await copyDirectory(path.join(src.addonTutor, "examples"), path.join(targetDir, "docs", "examples"));
    // discoverability: ship a focused tutor guide + point the docs an author reads at it
    await fs.copyFile(path.join(src.addonTutor, "docs", "tutor.md"), path.join(targetDir, "docs", "tutor.md"));
    const tutorPointer = "\n> **AI Tutor:** this project was scaffolded with `--tutor` — embed `<Tutor>` from `@/faraday/tutor`. See [docs/tutor.md](docs/tutor.md) and [docs/examples/tutor.tsx](docs/examples/tutor.tsx).\n";
    for (const doc of ["docs/authoring.md", "AGENTS.md"]) {
      await fs.appendFile(path.join(targetDir, doc), tutorPointer).catch(() => {});
    }
    await fs.copyFile(path.join(src.addonTutor, "vite.config.ts"), path.join(targetDir, "vite.config.ts"));
    await fs.copyFile(path.join(src.addonTutor, "env.example"), path.join(targetDir, "env.example"));
    // widen the node tsconfig so `tsc -b` also typechecks the api/ + workflows/ server files
    await fs.copyFile(path.join(src.addonTutor, "tsconfig.node.json"), path.join(targetDir, "tsconfig.node.json"));
    // CRITICAL for tutor dev: the Workflow DevKit's step bundler (esbuild) mis-externalizes
    // ajv's internal `require("./core.js")` when it resolves through pnpm's nested `.pnpm`
    // store, so `pnpm dev` 500s on every model step ("Dynamic require ... is not supported").
    // A flat (hoisted) node_modules makes ajv's relative requires resolve + bundle cleanly.
    // Tutor-only — non-tutor lessons keep pnpm's strict isolation. (prod `vite build` is fine
    // either way; this is a dev-server fix.)
    await fs.appendFile(
      path.join(targetDir, "pnpm-workspace.yaml"),
      "\n# Tutor: flatten node_modules so the Workflow step bundler resolves ajv's\n" +
        "# dynamic requires in dev (nested .pnpm paths otherwise 500 the model step).\n" +
        "nodeLinker: hoisted\n",
    );
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
  }
  if (tutor) {
    pkg.dependencies = { ...pkg.dependencies, ...TUTOR_DEPS.dependencies };
  }
  if (use3d || tutor) {
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
