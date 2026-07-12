// Command routing + argument parsing for the `faraday` CLI.
// Design mirrors the references: non-interactive by default, deterministic exit
// codes, side effects injectable via `context` so tests run without spawning.
import path from "node:path";
import fs from "node:fs/promises";
import spawn from "node:child_process";
import { generateLesson } from "./generate.mjs";
import { sanitizePackageName } from "./pkg.mjs";
import { findLessonRoot, collectFindings, managedDeps } from "./doctor.mjs";
import { listPacks, installPack, removePack, resolvePack, readManifestAt, validateManifest, readPackSkill } from "./pack.mjs";

const HELP = `faraday — scaffold AI-authored interactive lessons (shadcn-based)

Usage:
  faraday new <name> [--3d | --physics] [--tutor] [--no-defaults] [--at <dir>] [--overwrite] [--skip-install] [--json]
  faraday check [--dir <lesson>]        verify the lesson layout + runtime pin
  faraday doctor [--dir <lesson>]       deep check (layout + pin + installed lockfile)
  faraday upgrade [--to <ver>] [--dir <lesson>]
                                        move the @faraday-academy/* pins (the only
                                        supported way): pin-bump → install →
                                        doctor, and roll back if doctor fails
  faraday pack list [--json]            list available (official) module packs
  faraday pack add <name|source> [--physics] [--dir <lesson>] [--json]
                                        install a pack into an existing lesson —
                                        runtime deps + skill guide, both at once.
                                        <source> = official name · ./path ·
                                        owner/repo[/sub] (github) · npm:<spec>
  faraday pack remove <name> [--dir <lesson>] [--json]
                                        un-install a pack: drop its skill guide +
                                        pointer + provenance, reverse deps/css not
                                        shared by another pack (copied files kept)
  faraday pack show <name|source> [--json]
                                        print a pack's skill guide to stdout (read
                                        it at design time, no lesson needed)
  faraday pack validate <name|source> [--json]
                                        check a pack's pack.json against the contract
  faraday help

The generated lesson depends on the versioned @faraday-academy/runtime package
(pinned exactly) instead of vendoring it. Author your lesson in src/lesson/.

  --3d        add the @faraday-academy/three block (R3F/three.js) + a 3D demo.
              Omit it for 2D lessons — three is never installed or bundled without it.
  --physics   like --3d, plus @react-three/rapier + a gravity/collision demo.
  --tutor     add the @faraday-academy/tutor <Tutor> widget + a durable AI server
              (Vite + Nitro + Workflow). The server (api/ + workflows/) is
              author-editable. Needs AI_GATEWAY_API_KEY in .env.local locally.

Exit codes: 0 ok · 1 check failed · 2 usage error · 3 doctor/structure failed · 4 environment error`;

function makeContext(context = {}) {
  return {
    cwd: context.cwd ?? process.cwd(),
    env: context.env ?? process.env,
    stdout: context.stdout ?? ((s) => process.stdout.write(s)),
    stderr: context.stderr ?? ((s) => process.stderr.write(s)),
    runCommand: context.runCommand ?? defaultRunCommand,
    setExitCode: context.setExitCode ?? ((code) => { process.exitCode = code; }),
    throwOnError: context.throwOnError ?? false,
    uuid: context.uuid,
  };
}

function defaultRunCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn.spawn(command, args, { stdio: "inherit", shell: false, ...options });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)),
    );
  });
}

export async function runFaradayCli(argv, rawContext = {}) {
  const context = makeContext(rawContext);
  try {
    const [command, ...rest] = argv;
    if (!command || command === "help" || command === "--help" || command === "-h") {
      context.stdout(HELP + "\n");
      return;
    }
    if (command === "new") return await runNew(rest, context);
    if (command === "check") return await runCheck(rest, context);
    if (command === "doctor") return await runDoctor(rest, context);
    if (command === "upgrade") return await runUpgrade(rest, context);
    if (command === "pack") return await runPack(rest, context);
    const err = new Error(`Unknown command: ${command}`);
    err.exitCode = 2;
    throw err;
  } catch (error) {
    const code = error.exitCode ?? 1;
    context.stderr(`faraday: ${error.message}\n`);
    context.setExitCode(code);
    if (context.throwOnError) throw error;
  }
}

function parseNewArgs(argv) {
  const opts = { name: undefined, at: undefined, overwrite: false, skipInstall: false, json: false, threeD: false, physics: false, tutor: false, noDefaults: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--at") opts.at = argv[++i];
    else if (arg === "--overwrite") opts.overwrite = true;
    else if (arg === "--skip-install") opts.skipInstall = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--3d") opts.threeD = true;
    else if (arg === "--physics") opts.physics = true;
    else if (arg === "--tutor") opts.tutor = true;
    else if (arg === "--no-defaults") opts.noDefaults = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (opts.name === undefined) opts.name = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!opts.name) { const e = new Error("new requires a <name>"); e.exitCode = 2; throw e; }
  if (opts.at !== undefined && !opts.at) { const e = new Error("--at requires a value"); e.exitCode = 2; throw e; }
  return opts;
}

