#!/usr/bin/env node
// Thin entry point. All logic lives in src/cli.mjs so tests can call it directly.
import { runFaradayCli } from "../src/cli.mjs";

await runFaradayCli(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
});
