// Module packs: install a self-contained pack (runtime half + skill half) into an
// existing lesson. This generalizes the hardcoded `--3d`/`--tutor` addon logic in
// generate.mjs into a declarative, manifest-driven flow. A pack lives at
// `packs/<name>/pack.json` (shipped with the CLI); `faraday pack add <name>` pins
// its runtime deps, wires CSS, copies files, and installs its skill reference +
// an AGENTS.md pointer so the agent knows the pack is available.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import cp from "node:child_process";
import { fileURLToPath } from "node:url";
import { copyDirectory, pathExists } from "./copy.mjs";
import { findLessonRoot } from "./doctor.mjs";

const execFileP = (cmd, args, opts) =>
  new Promise((resolve, reject) => {
    cp.execFile(cmd, args, { ...opts }, (err, stdout, stderr) =>
      err ? reject(Object.assign(err, { stderr })) : resolve({ stdout, stderr }),
    );
  });

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Deprecated pack names → current official name. */
const PACK_ALIASES = { deck: "slide-view" };

// Where the CLI finds the OFFICIAL packs, in priority order:
//   1. `<repo>/packages/official-packs` — the source of truth in the workspace (dev)
//   2. `<cli>/packs`                    — bundled copy (published tarball)
// Source first so dev edits are always live; the bundle step (scripts/bundle-packs.mjs)
// copies the source into (2) at `prepack`, and a published CLI (where the source is not
// present) transparently falls back to the bundled copy.
function packsRootCandidates(root = PACKAGE_ROOT) {
  return [path.resolve(root, "..", "official-packs"), path.join(root, "packs")];
}

/** First existing official-packs directory, or the bundled path as a fallback. */
export async function packsRoot(root = PACKAGE_ROOT) {
  const candidates = packsRootCandidates(root);
  for (const dir of candidates) {
    if (await pathExists(dir)) return dir;
  }
  return candidates[0];
}

async function readManifestJson(manifestPath) {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {
    return null; // malformed manifest — skip in listing
  }
}

/**
 * All packs shipped with the CLI: [{ name, category, ...manifest }].
 *
 * Official packs are organised into category folders — `<root>/<category>/<name>/`
 * — so two categories can hold same-named packs. The category is derived from the
 * parent folder. A pack.json placed directly at `<root>/<name>/` (flat) still works
 * and takes its category from the manifest field, if any.
 */
export async function listPacks(root = PACKAGE_ROOT) {
  const dir = await packsRoot(root);
  if (!(await pathExists(dir))) return [];
  const packs = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const entryDir = path.join(dir, entry.name);
    // flat pack: pack.json directly under the root
    if (await pathExists(path.join(entryDir, "pack.json"))) {
      const m = await readManifestJson(path.join(entryDir, "pack.json"));
      if (m) packs.push({ name: entry.name, ...m });
      continue;
    }
    // otherwise a category folder: each child dir with a pack.json is a pack,
    // and its category is this folder's name (authoritative over any field).
    for (const child of await fs.readdir(entryDir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue;
      const manifestPath = path.join(entryDir, child.name, "pack.json");
      if (!(await pathExists(manifestPath))) continue;
      const m = await readManifestJson(manifestPath);
      if (m) packs.push({ name: child.name, ...m, category: entry.name });
    }
  }
  return packs.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Locate an official pack by a bare name (`three`) or a category-qualified name
 * (`runtime/three`). Returns { name, packDir, category } or null. Throws (exit 2)
 * if a bare name is ambiguous across categories.
 */
export async function findOfficialPackDir(source, root = PACKAGE_ROOT) {
  source = PACK_ALIASES[source] ?? source;
  const base = await packsRoot(root);
  if (source.includes("/")) {
    const packDir = path.join(base, source);
    if (await pathExists(path.join(packDir, "pack.json"))) {
      return { name: path.basename(source), packDir, category: source.split("/")[0] };
    }
    return null;
  }
  const matches = [];
  // flat pack at the root
  if (await pathExists(path.join(base, source, "pack.json"))) {
    matches.push({ name: source, packDir: path.join(base, source), category: null });
  }
  // nested under any category folder
  for (const entry of await fs.readdir(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packDir = path.join(base, entry.name, source);
    if (await pathExists(path.join(packDir, "pack.json"))) {
      matches.push({ name: source, packDir, category: entry.name });
    }
  }
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    const qualified = matches.map((m) => `${m.category}/${source}`).join(", ");
    throw Object.assign(
      new Error(`ambiguous pack "${source}" — exists in multiple categories; use one of: ${qualified}`),
      { exitCode: 2 },
    );
  }
  return matches[0];
}

/** Read + parse `pack.json` from a resolved pack directory. */
export async function readManifestAt(packDir) {
  const manifestPath = path.join(packDir, "pack.json");
  if (!(await pathExists(manifestPath))) {
    const err = new Error(`no pack.json in ${packDir}`);
    err.exitCode = 2;
    throw err;
  }
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (e) {
    const err = new Error(`invalid pack.json in ${packDir}: ${e.message}`);
    err.exitCode = 2;
    throw err;
  }
}

async function readManifest(packName, root = PACKAGE_ROOT) {
  const found = await findOfficialPackDir(packName, root);
  if (!found) {
    const err = new Error(`Unknown pack: ${packName} (try \`faraday pack list\`)`);
    err.exitCode = 2;
    throw err;
  }
  return { packDir: found.packDir, manifest: await readManifestAt(found.packDir) };
}

function mergeSortedDeps(pkg, group, deps) {
  if (!deps) return;
  pkg[group] = { ...(pkg[group] ?? {}), ...deps };
  pkg[group] = Object.fromEntries(Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)));
}