async function runNew(argv, context) {
  const opts = parseNewArgs(argv);
  const dirName = sanitizePackageName(opts.name).split("/").pop();
  const targetDir = opts.at
    ? path.resolve(context.cwd, opts.at)
    : path.resolve(context.cwd, dirName);

  const result = await generateLesson({
    targetDir,
    name: opts.name,
    force: opts.overwrite,
    threeD: opts.threeD,
    physics: opts.physics,
    tutor: opts.tutor,
    noDefaults: opts.noDefaults,
    uuid: context.uuid,
  });

  const skip = opts.skipInstall || context.env.FARADAY_SKIP_INSTALL === "1";
  let installed = false;
  if (!skip) {
    try {
      const installStdio = opts.json ? ["ignore", "ignore", "inherit"] : "inherit";
      await context.runCommand("pnpm", ["install"], { cwd: targetDir, stdio: installStdio });
      installed = true;
    } catch (error) {
      const e = new Error(`pnpm install failed: ${error.message}`);
      e.exitCode = 4;
      throw e;
    }
  }

  const rel = path.relative(context.cwd, targetDir) || ".";
  if (opts.json) {
    context.stdout(JSON.stringify({
      ok: true, command: "new", title: result.title, packageName: result.packageName,
      dir: targetDir, installed,
      nextSteps: [`cd ${targetDir}`, ...(installed ? [] : ["pnpm install"]), "pnpm dev"],
    }, null, 2) + "\n");
  } else {
    context.stdout(
      `\n  Created ${result.title} in ${rel}/\n\n` +
      `  Next:\n    cd ${rel}\n${installed ? "" : "    pnpm install\n"}    pnpm dev\n\n` +
      `  Author your lesson in src/lesson/lesson.tsx — the UI, blocks, and runtime come\n` +
      `  from the pinned @faraday-academy/runtime dependency.\n`,
    );
  }
}

async function resolveLessonRoot(dir, context) {
  const start = dir ? path.resolve(context.cwd, dir) : context.cwd;
  const root = await findLessonRoot(start);
  if (!root) {
    const e = new Error("no @faraday-academy/runtime lesson found here — run inside a generated lesson");
    e.exitCode = 2;
    throw e;
  }
  return root;
}

function parseDirOnly(argv) {
  const opts = { dir: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") opts.dir = argv[++i];
    else { const e = new Error(`Unknown argument: ${argv[i]}`); e.exitCode = 2; throw e; }
  }
  return opts;
}

async function runCheck(argv, context) {
  const { dir } = parseDirOnly(argv);
  const root = await resolveLessonRoot(dir, context);
  const problems = await collectFindings(root, { deep: false });
  if (problems.length === 0) {
    context.stdout("faraday check: lesson layout intact, runtime pinned\n");
    return;
  }
  for (const p of problems) context.stderr(`  ${p}\n`);
  const e = new Error(`${problems.length} check finding(s)`);
  e.exitCode = 1;
  throw e;
}

async function runPack(argv, context) {
  const [sub, ...rest] = argv;
  if (sub === "list") return await runPackList(rest, context);
  if (sub === "add") return await runPackAdd(rest, context);
  if (sub === "remove") return await runPackRemove(rest, context);
  if (sub === "show") return await runPackShow(rest, context);
  if (sub === "validate") return await runPackValidate(rest, context);
  const e = new Error(`Unknown pack subcommand: ${sub ?? "(none)"} (try: list, add, remove, show, validate)`);
  e.exitCode = 2;
  throw e;
}

async function runPackList(argv, context) {
  let json = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  const packs = await listPacks();
  if (json) {
    context.stdout(JSON.stringify(
      packs.map((p) => ({
        name: p.name,
        displayName: p.displayName ?? "",
        description: p.description ?? "",
        variants: Object.keys(p.runtime?.variants ?? {}),
        aliasFlags: p.aliasFlags ?? [],
      })),
      null,
      2,
    ) + "\n");
    return;
  }
  if (packs.length === 0) {
    context.stdout("No packs available.\n");
    return;
  }
  context.stdout("Available packs:\n");
  for (const p of packs) {
    const variants = Object.keys(p.runtime?.variants ?? {});
    const suffix = variants.length ? ` (variants: ${variants.join(", ")})` : "";
    context.stdout(`  ${p.name} — ${p.displayName ?? ""}${suffix}\n`);
  }
}

