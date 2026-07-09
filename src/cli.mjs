// Command routing + argument parsing for the `faraday` CLI.
// Design mirrors the references: non-interactive by default, deterministic exit
// codes, side effects injectable via `context` so tests run without spawning.
import path from "node:path";
import fs from "node:fs/promises";
import spawn from "node:child_process";
import { fileURLToPath } from "node:url";
import { generateLesson } from "./generate.mjs";
import { sanitizePackageName } from "./pkg.mjs";
import { MANIFEST_NAME, verifyManifest } from "./manifest.mjs";

const HELP = `faraday — scaffold AI-authored interactive lessons (shadcn-based)

Usage:
  faraday new <name> [--3d | --physics] [--tutor] [--at <dir>] [--overwrite] [--skip-install] [--json]
  faraday check [--dir <lesson>]        verify the protected src/faraday/** tree
  faraday help

  --3d        include the Three.js (React Three Fiber) 3D block + a solar-system demo.
              Omit it for 2D lessons — three is never installed or bundled without it.
  --physics   like --3d, plus the Rapier physics engine + a gravity/collision demo.
  --tutor     add a durable, grounded AI chat tutor (<Tutor>). Turns the app into a
              Vite + Nitro + Workflow hybrid with api/ routes. Needs AI_GATEWAY_API_KEY
              in .env.local locally; deploys to Vercel. Static lessons stay server-free.

Exit codes: 0 ok · 1 lesson check failed · 2 usage error · 4 environment error`;

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
      // Under --json, stdout must stay pure JSON — keep pnpm's install chatter off
      // it (route child stdout to /dev/null; errors still surface on stderr).
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
  // The tutor needs an AI Gateway key locally — surface that before `pnpm dev`.
  const tutorSteps = opts.tutor ? ["cp env.example .env.local  # then paste your AI_GATEWAY_API_KEY"] : [];
  if (opts.json) {
    context.stdout(JSON.stringify({
      ok: true, command: "new", title: result.title, packageName: result.packageName,
      dir: targetDir, protectedFiles: result.protectedFiles, installed, tutor: opts.tutor,
      nextSteps: [`cd ${targetDir}`, ...(installed ? [] : ["pnpm install"]), ...tutorSteps, "pnpm dev"],
    }, null, 2) + "\n");
  } else {
    const tutorLine = opts.tutor
      ? `    cp env.example .env.local   # paste your AI_GATEWAY_API_KEY (see env.example)\n`
      : "";
    context.stdout(
      `\n  Created ${result.title} in ${rel}/  (${result.protectedFiles} protected files)\n\n` +
      `  Next:\n    cd ${rel}\n${installed ? "" : "    pnpm install\n"}${tutorLine}    pnpm dev\n\n` +
      `  Author your lesson in src/lesson/lesson.tsx — the shadcn layer under src/faraday/ is locked.\n` +
      (opts.tutor ? `  Tutor: embed <Tutor context={…} /> from "@/faraday/tutor"; api/ + workflows/ hold the durable server.\n` : ""),
    );
  }
}

async function findLessonRoot(start) {
  let dir = start;
  for (;;) {
    if (await exists(path.join(dir, MANIFEST_NAME))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }

async function runCheck(argv, context) {
  let dir;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") dir = argv[++i];
    else { const e = new Error(`Unknown argument: ${argv[i]}`); e.exitCode = 2; throw e; }
  }
  const start = dir ? path.resolve(context.cwd, dir) : context.cwd;
  const root = await findLessonRoot(start);
  if (!root) { const e = new Error("no .faraday-manifest.json found — not inside a lesson"); e.exitCode = 2; throw e; }

  const manifest = JSON.parse(await fs.readFile(path.join(root, MANIFEST_NAME), "utf8"));
  const findings = await verifyManifest(path.join(root, "src", "faraday"), manifest);
  if (findings.length === 0) {
    context.stdout("faraday check: protected tree intact\n");
    return;
  }
  for (const f of findings) context.stderr(`  [${f.code}] ${f.file} — ${f.message}\n`);
  const e = new Error(`${findings.length} integrity finding(s) in src/faraday/`);
  e.exitCode = 1;
  throw e;
}
