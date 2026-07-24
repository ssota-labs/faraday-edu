#!/usr/bin/env node
/**
 * 3d-stem skill runtime — scaffold + check (no public npm CLI).
 *
 *   node skills/3d-stem/scripts/stem.mjs scaffold <name> [--dir <path>] [--json] [--skip-install] [--force]
 *   node skills/3d-stem/scripts/stem.mjs check [--dir <path>] [--json]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scaffoldLesson, SKILL_ROOT } from "./lib/scaffold.mjs";
import { collectFindings, findLessonRoot } from "./lib/check.mjs";

const EXIT = { OK: 0, CHECK: 1, USAGE: 2, ENV: 4 };

function parseArgs(argv) {
  const args = [...argv];
  const action = args.shift();
  /** @type {Record<string, string | boolean>} */
  const flags = {};
  /** @type {string[]} */
  const positionals = [];
  while (args.length > 0) {
    const token = args.shift();
    if (!token) break;
    if (token.startsWith("--")) {
      const key = token.slice(2);
      if (key === "json" || key === "force" || key === "skip-install" || key === "help") {
        flags[key] = true;
        continue;
      }
      const next = args.shift();
      if (!next || next.startsWith("--")) {
        throw Object.assign(new Error(`Missing value for --${key}`), { code: "USAGE" });
      }
      flags[key] = next;
      continue;
    }
    positionals.push(token);
  }
  return { action, flags, positionals };
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function printHelp() {
  console.log(`3d-stem skill scripts

Usage:
  node ${path.relative(process.cwd(), fileURLToPath(import.meta.url))} scaffold <name> [options]
  node ${path.relative(process.cwd(), fileURLToPath(import.meta.url))} check [options]

Options:
  --dir <path>       Target / lesson directory
  --json             Machine-readable output
  --skip-install     Do not run pnpm install after scaffold
  --force            Allow non-empty scaffold target
  --help             Show help

Exit codes: 0 ok · 1 check failed · 2 usage · 4 environment
Skill root: ${SKILL_ROOT}
`);
}

async function runScaffold(flags, positionals) {
  const name = positionals[0];
  if (!name) {
    throw Object.assign(new Error("scaffold requires <name>"), { code: "USAGE" });
  }
  const dirFlag = typeof flags.dir === "string" ? flags.dir : null;
  const targetDir = path.resolve(process.cwd(), dirFlag ?? name);
  return scaffoldLesson({
    targetDir,
    name,
    force: flags.force === true,
    skipInstall: flags["skip-install"] === true,
  });
}

async function runCheck(flags) {
  const start = path.resolve(process.cwd(), typeof flags.dir === "string" ? flags.dir : ".");
  const root = await findLessonRoot(start);
  if (!root) {
    return {
      ok: false,
      dir: start,
      problems: [
        "could not find a 3d-stem lesson root (need package.json + .stem/provenance.json, or a Vite/R3F lesson)",
      ],
    };
  }
  const problems = await collectFindings(root);
  return { ok: problems.length === 0, dir: root, problems };
}

export async function main(argv = process.argv.slice(2)) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = EXIT.USAGE;
    return;
  }

  const { action, flags, positionals } = parsed;
  if (!action || action === "help" || flags.help) {
    printHelp();
    return;
  }

  const json = flags.json === true;

  try {
    if (action === "scaffold") {
      const result = await runScaffold(flags, positionals);
      if (json) printJson(result);
      else {
        console.log(`scaffolded ${result.title} → ${result.dir}`);
        for (const step of result.next) console.log(`  ${step}`);
      }
      return;
    }

    if (action === "check") {
      const result = await runCheck(flags);
      if (json) printJson(result);
      else if (result.ok) console.log(`check ok: ${result.dir}`);
      else {
        console.error(`check failed: ${result.dir}`);
        for (const p of result.problems) console.error(`  - ${p}`);
      }
      process.exitCode = result.ok ? EXIT.OK : EXIT.CHECK;
      return;
    }

    throw Object.assign(new Error(`unknown action: ${action}`), { code: "USAGE" });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    const message = error instanceof Error ? error.message : String(error);
    if (json) {
      printJson({
        ok: false,
        error: message,
        ...(error && typeof error === "object" && "result" in error ? { result: error.result } : {}),
      });
    } else {
      console.error(message);
    }
    if (code === "USAGE") process.exitCode = EXIT.USAGE;
    else if (code === "ENV") process.exitCode = EXIT.ENV;
    else process.exitCode = EXIT.CHECK;
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