function parsePackAddArgs(argv) {
  const opts = { source: undefined, dir: undefined, variant: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") opts.dir = argv[++i];
    else if (arg === "--physics") opts.variant = "physics";
    else if (arg === "--json") opts.json = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (opts.source === undefined) opts.source = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!opts.source) { const e = new Error("pack add requires a <name|source>"); e.exitCode = 2; throw e; }
  if (opts.dir !== undefined && !opts.dir) { const e = new Error("--dir requires a value"); e.exitCode = 2; throw e; }
  return opts;
}

async function runPackAdd(argv, context) {
  const opts = parsePackAddArgs(argv);
  const fromDir = opts.dir ? path.resolve(context.cwd, opts.dir) : context.cwd;

  // 1. resolve the source (official name · ./path · owner/repo · npm:spec) to a local dir
  const resolved = await resolvePack(opts.source, {
    log: opts.json ? undefined : (m) => context.stderr(`  ${m}\n`),
  });
  // 2. validate its manifest before touching the lesson
  const manifest = await readManifestAt(resolved.packDir);
  const problems = validateManifest(manifest);
  if (problems.length) {
    for (const p of problems) context.stderr(`  invalid pack.json: ${p}\n`);
    const e = new Error(`pack ${resolved.name} has an invalid manifest`);
    e.exitCode = 2;
    throw e;
  }
  // 3. install both halves
  const result = await installPack(resolved.name, {
    fromDir,
    packDir: resolved.packDir,
    source: resolved.source,
    variant: opts.variant,
  });

  const rel = path.relative(context.cwd, result.lessonRoot) || ".";
  if (opts.json) {
    context.stdout(JSON.stringify({
      ok: true, command: "pack add", pack: result.packName, source: result.source,
      variant: result.variant, dir: result.lessonRoot,
      addedDeps: result.addedDeps, installedRefs: result.installedRefs,
      nextSteps: result.addedDeps.length ? ["pnpm install"] : [],
    }, null, 2) + "\n");
    return;
  }
  const label = result.variant ? `${result.packName} (--${result.variant})` : result.packName;
  const from = result.source && result.source !== result.packName ? ` (from ${result.source})` : "";
  context.stdout(
    `\n  Added pack ${label}${from} to ${rel}/\n\n` +
    (result.addedDeps.length
      ? `  Pinned: ${result.addedDeps.join(", ")}\n  Run \`pnpm install\` to fetch them.\n`
      : `  Dependencies already present.\n`) +
    (result.installedRefs.length
      ? `  Skill guide: ${result.installedRefs.join(", ")} (pointer added to AGENTS.md).\n`
      : "") +
    "\n",
  );
}

async function runPackRemove(argv, context) {
  let name, dir, json = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") dir = argv[++i];
    else if (arg === "--json") json = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (name === undefined) name = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!name) { const e = new Error("pack remove requires a <name>"); e.exitCode = 2; throw e; }
  if (dir !== undefined && !dir) { const e = new Error("--dir requires a value"); e.exitCode = 2; throw e; }

  const fromDir = dir ? path.resolve(context.cwd, dir) : context.cwd;
  const r = await removePack(name, { fromDir });

  if (json) {
    context.stdout(JSON.stringify({ ok: true, command: "pack remove", ...r }, null, 2) + "\n");
    return;
  }
  let out = `\n  Removed pack ${r.name} — unregistered its skill guide + AGENTS.md pointer + provenance.\n`;
  if (r.removedDeps.length) out += `  Removed deps: ${r.removedDeps.join(", ")} — run \`pnpm install\` to prune.\n`;
  if (r.removedCss.length) out += `  Removed css imports: ${r.removedCss.join(", ")}\n`;
  if (!r.manifestResolved) out += `  (couldn't resolve the pack manifest — runtime deps/files left untouched.)\n`;
  else if (r.sharedUnknown) out += `  (a sibling pack couldn't be resolved — left deps/css untouched to be safe.)\n`;
  const left = [...r.leftFiles, ...r.leftAppends];
  if (left.length) out += `  Left in place (may contain your edits — delete manually if unwanted): ${left.join(", ")}\n`;
  context.stdout(out + "\n");
}

async function runPackShow(argv, context) {
  let source, json = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (source === undefined) source = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!source) { const e = new Error("pack show requires a <name|source>"); e.exitCode = 2; throw e; }

  const resolved = await resolvePack(source, { log: json ? undefined : (m) => context.stderr(`  ${m}\n`) });
  const manifest = await readManifestAt(resolved.packDir);
  const files = await readPackSkill(resolved.packDir, manifest);

  if (json) {
    context.stdout(JSON.stringify({ name: resolved.name, displayName: manifest.displayName ?? "", files }, null, 2) + "\n");
    return;
  }
  if (files.length === 0) {
    context.stdout(`pack ${resolved.name} has no skill guide.\n`);
    return;
  }
  if (files.length === 1) {
    const c = files[0].content;
    context.stdout(c.endsWith("\n") ? c : c + "\n");
    return;
  }
  let out = `<!-- pack: ${resolved.name} — ${manifest.displayName ?? ""} (${files.length} files) -->\n`;
  for (const f of files) out += `\n\n===== ${f.path} =====\n\n${f.content.replace(/\n+$/, "")}\n`;
  context.stdout(out);
}

