// Lesson health checks, shared by `faraday check` (shallow) and `faraday doctor`
// (deep). In the centralized model there is no vendored tree to hash — a healthy
// lesson is one whose layout is intact and whose @faraday-academy/* deps are
// pinned exactly. `doctor` additionally requires an installed, lockfile-backed
// state so it can gate `faraday upgrade`.
import path from "node:path";
import fs from "node:fs/promises";

export const KIT_SCOPE = "@faraday-academy/";

export const REQUIRED_FILES = [
  "package.json",
  ".faraday/provenance.json",
];

const VINEXT_FILES = [
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "src/lesson/lesson.tsx",
];

export async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

/** A lesson root is the nearest ancestor whose package.json depends on the runtime. */
export async function findLessonRoot(start) {
  let dir = start;
  for (;;) {
    const pkgPath = path.join(dir, "package.json");
    if (await exists(pkgPath)) {
      try {
        const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
        if (managedDeps(pkg).length > 0) return dir;
      } catch {
        /* unreadable package.json — keep walking up */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** All @faraday-academy/* deps with their group + specifier. */
export function managedDeps(pkg) {
  const out = [];
  for (const group of ["dependencies", "devDependencies"]) {
    for (const [name, spec] of Object.entries(pkg?.[group] ?? {})) {
      if (name.startsWith(KIT_SCOPE)) out.push({ name, group, spec });
    }
  }
  return out;
}

function isExactPin(spec) {
  // exact = a bare version (no ^/~/x-range/*, no protocol like workspace:).
  return /^\d+\.\d+\.\d+/.test(spec);
}

/**
 * Collect health problems for the lesson at `root`. Returns string[] (empty = ok).
 * @param {string} root
 * @param {{ deep?: boolean }} [opts]  deep also requires a lockfile (installed state)
 */
export async function collectFindings(root, { deep = false } = {}) {
  const problems = [];

  for (const rel of REQUIRED_FILES) {
    if (!(await exists(path.join(root, rel)))) problems.push(`missing required file: ${rel}`);
  }

  try {
    const provenance = JSON.parse(
      await fs.readFile(path.join(root, ".faraday/provenance.json"), "utf8"),
    );
    if (String(provenance.template ?? "").startsWith("vinext-starter")) {
      for (const rel of VINEXT_FILES) {
        if (!(await exists(path.join(root, rel)))) problems.push(`missing required file: ${rel}`);
      }
    }
  } catch {
    // The required-file finding above reports missing/unreadable provenance.
  }

  let pkg;
  try {
    pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  } catch {
    problems.push("package.json is missing or unreadable");
    return problems;
  }

  const managed = managedDeps(pkg);
  const runtime = managed.find((d) => d.name === "@faraday-academy/kit");
  if (!runtime) {
    problems.push("@faraday-academy/kit is not a dependency");
  }
  if (!managed.some((d) => d.name === "@faraday-academy/ui")) {
    problems.push("@faraday-academy/ui is not a dependency");
  }
  for (const d of managed) {
    if (!isExactPin(d.spec)) {
      problems.push(`${d.name} must be pinned to an exact version, found "${d.spec}"`);
    }
  }

  if (deep) {
    if (!(await exists(path.join(root, "pnpm-lock.yaml")))) {
      problems.push("no pnpm-lock.yaml — run `pnpm install` so the pinned runtime is locked");
    }
  }

  return problems;
}
