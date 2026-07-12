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

/** All packs shipped with the CLI: [{ name, ...manifest }]. */
export async function listPacks(root = PACKAGE_ROOT) {
  const dir = await packsRoot(root);
  if (!(await pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const packs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(dir, entry.name, "pack.json");
    if (!(await pathExists(manifestPath))) continue;
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
      packs.push({ name: entry.name, ...manifest });
    } catch {
      /* malformed manifest — skip in listing */
    }
  }
  return packs.sort((a, b) => a.name.localeCompare(b.name));
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
  const packDir = path.join(await packsRoot(root), packName);
  if (!(await pathExists(path.join(packDir, "pack.json")))) {
    const err = new Error(`Unknown pack: ${packName} (try \`faraday pack list\`)`);
    err.exitCode = 2;
    throw err;
  }
  return { packDir, manifest: await readManifestAt(packDir) };
}

function mergeSortedDeps(pkg, group, deps) {
  if (!deps) return;
  pkg[group] = { ...(pkg[group] ?? {}), ...deps };
  pkg[group] = Object.fromEntries(Object.entries(pkg[group]).sort(([a], [b]) => a.localeCompare(b)));
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
 * @param {boolean} [opts.scaffold]    also stamp the pack's `scaffold` demo (new-lesson only)
 * @param {string} [opts.templateRoot] override CLI package root (tests)
 * @returns {Promise<{lessonRoot, packName, variant, addedDeps, installedRefs}>}
 */
export async function installPack(packName, opts) {
  const { fromDir, variant = null, scaffold = false, templateRoot, source = null } = opts;
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

  // 2. css imports -> src/app.css (idempotent)
  const appCss = path.join(lessonRoot, "src", "app.css");
  if (rt.cssImports?.length && (await pathExists(appCss))) {
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

  // 3b. scaffold demo (new-lesson only, never on `pack add` into existing work)
  if (scaffold && manifest.scaffold) {
    await applyCopies(manifest.scaffold.copy, packDir, lessonRoot);
    if (variant && manifest.scaffold.variants?.[variant]) {
      await applyCopies(manifest.scaffold.variants[variant].copy, packDir, lessonRoot);
    }
    await applyAppends(manifest.scaffold.appends, lessonRoot);
  }

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

  return { lessonRoot, packName: name, variant, addedDeps, installedRefs, source };
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
  for (const k of ["description", "quality"]) {
    if (manifest[k] != null && !isStr(manifest[k])) errs.push(`${k} must be a string`);
  }
  if (manifest.aliasFlags != null && !(Array.isArray(manifest.aliasFlags) && manifest.aliasFlags.every(isStr)))
    errs.push("aliasFlags must be a string[]");

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

  const sc = manifest.scaffold;
  if (sc != null && isObj(sc)) {
    checkCopyRules(sc.copy, "scaffold.copy", errs);
    checkAppendRules(sc.appends, "scaffold.appends", errs);
    if (sc.variants != null && isObj(sc.variants))
      for (const [v, spec] of Object.entries(sc.variants)) checkCopyRules(spec?.copy, `scaffold.variants.${v}.copy`, errs);
  }

  const sk = manifest.skill;
  if (sk != null) {
    if (!isObj(sk)) errs.push("skill must be an object");
    else {
      if (sk.reference != null && !isStr(sk.reference)) errs.push("skill.reference must be a string");
      if (sk.loadWhen != null && !isStr(sk.loadWhen)) errs.push("skill.loadWhen must be a string");
    }
  }
  return errs;
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
  const c = classifySource(source);

  let packDir;
  if (c.kind === "official") {
    packDir = path.join(await packsRoot(templateRoot), c.name);
    if (!(await pathExists(path.join(packDir, "pack.json")))) {
      throw Object.assign(
        new Error(`Unknown pack: ${c.name} (try \`faraday pack list\`, or a ./path, owner/repo, or npm: source)`),
        { exitCode: 2 },
      );
    }
    return { name: c.name, packDir, source: c.name };
  }
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