async function lessonCssPath(lessonRoot) {
  for (const rel of ["app/globals.css", "src/app.css", "src/index.css"]) {
    const candidate = path.join(lessonRoot, rel);
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

/** Copy a file or a directory from `from` to `to`. No-op if `from` is absent. */
async function copyEntry(from, to) {
  if (!(await pathExists(from))) return false;
  const st = await fs.stat(from);
  if (st.isDirectory()) {
    await copyDirectory(from, to);
  } else {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
  return true;
}

async function applyCopies(rules, packDir, lessonRoot) {
  for (const c of rules ?? []) {
    await copyEntry(path.join(packDir, c.from), path.join(lessonRoot, c.to));
  }
}

/** Append text to a file, idempotent via `marker`. Skips absent files. */
async function applyAppends(rules, lessonRoot) {
  for (const a of rules ?? []) {
    const dest = path.join(lessonRoot, a.to);
    try {
      const text = await fs.readFile(dest, "utf8");
      if (a.marker && text.includes(a.marker)) continue;
      await fs.appendFile(dest, a.text);
    } catch {
      /* target file absent — skip this append */
    }
  }
}

/**
 * Install a pack into the lesson containing `fromDir`.
 * @param {string|null} packName       official pack name (null when `opts.packDir` is given)
 * @param {object} opts
 * @param {string} opts.fromDir        a path inside (or at) the target lesson
 * @param {string} [opts.packDir]      a pre-resolved pack directory (from resolvePack); bypasses name lookup
 * @param {string} [opts.source]       the original source string (recorded in provenance)
 * @param {string|null} [opts.variant] e.g. "physics"
 * @param {string} [opts.templateRoot] override CLI package root (tests)
 * @param {Set<string>} [opts._seen] internal — packs already installed this run (cycle guard)
 * @returns {Promise<{lessonRoot, packName, variant, addedDeps, installedRefs, installedRequires}>}
 */
export async function installPack(packName, opts) {
  const { fromDir, variant = null, templateRoot, source = null } = opts;
  let packDir, manifest;
  if (opts.packDir) {
    packDir = opts.packDir;
    manifest = await readManifestAt(packDir);
  } else {
    ({ packDir, manifest } = await readManifest(packName, templateRoot));
  }
  // The effective name: explicit arg, else the manifest's, else the folder name.
  const name = packName ?? manifest.name ?? path.basename(packDir);

  const lessonRoot = await findLessonRoot(fromDir);
  if (!lessonRoot) {
    const err = new Error(
      `not inside a Faraday lesson (no @faraday-academy/* dependency found from ${fromDir})`,
    );
    err.exitCode = 2;
    throw err;
  }

  // 0. dependency packs — install what this pack `requires` first, so a pack can
  //    build ON another (a game-curriculum pack on the `three` engine pack) without
  //    re-declaring its deps. Cycle-guarded via _seen; installPack is idempotent so
  //    an already-present dependency is a no-op.
  const seen = opts._seen ?? new Set();
  seen.add(name);
  const installedRequires = [];
  for (const req of manifest.requires ?? []) {
    const r = await resolvePack(req, {});
    if (seen.has(r.name)) continue; // cycle, or already installed this run
    await installPack(null, { fromDir, packDir: r.packDir, source: r.source, templateRoot, _seen: seen });
    installedRequires.push(r.name);
  }

  if (variant && !manifest.runtime?.variants?.[variant]) {
    const err = new Error(`pack ${name} has no variant "${variant}"`);
    err.exitCode = 2;
    throw err;
  }

  const rt = manifest.runtime ?? {};
  const addedDeps = [];

  // 1. runtime deps -> lesson package.json (base + variant)
  const pkgPath = path.join(lessonRoot, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  const before = JSON.stringify({ d: pkg.dependencies, dd: pkg.devDependencies });
  mergeSortedDeps(pkg, "dependencies", rt.dependencies);
  mergeSortedDeps(pkg, "devDependencies", rt.devDependencies);
  if (variant) {
    mergeSortedDeps(pkg, "dependencies", rt.variants[variant].dependencies);
    mergeSortedDeps(pkg, "devDependencies", rt.variants[variant].devDependencies);
  }
  if (JSON.stringify({ d: pkg.dependencies, dd: pkg.devDependencies }) !== before) {
    for (const dep of Object.keys({ ...rt.dependencies, ...rt.devDependencies })) addedDeps.push(dep);
    if (variant) for (const dep of Object.keys(rt.variants[variant].dependencies ?? {})) addedDeps.push(dep);
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 2. css imports -> the host's global stylesheet (idempotent)
  const appCss = await lessonCssPath(lessonRoot);
  if (rt.cssImports?.length && appCss) {
    let css = await fs.readFile(appCss, "utf8");
    let changed = false;
    for (const imp of rt.cssImports) {
      const line = `@import "${imp}";`;
      if (!css.includes(line)) {
        css = (css.endsWith("\n") ? css : css + "\n") + line + "\n";
        changed = true;
      }
    }
    if (changed) await fs.writeFile(appCss, css);
  }

  // 3. copy runtime files (examples, author-editable source, assets) + appends
  await applyCopies(rt.copy, packDir, lessonRoot);
  await applyAppends(rt.appends, lessonRoot);

  // 4. skill half -> .faraday/packs/<name>/ + pointer into AGENTS.md / authoring.md
  const installedRefs = [];
  if (manifest.skill?.reference) {
    const refSrc = path.join(packDir, manifest.skill.reference);
    const destDir = path.join(lessonRoot, ".faraday", "packs", name);
    await fs.mkdir(destDir, { recursive: true });
    const stat = await fs.stat(refSrc);
    let refRel;
    if (stat.isDirectory()) {
      await copyDirectory(refSrc, destDir);
      refRel = path.relative(lessonRoot, destDir);
    } else {
      const refDest = path.join(destDir, path.basename(manifest.skill.reference));
      await fs.copyFile(refSrc, refDest);
      refRel = path.relative(lessonRoot, refDest);
    }
    installedRefs.push(refRel);

    const when = manifest.skill.loadWhen ? ` Load it when ${manifest.skill.loadWhen}.` : "";
    const pointer =
      `\n> **Pack \`${name}\`:** installed via \`faraday pack add ${source ?? name}\`. ` +
      `Authoring guide at \`${refRel}\`.${when}\n`;
    const marker = `Pack \`${name}\`:`;
    for (const doc of ["AGENTS.md", "docs/authoring.md"]) {
      const docPath = path.join(lessonRoot, doc);
      try {
        const text = await fs.readFile(docPath, "utf8");
        if (!text.includes(marker)) await fs.appendFile(docPath, pointer);
      } catch {
        /* doc absent — skip pointer for it */
      }
    }
  }

  // 5. provenance — official packs record a plain tag string (back-compat); an
  //    external pack (installed from a path/github/npm source) records {name, source}.
  const provPath = path.join(lessonRoot, ".faraday", "provenance.json");
  const tag = variant ? `${name}:${variant}` : name;
  try {
    const prov = JSON.parse(await fs.readFile(provPath, "utf8"));
    const key = (p) => (typeof p === "string" ? p : p.name);
    const kept = (prov.packs ?? []).filter((p) => key(p) !== tag);
    // official packs (source === the pack name) record a plain tag string;
    // external sources (a path/github/npm ref) record { name, source }.
    const external = source && source !== name;
    kept.push(external ? { name: tag, source } : tag);
    prov.packs = kept;
    await fs.writeFile(provPath, JSON.stringify(prov, null, 2) + "\n");
  } catch {
    /* older lesson without provenance — skip */
  }

  return { lessonRoot, packName: name, variant, addedDeps, installedRefs, installedRequires, source };
}

// ---------------------------------------------------------------------------
// Manifest validation (zero-dep structural check; the formal contract is
// packages/official-packs/pack.schema.json for third-party editor/CI tooling).
// ---------------------------------------------------------------------------

const isStr = (v) => typeof v === "string";
const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
const isStrMap = (v) => isObj(v) && Object.values(v).every(isStr);

function checkCopyRules(rules, label, errs) {
  if (rules == null) return;
  if (!Array.isArray(rules)) return void errs.push(`${label} must be an array`);
  rules.forEach((r, i) => {
    if (!isObj(r) || !isStr(r.from) || !isStr(r.to)) errs.push(`${label}[${i}] needs string { from, to }`);
  });
}
function checkAppendRules(rules, label, errs) {
  if (rules == null) return;
  if (!Array.isArray(rules)) return void errs.push(`${label} must be an array`);
  rules.forEach((r, i) => {
    if (!isObj(r) || !isStr(r.to) || !isStr(r.text)) errs.push(`${label}[${i}] needs string { to, text }`);
  });
}

/** Structural validation of a parsed pack.json. Returns string[] (empty = valid). */
export function validateManifest(manifest) {
  const errs = [];
  if (!isObj(manifest)) return ["manifest is not an object"];
  if (!isStr(manifest.displayName)) errs.push("displayName is required (string)");
  if (manifest.name != null && !/^[a-z0-9][a-z0-9-]*$/.test(manifest.name))
    errs.push("name must be kebab-case ([a-z0-9-])");
  for (const k of ["description", "quality", "category"]) {
    if (manifest[k] != null && !isStr(manifest[k])) errs.push(`${k} must be a string`);
  }
  if (manifest.requires != null && !(Array.isArray(manifest.requires) && manifest.requires.every(isStr)))
    errs.push("requires must be a string[]");

  const rt = manifest.runtime;
  if (rt != null) {
    if (!isObj(rt)) errs.push("runtime must be an object");
    else {
      for (const g of ["dependencies", "devDependencies"]) {
        if (rt[g] != null && !isStrMap(rt[g])) errs.push(`runtime.${g} must be a string->string map`);
      }
      if (rt.cssImports != null && !(Array.isArray(rt.cssImports) && rt.cssImports.every(isStr)))
        errs.push("runtime.cssImports must be a string[]");
      checkCopyRules(rt.copy, "runtime.copy", errs);
      checkAppendRules(rt.appends, "runtime.appends", errs);
      if (rt.variants != null) {
        if (!isObj(rt.variants)) errs.push("runtime.variants must be an object");
        else for (const [v, spec] of Object.entries(rt.variants)) {
          for (const g of ["dependencies", "devDependencies"]) {
            if (spec?.[g] != null && !isStrMap(spec[g])) errs.push(`runtime.variants.${v}.${g} must be a string->string map`);
          }
        }
      }
    }
  }

  const sk = manifest.skill;
  if (sk != null) {
    if (!isObj(sk)) errs.push("skill must be an object");
    else {
      if (sk.reference != null && !isStr(sk.reference)) errs.push("skill.reference must be a string");
      if (sk.entry != null && !isStr(sk.entry)) errs.push("skill.entry must be a string");
      if (sk.loadWhen != null && !isStr(sk.loadWhen)) errs.push("skill.loadWhen must be a string");
    }
  }
  return errs;
}

/**
 * Deep validation of a pack ON DISK — what `validateManifest` (shape-only) can't
 * see: referenced files actually exist, and no scaffold TODOs are left unfilled.
 * Returns { errors, warnings }; the CLI fails (exit 2) on any error.
 * @param {string} packDir
 * @returns {Promise<{errors: string[], warnings: string[]}>}
 */
export async function validatePackDir(packDir) {
  const errors = [];
  const warnings = [];
  let manifest;
  try {
    manifest = await readManifestAt(packDir);
  } catch (e) {
    return { errors: [e.message], warnings };
  }
  errors.push(...validateManifest(manifest));

  // 1. skill half must exist on disk (a dead reference installs nothing)
  const sk = manifest.skill;
  if (sk?.reference) {
    const refAbs = path.join(packDir, sk.reference);
    if (!(await pathExists(refAbs))) {
      errors.push(`skill.reference "${sk.reference}" does not exist`);
    } else {
      const st = await fs.stat(refAbs);
      if (sk.entry) {
        if (!st.isDirectory()) errors.push(`skill.entry is set but skill.reference "${sk.reference}" is a file, not a folder`);
        else if (!(await pathExists(path.join(refAbs, sk.entry)))) errors.push(`skill.entry "${sk.entry}" not found in skill folder "${sk.reference}"`);
      } else if (st.isDirectory()) {
        warnings.push(`skill.reference is a folder but no skill.entry (index) is declared`);
      }
    }
  }

  // 2. quality file must exist if referenced
  if (manifest.quality && !(await pathExists(path.join(packDir, manifest.quality)))) {
    errors.push(`quality "${manifest.quality}" does not exist`);
  }

  // 3. copy sources: the installer silently skips absent `from` paths, so a typo'd
  //    or missing source is a warning here (a copy pack that ships nothing).
  const copyRules = [
    ...(manifest.runtime?.copy ?? []),
    ...Object.values(manifest.runtime?.variants ?? {}).flatMap((v) => v?.copy ?? []),
  ];
  for (const c of copyRules) {
    if (c?.from && !(await pathExists(path.join(packDir, c.from)))) {
      warnings.push(`runtime copy source "${c.from}" does not exist — it will install nothing`);
    }
  }

  // 4. leftover scaffold TODOs — an unfilled pack should not pass review
  const todoFiles = [];
  const scan = async (rel) => {
    const abs = path.join(packDir, rel);
    if (!(await pathExists(abs))) return;
    if ((await fs.readFile(abs, "utf8")).includes("TODO")) todoFiles.push(rel);
  };
  await scan("pack.json");
  for (const dir of ["skill", "examples"]) {
    const abs = path.join(packDir, dir);
    if (!(await pathExists(abs))) continue;
    const walk = async (d, base) => {
      for (const e of await fs.readdir(d, { withFileTypes: true })) {
        const r = `${base}/${e.name}`;
        if (e.isDirectory()) await walk(path.join(d, e.name), r);
        else await scan(r);
      }
    };
    await walk(abs, dir);
  }
  await scan("quality.md");
  if (todoFiles.length) warnings.push(`unfilled scaffold TODOs in: ${[...new Set(todoFiles)].join(", ")}`);

  // 5. required packs: an official-name dependency should resolve to a known pack
  if (Array.isArray(manifest.requires) && manifest.requires.length) {
    const official = new Set((await listPacks()).map((p) => p.name));
    for (const req of manifest.requires) {
      if (/^[a-z0-9][a-z0-9-]*$/.test(req) && !official.has(req)) {
        warnings.push(`requires "${req}" is not a known official pack (typo? or an external source)`);
      }
    }
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Source resolution: turn a `pack add <source>` argument into a local pack dir.
// Sources: official name · local path (./ ../ / ~) · owner/repo[/sub] (github) ·
// npm:<spec> or @scope/name (npm). Remote sources are fetched into a cache.
// ---------------------------------------------------------------------------

function classifySource(source) {
  if (source.startsWith("npm:")) return { kind: "npm", spec: source.slice(4) };
  if (source.startsWith("@")) return { kind: "npm", spec: source };
  if (source.startsWith("github:")) return { kind: "github", ref: source.slice(7) };
  if (/^(\.\.?\/|\/|~)/.test(source)) return { kind: "local", p: source };
  if (source.includes("/")) return { kind: "github", ref: source };
  return { kind: "official", name: source };
}

const cacheDir = () => path.join(os.homedir(), ".faraday", "cache");
const sourceHash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

async function singleSubdir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length !== 1) throw Object.assign(new Error(`expected one top-level dir in ${dir}`), { exitCode: 4 });
  return path.join(dir, dirs[0].name);
}

async function extractTarball(tgz, into) {
  await fs.mkdir(into, { recursive: true });
  await execFileP("tar", ["-xzf", tgz, "-C", into]).catch((e) => {
    throw Object.assign(new Error(`tar extract failed: ${e.message}`), { exitCode: 4 });
  });
}

async function resolveGithub(ref, log) {
  const [owner, repo, ...rest] = ref.split("/");
  const sub = rest.join("/");
  if (!owner || !repo) throw Object.assign(new Error(`bad github source: ${ref} (use owner/repo[/path])`), { exitCode: 2 });
  const dest = path.join(cacheDir(), `gh-${sourceHash(ref)}`);
  log?.(`fetching github:${owner}/${repo}${sub ? "/" + sub : ""} …`);
  await fs.rm(dest, { recursive: true, force: true });
  await fs.mkdir(dest, { recursive: true });
  const url = `https://api.github.com/repos/${owner}/${repo}/tarball`;
  const res = await fetch(url, { headers: { "User-Agent": "faraday-cli", Accept: "application/vnd.github+json" } });
  if (!res.ok) throw Object.assign(new Error(`GitHub fetch ${url} -> ${res.status}`), { exitCode: 4 });
  const tgz = path.join(dest, "src.tar.gz");
  await fs.writeFile(tgz, Buffer.from(await res.arrayBuffer()));
  await extractTarball(tgz, dest);
  await fs.rm(tgz, { force: true });
  const root = await singleSubdir(dest);
  return sub ? path.join(root, sub) : root;
}

async function resolveNpm(spec, log) {
  const dest = path.join(cacheDir(), `npm-${sourceHash(spec)}`);
  log?.(`fetching npm:${spec} …`);
  await fs.rm(dest, { recursive: true, force: true });
  await fs.mkdir(dest, { recursive: true });
  await execFileP("npm", ["pack", spec, "--pack-destination", dest, "--silent"], { cwd: dest }).catch((e) => {
    throw Object.assign(new Error(`npm pack ${spec} failed: ${e.message}`), { exitCode: 4 });
  });
  const tgz = (await fs.readdir(dest)).find((f) => f.endsWith(".tgz"));
  if (!tgz) throw Object.assign(new Error(`npm pack produced no tarball for ${spec}`), { exitCode: 4 });
  await extractTarball(path.join(dest, tgz), dest);
  return path.join(dest, "package"); // npm tarballs extract under package/
}

/**
 * Resolve a `pack add` source to a local pack directory containing pack.json.
 * @param {string} source
 * @param {object} [opts] { templateRoot, log }
 * @returns {Promise<{ name: string, packDir: string, source: string }>}
 */
export async function resolvePack(source, opts = {}) {
  const { templateRoot, log } = opts;
  const aliased = PACK_ALIASES[source];
  if (aliased && log) log(`Note: pack "${source}" is now "${aliased}".\n`);
  source = aliased ?? source;
  // Official packs live in a category-foldered tree. Both a bare name (`three`)
  // and a qualified `category/name` (`runtime/three`) resolve here — and the tree
  // is checked BEFORE a slashy source is treated as `owner/repo` (github), so a
  // qualified official name wins over the github source grammar.
  const official = await findOfficialPackDir(source, templateRoot);
  if (official) return { name: official.name, packDir: official.packDir, source };

  const c = classifySource(source);
  if (c.kind === "official") {
    throw Object.assign(
      new Error(`Unknown pack: ${source} (try \`faraday pack list\`, or a ./path, owner/repo, or npm: source)`),
      { exitCode: 2 },
    );
  }

  let packDir;
  if (c.kind === "local") {
    packDir = path.resolve(process.cwd(), c.p.replace(/^~(?=$|\/)/, os.homedir()));
  } else if (c.kind === "github") {
    packDir = await resolveGithub(c.ref, log);
  } else {
    packDir = await resolveNpm(c.spec, log);
  }
  if (!(await pathExists(path.join(packDir, "pack.json")))) {
    throw Object.assign(new Error(`no pack.json found for source: ${source}`), { exitCode: 2 });
  }
  const manifest = await readManifestAt(packDir);
  return { name: manifest.name ?? path.basename(packDir), packDir, source };
}

// ---------------------------------------------------------------------------
// Removal: un-register a pack (skill + provenance, always safe) and best-effort
// reverse its reversible runtime config (deps + css that no remaining pack still
// needs). Copied source files and text appends are REPORTED, never deleted —
// they may hold the author's own edits or be imported by the lesson.
// ---------------------------------------------------------------------------

/** The npm deps a pack contributes for a given installed variant (base + variant). */
function packDeps(manifest, variant) {
  const rt = manifest.runtime ?? {};
  const names = new Set([...Object.keys(rt.dependencies ?? {}), ...Object.keys(rt.devDependencies ?? {})]);
  if (variant && rt.variants?.[variant]) {
    for (const g of ["dependencies", "devDependencies"]) for (const k of Object.keys(rt.variants[variant][g] ?? {})) names.add(k);
  }
  return names;
}

/** Remove the `> **Pack \`name\`:** …` pointer line installPack appended. */
function stripPointer(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`\\n?>\\s*\\*\\*Pack \`${esc}\`:.*\\n`, "g"), "\n");
}

/** Resolve the manifest for a provenance entry (offline for official/local). null on failure. */
async function manifestForEntry(baseName, entry, templateRoot) {
  try {
    const src = typeof entry === "object" ? entry.source : null;
    if (!src || src === baseName) return (await readManifest(baseName, templateRoot)).manifest;
    const resolved = await resolvePack(src, { templateRoot });
    return await readManifestAt(resolved.packDir);
  } catch {
    return null;
  }
}

const provEntryBase = (p) => (typeof p === "string" ? p : p.name).split(":")[0];
const provEntryVariant = (p) => {
  const t = typeof p === "string" ? p : p.name;
  return t.includes(":") ? t.split(":")[1] : null;
};

/**
 * Remove an installed pack from the lesson containing `fromDir`.
 * @returns {Promise<{name, removedDeps, removedCss, leftFiles, leftAppends, manifestResolved, sharedUnknown}>}
 */
export async function removePack(name, opts) {
  const { fromDir, templateRoot } = opts;
  const lessonRoot = await findLessonRoot(fromDir);
  if (!lessonRoot) {
    throw Object.assign(new Error(`not inside a Faraday lesson (from ${fromDir})`), { exitCode: 2 });
  }

  const provPath = path.join(lessonRoot, ".faraday", "provenance.json");
  let prov = {};
  try {
    prov = JSON.parse(await fs.readFile(provPath, "utf8"));
  } catch {
    /* no provenance */
  }
  const entries = prov.packs ?? [];
  const match = entries.find((p) => provEntryBase(p) === name);
  if (!match) {
    throw Object.assign(new Error(`pack ${name} is not installed here (try \`faraday pack list\`)`), { exitCode: 2 });
  }
  const remaining = entries.filter((p) => provEntryBase(p) !== name);

  // 1. un-register (always safe): skill dir + doc pointers + provenance entry
  await fs.rm(path.join(lessonRoot, ".faraday", "packs", name), { recursive: true, force: true });
  for (const doc of ["AGENTS.md", "docs/authoring.md"]) {
    const dp = path.join(lessonRoot, doc);
    try {
      await fs.writeFile(dp, stripPointer(await fs.readFile(dp, "utf8"), name));
    } catch {
      /* doc absent */
    }
  }
  prov.packs = remaining;
  await fs.writeFile(provPath, JSON.stringify(prov, null, 2) + "\n").catch(() => {});

  const report = { name, removedDeps: [], removedCss: [], leftFiles: [], leftAppends: [], manifestResolved: false, sharedUnknown: false };
  const manifest = await manifestForEntry(name, match, templateRoot);
  if (!manifest) return report; // couldn't resolve — un-register only
  report.manifestResolved = true;

  const ourDeps = packDeps(manifest, provEntryVariant(match));
  const ourCss = new Set(manifest.runtime?.cssImports ?? []);

  // 2. what's still needed by the remaining packs (only trustworthy if ALL resolve)
  const stillDeps = new Set(), stillCss = new Set();
  for (const p of remaining) {
    const m = await manifestForEntry(provEntryBase(p), p, templateRoot);
    if (!m) { report.sharedUnknown = true; continue; }
    for (const d of packDeps(m, provEntryVariant(p))) stillDeps.add(d);
    for (const c of m.runtime?.cssImports ?? []) stillCss.add(c);
  }

  // 3. reverse deps + css that nothing else needs (skip if a sibling was unresolvable)
  if (!report.sharedUnknown) {
    const pkgPath = path.join(lessonRoot, "package.json");
    try {
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
      for (const g of ["dependencies", "devDependencies"]) {
        if (!pkg[g]) continue;
        for (const d of Object.keys(pkg[g])) {
          if (ourDeps.has(d) && !stillDeps.has(d)) { delete pkg[g][d]; report.removedDeps.push(d); }
        }
      }
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    } catch {
      /* no package.json */
    }
    const appCss = await lessonCssPath(lessonRoot);
    if (appCss) {
      try {
        let css = await fs.readFile(appCss, "utf8");
        for (const imp of ourCss) {
          if (stillCss.has(imp)) continue;
          const line = `@import "${imp}";`;
          if (css.includes(line)) { css = css.replace(line + "\n", "").replace(line, ""); report.removedCss.push(imp); }
        }
        await fs.writeFile(appCss, css);
      } catch {
        /* no global stylesheet */
      }
    }
  }

  // 4. report copied files + appends left in place (never auto-deleted)
  report.leftFiles = (manifest.runtime?.copy ?? []).map((c) => c.to);
  report.leftAppends = (manifest.runtime?.appends ?? []).map((a) => a.to);
  return report;
}

// ---------------------------------------------------------------------------
// pack show: read a pack's skill guide without installing (design-time access,
// no lesson needed). Default packs: auto-installed by `faraday new`.
// ---------------------------------------------------------------------------

/** Read a pack's skill reference as ordered markdown files (a single file or a folder). */
export async function readPackSkill(packDir, manifest) {
  const ref = manifest.skill?.reference;
  if (!ref) return [];
  const refPath = path.join(packDir, ref);
  const st = await fs.stat(refPath).catch(() => null);
  if (!st) return [];
  const files = [];
  if (st.isDirectory()) {
    const walk = async (dir, rel = "") => {
      const entries = (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
      for (const e of entries) {
        const abs = path.join(dir, e.name);
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) await walk(abs, r);
        else if (e.name.endsWith(".md")) files.push({ path: r, content: await fs.readFile(abs, "utf8") });
      }
    };
    await walk(refPath);
  } else {
    files.push({ path: path.basename(refPath), content: await fs.readFile(refPath, "utf8") });
  }
  return files;
}

// ── Pack authoring: `faraday pack new` ──────────────────────────────────────
// Stamp the uniform pack skeleton (pack.json + skill/pack.md + quality.md +
// examples/) so an author fills in blanks instead of copying an existing pack by
// hand. Mirrors `faraday new` for lessons. Three archetypes match how the runtime
// half installs: "skill" (compose existing blocks, no deps), "copy" (ship an
// author-editable component into the lesson), "runtime" (pin a published package).

const PACK_KINDS = ["skill", "copy", "runtime"];
const pascalCase = (s) => s.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

function packManifestTemplate(name, kind, flat) {
  const m = {
    name,
    displayName: `TODO: ${name} — short human label`,
    description: "TODO: one sentence — what this pack adds to a lesson, and when to use it.",
    runtime: {},
    // Folder skill by default: SKILL.md is an index that routes to sub-guides,
    // so an agent reads the entry and opens only the guide it needs. Use --flat
    // for a tiny single-file skill.
    skill: flat
      ? { reference: "skill/pack.md", loadWhen: "TODO: the situation in which an agent should load this pack" }
      : { reference: "skill", entry: "SKILL.md", loadWhen: "TODO: the situation in which an agent should load this pack" },
    quality: "quality.md",
  };
  if (kind === "copy") {
    m.runtime = {
      copy: [
        { from: `runtime/${name}`, to: `src/lesson/${name}` },
        { from: "examples", to: "docs/examples" },
      ],
    };
  } else if (kind === "runtime") {
    m.runtime = {
      dependencies: { "TODO-published-package": "^0.0.0" },
      cssImports: [],
      copy: [{ from: "examples", to: "docs/examples" }],
    };
  } else {
    m.runtime = { copy: [{ from: "examples", to: "docs/examples" }] };
  }
  return m;
}

// Flat (single-file) skill — only for --flat / tiny packs.
function packSkillTemplate(name) {
  return `# Pack: \`${name}\` — <short title> (agent guide)

Load this when **<the trigger>** — mirror the manifest's \`loadWhen\`. One or two
sentences on what this pack gives a lesson.

## When it fits (and when it doesn't)

Say what this pack is *for* — and, just as important, when NOT to reach for it
(the negative space). A capability used off-label fails the quality bar.

## Why / pedagogy

The evidence or design principle behind the capability: why this shape, not another.

## Using it

\`\`\`tsx
// The minimal, correct way to use what this pack installs.
\`\`\`

- Call out the non-obvious rules (stable ids, required props, common gotchas).

## Extending

Where the author can go further — swap the algorithm, wire to the LMS recorder,
theme it. Point at the author-editable files this pack copies (if any).

## Quality gate

See \`quality.md\`. Key rules: <the 2-3 things that make a use of this pack good>.
`;
}

// Folder skill (default) — an index that routes to focused sub-guides. Mirrors
// the exam / lecture-design packs. Returns [{ rel, content }, …] under skill/.
function packSkillFolder(name) {
  return [
    {
      rel: "skill/SKILL.md",
      content: `# Pack: \`${name}\` — <short title> (index)

Load this when **<the trigger>** — mirror the manifest's \`loadWhen\`. One or two
sentences on what this pack gives a lesson. This is the folder skill's **front
door**: it routes to the sub-guides — open the one for the step you're on, not all
of them.

## When it fits (and when it doesn't)

Say what this pack is *for* — and, just as important, when NOT to reach for it
(the negative space). Off-label use is the most common quality failure; name it.

## The guides

1. [using.md](using.md) — the minimal, correct way to use what this pack installs.
2. [pedagogy.md](pedagogy.md) — why this shape; the evidence / design principle.
3. [extending.md](extending.md) — going further; the author-editable surface.

Add or split guides as the pack grows — keep this index the single front door.

## Quality gate

See [../quality.md](../quality.md). Key rules: <the 2–3 things that make a use of
this pack good>.
`,
    },
    {
      rel: "skill/using.md",
      content: `# \`${name}\` — using it

The minimal, correct way to use what this pack installs.

\`\`\`tsx
// TODO: the smallest complete usage.
\`\`\`

- Call out the non-obvious rules (stable ids, required props, common gotchas).
- Show the *right* shape, not every option — the reader can discover the rest.
`,
    },
    {
      rel: "skill/pedagogy.md",
      content: `# \`${name}\` — why / pedagogy

The evidence or design principle behind this capability: why this shape, not
another. Tie it to a learning outcome, not decoration — an agent should be able to
justify reaching for this pack over a plain block.
`,
    },
    {
      rel: "skill/extending.md",
      content: `# \`${name}\` — extending

Where the author can go further — swap the algorithm, wire to the
\`@faraday-academy/lms\` recorder, theme it. Point at the author-editable
files this pack copies (if any); make clear what is safe to edit vs. a pinned dep.
`,
    },
  ];
}

function packQualityTemplate(name) {
  return `# Pack \`${name}\` — quality bar

Additional acceptance rules for lessons that use the \`${name}\` pack. Each rule is
pass/fail — an agent grades a generated lesson against them (the eval loop).

- **<Rule one>.** What must be true, and why a violation is a fail.
- **<Rule two>.** …
- **Right tool.** This pack is chosen because <the outcome it serves> — not to do
  something another pack or a plain block does better.
`;
}

function packExampleTemplate(name, kind) {
  const C = pascalCase(name);
  const usesComponent = kind === "copy";
  const importLine = usesComponent
    ? `import { Lesson, Prose } from "@faraday-academy/kit/blocks";\nimport { ${C} } from "./${name}";`
    : `import { Lesson, Prose } from "@faraday-academy/kit/blocks";`;
  const body = usesComponent
    ? `      <${C} items={[/* TODO: the smallest set that shows the point */]} />`
    : `        <p>Show the capability this pack adds, in the smallest complete lesson.</p>`;
  const wrap = usesComponent ? (b) => b : (b) => `      <Prose>\n        <h1>TODO: ${name} example</h1>\n${b}\n      </Prose>`;
  return `// Example lesson for the \`${name}\` pack — copy into src/lesson/lesson.tsx.
// Keep it to ONE idea that shows the pack at its best; it doubles as an eval fixture.
${importLine}

export default function ${C}Example() {
  return (
    <Lesson>
${wrap(body)}
    </Lesson>
  );
}
`;
}

// Author-editable component (copy archetype). A typed-props skeleton with selection
// state + a11y + token styling, so the shape matches the real copy packs (srs/notes)
// instead of a bare <div>.
function packComponentTemplate(name) {
  const C = pascalCase(name);
  return `// Author-editable component the \`${name}\` pack copies into src/lesson/${name}/.
// Once installed this is YOURS to edit — it is copied, not a locked dependency.
// Style with theme tokens (Tailwind / var(--…)) only; keep it keyboard-operable.
import { useState } from "react";

export interface ${C}Item {
  id: string;
  // TODO: the fields one item needs (label, value, detail, …).
}

export function ${C}({ items }: { items: ${C}Item[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  // TODO: render \`items\` and drive the view from \`selectedId\`. Replace this stub.
  return (
    <div className="${name} rounded-lg border border-border p-4">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-pressed={selectedId === it.id}
          onClick={() => setSelectedId(it.id)}
          className="mr-2 rounded px-2 py-1 aria-pressed:bg-accent"
        >
          {it.id}
        </button>
      ))}
    </div>
  );
}
`;
}

function packComponentIndexTemplate(name) {
  const C = pascalCase(name);
  return `export { ${C}, type ${C}Item } from "./${C}";\n`;
}

/**
 * Scaffold a new module-pack folder for a pack author.
 * @param {string} name  kebab-case pack name
 * @param {object} [opts]
 * @param {string} [opts.cwd]
 * @param {string} [opts.dir]        target directory (default ./<name>)
 * @param {"skill"|"copy"|"runtime"} [opts.kind]  archetype (default "skill")
 * @param {boolean} [opts.flat]      single-file skill instead of a folder (default false)
 * @param {boolean} [opts.overwrite]
 * @returns {Promise<{packDir: string, name: string, kind: string, skill: "folder"|"flat", files: string[]}>}
 */
export async function scaffoldPack(name, opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const kind = opts.kind ?? "skill";
  const flat = opts.flat ?? false;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name ?? "")) {
    const e = new Error(`pack name must be kebab-case ([a-z0-9-]), got "${name}"`);
    e.exitCode = 2;
    throw e;
  }
  if (!PACK_KINDS.includes(kind)) {
    const e = new Error(`unknown --kind "${kind}" (expected: ${PACK_KINDS.join(", ")})`);
    e.exitCode = 2;
    throw e;
  }
  const packDir = opts.dir ? path.resolve(cwd, opts.dir) : path.resolve(cwd, name);
  const existing = await fs.readdir(packDir).catch(() => null);
  if (existing && existing.length && !opts.overwrite) {
    const e = new Error(`target ${packDir} is not empty (use --overwrite)`);
    e.exitCode = 2;
    throw e;
  }
  const files = [];
  const write = async (rel, content) => {
    const abs = path.join(packDir, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content);
    files.push(rel);
  };
  await write("pack.json", JSON.stringify(packManifestTemplate(name, kind, flat), null, 2) + "\n");
  if (flat) {
    await write("skill/pack.md", packSkillTemplate(name));
  } else {
    for (const f of packSkillFolder(name)) await write(f.rel, f.content);
  }
  await write("quality.md", packQualityTemplate(name));
  await write(`examples/${name}.tsx`, packExampleTemplate(name, kind));
  if (kind === "copy") {
    await write(`runtime/${name}/${pascalCase(name)}.tsx`, packComponentTemplate(name));
    await write(`runtime/${name}/index.tsx`, packComponentIndexTemplate(name));
  }
  return { packDir, name, kind, skill: flat ? "flat" : "folder", files };
}