async function runPackValidate(argv, context) {
  let source, json = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else if (arg.startsWith("-")) { const e = new Error(`Unknown flag: ${arg}`); e.exitCode = 2; throw e; }
    else if (source === undefined) source = arg;
    else { const e = new Error(`Unexpected argument: ${arg}`); e.exitCode = 2; throw e; }
  }
  if (!source) { const e = new Error("pack validate requires a <name|source>"); e.exitCode = 2; throw e; }

  const resolved = await resolvePack(source, { log: json ? undefined : (m) => context.stderr(`  ${m}\n`) });
  const manifest = await readManifestAt(resolved.packDir);
  const problems = validateManifest(manifest);
  if (json) {
    context.stdout(JSON.stringify({ ok: problems.length === 0, pack: resolved.name, problems }, null, 2) + "\n");
  }
  if (problems.length === 0) {
    if (!json) context.stdout(`faraday pack validate: ${resolved.name} — manifest OK\n`);
    return;
  }
  if (!json) for (const p of problems) context.stderr(`  ${p}\n`);
  const e = new Error(`${problems.length} manifest problem(s) in ${resolved.name}`);
  e.exitCode = 2;
  throw e;
}

async function runDoctor(argv, context) {
  const { dir } = parseDirOnly(argv);
  const root = await resolveLessonRoot(dir, context);
  const problems = await collectFindings(root, { deep: true });
  if (problems.length === 0) {
    context.stdout("faraday doctor: healthy — layout intact, runtime pinned, lockfile present\n");
    return;
  }
  for (const p of problems) context.stderr(`  ${p}\n`);
  const e = new Error(`${problems.length} doctor finding(s)`);
  e.exitCode = 3;
  throw e;
}

async function runUpgrade(argv, context) {
  const opts = { dir: undefined, to: "latest" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") opts.dir = argv[++i];
    else if (argv[i] === "--to") opts.to = argv[++i];
    else { const e = new Error(`Unknown argument: ${argv[i]}`); e.exitCode = 2; throw e; }
  }
  if (!opts.to) { const e = new Error("--to requires a value"); e.exitCode = 2; throw e; }

  const root = await resolveLessonRoot(opts.dir, context);
  const pkgPath = path.join(root, "package.json");
  const original = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(original);

  const managed = managedDeps(pkg);
  if (managed.length === 0) {
    const e = new Error("no @faraday-academy/* dependencies to upgrade");
    e.exitCode = 2;
    throw e;
  }
  const prod = managed.filter((d) => d.group === "dependencies").map((d) => d.name);
  const dev = managed.filter((d) => d.group === "devDependencies").map((d) => d.name);

  const revert = () => fs.writeFile(pkgPath, original);

  // 1. bump pins exactly, then install. pnpm rewrites package.json in place.
  try {
    if (prod.length > 0) {
      await context.runCommand("pnpm", ["add", "--save-exact", ...prod.map((n) => `${n}@${opts.to}`)], { cwd: root, stdio: "inherit" });
    }
    if (dev.length > 0) {
      await context.runCommand("pnpm", ["add", "--save-exact", "--save-dev", ...dev.map((n) => `${n}@${opts.to}`)], { cwd: root, stdio: "inherit" });
    }
    await context.runCommand("pnpm", ["install"], { cwd: root, stdio: "inherit" });
  } catch (error) {
    await revert();
    const e = new Error(`pnpm failed during upgrade: ${error.message} — reverted package.json`);
    e.exitCode = 4;
    throw e;
  }

  // 2. doctor chain — if the upgraded lesson is unhealthy, roll back the pins.
  const problems = await collectFindings(root, { deep: true });
  if (problems.length > 0) {
    await revert();
    for (const p of problems) context.stderr(`  ${p}\n`);
    const e = new Error(`doctor failed after upgrade — reverted package.json (${problems.length} finding(s))`);
    e.exitCode = 3;
    throw e;
  }

  const after = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  const pins = managedDeps(after).map((d) => `${d.name}@${d.spec}`);
  context.stdout(`faraday upgrade: pinned ${pins.join(", ")}\n`);
  context.stdout("  run `pnpm dev` (or your verify flow) to confirm the lesson still builds.\n");
}
