// Command routing + argument parsing for the `faraday` CLI.
// Design mirrors the references: non-interactive by default, deterministic exit
// codes, side effects injectable via `context` so tests run without spawning.
import path from "node:path";
import fs from "node:fs/promises";
import spawn from "node:child_process";
import { generateLesson } from "./generate.mjs";
import { sanitizePackageName } from "./pkg.mjs";
import { findLessonRoot, collectFindings, managedDeps } from "./doctor.mjs";

const HELP = `faraday — scaffold AI-authored interactive lessons (shadcn-based)

Usage:
  faraday new <name> [--at <dir>] [--overwrite] [--skip-install] [--json]
  faraday check [--dir <lesson>]        verify the lesson layout + runtime pin
  faraday doctor [--dir <lesson>]       deep check (layout + pin + installed lockfile)
  faraday upgrade [--to <ver>] [--dir <lesson>]
                                        move the @faraday-academy/* pins (the only
                                        supported way): pin-bump → install →
                                        doctor, and roll back if doctor fails
  faraday help

The generated lesson depends on the versioned @faraday-academy/runtime package
(pinned exactly) instead of vendoring it. Author your lesson in src/lesson/.

  --3d / --physics / --tutor are being repackaged as @faraday-academy/* addon
  packages and are temporarily unavailable; scaffold a 2D lesson for now.

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
  const opts = { name: undefined, at: undefined, overwrite: false, skipInstall: false, json: false, threeD: false, physics: false, tutor: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--at") opts.at = argv[++i];
    else if (arg === "--overwrite") opts.overwrite = true;
    else if (arg === "--skip-install") opts.skipInstall = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--3d") opts.threeD = true;
    else if (arg === "--physics") opts.physics = true;
    else if (arg === "--tutor") opts.tutor = true;
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
