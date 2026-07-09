// Integration tests for the scaffold pipeline. Uses a real tmpdir, no install.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateLesson } from "./generate.mjs";
import { verifyManifest } from "./manifest.mjs";
import { runFaradayCli } from "./cli.mjs";

async function tmp() {
  return fs.mkdtemp(path.join(os.tmpdir(), "primer-test-"));
}
const read = (dir, rel) => fs.readFile(path.join(dir, rel), "utf8");
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

test("generateLesson produces the expected tree + injections", async () => {
  const base = await tmp();
  const target = path.join(base, "out");
  const result = await generateLesson({ targetDir: target, name: "My Cool Lesson", uuid: () => "fixed-id" });

  assert.equal(result.packageName, "my-cool-lesson");
  assert.equal(result.title, "My Cool Lesson");
  assert.ok(result.protectedFiles > 5);

  // required files exist
  for (const rel of [
    "index.html",
    "package.json",
    "components.json",
    ".gitignore",
    "src/main.tsx",
    "src/lesson/lesson.tsx",
    "src/faraday/faraday.css",
    "src/faraday/runtime/index.ts",
    "src/faraday/blocks/index.ts",
    "src/faraday/ui/button.tsx",
    "src/faraday/styles/style-faraday.css",
    ".faraday-manifest.json",
    ".faraday/provenance.json",
  ]) {
    assert.ok(await exists(path.join(target, rel)), `missing ${rel}`);
  }

  // name + title injected
  const pkg = JSON.parse(await read(target, "package.json"));
  assert.equal(pkg.name, "my-cool-lesson");
  assert.equal(pkg.private, true);
  assert.match(await read(target, "index.html"), /<title>My Cool Lesson<\/title>/);

  // dotless template gitignore did not survive
  assert.equal(await exists(path.join(target, "gitignore")), false);

  // provenance carries the injected id
  const prov = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.equal(prov.lessonId, "fixed-id");

  await fs.rm(base, { recursive: true, force: true });
});

test("generateLesson --tutor adds the durable server layer + locks the chat UI", async () => {
  const base = await tmp();
  const target = path.join(base, "out");
  const result = await generateLesson({ targetDir: target, name: "tutored", tutor: true });

  // server-backed files land at the project root (author-editable)...
  for (const rel of [
    "api/chat.post.ts",
    "api/chat/[runId]/stream.get.ts",
    "workflows/tutor-agent.ts",
    "env.example",
    "tsconfig.node.json",
    "docs/examples/tutor.tsx",
  ]) {
    assert.ok(await exists(path.join(target, rel)), `missing ${rel}`);
  }

  // ...and the chat UI is vendored INTO the locked tree (in the manifest)
  assert.ok(await exists(path.join(target, "src/faraday/tutor/tutor.tsx")));
  const manifest = JSON.parse(await read(target, ".faraday-manifest.json"));
  assert.ok(
    Object.keys(manifest.files).some((f) => f.startsWith("tutor/")),
    "tutor UI should be under the integrity manifest",
  );

  // the tutor deps + the Vite+Nitro+Workflow config were injected
  const pkg = JSON.parse(await read(target, "package.json"));
  for (const dep of ["ai", "@ai-sdk/react", "@ai-sdk/workflow", "workflow", "nitro"]) {
    assert.ok(pkg.dependencies[dep], `missing dep ${dep}`);
  }
  const vite = await read(target, "vite.config.ts");
  assert.match(vite, /workflow\/vite/);
  assert.match(vite, /nitro\/vite/);

  await fs.rm(base, { recursive: true, force: true });
});

test("integrity manifest matches freshly-generated protected tree", async () => {
  const base = await tmp();
  const target = path.join(base, "out");
  await generateLesson({ targetDir: target, name: "demo" });
  const manifest = JSON.parse(await read(target, ".faraday-manifest.json"));
  const findings = await verifyManifest(path.join(target, "src", "faraday"), manifest);
  assert.deepEqual(findings, []);

  // editing a protected file is detected
  const victim = path.join(target, "src", "faraday", "blocks", "index.ts");
  await fs.appendFile(victim, "\n// tampered\n");
  const after = await verifyManifest(path.join(target, "src", "faraday"), manifest);
  assert.equal(after.length, 1);
  assert.equal(after[0].code, "modified");

  await fs.rm(base, { recursive: true, force: true });
});

test("primer new --json --skip-install reports structured output", async () => {
  const base = await tmp();
  let out = "";
  await runFaradayCli(
    ["new", "sort-steps", "--skip-install", "--json"],
    { cwd: base, stdout: (s) => (out += s), stderr: () => {}, throwOnError: true },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.packageName, "sort-steps");
  assert.equal(parsed.installed, false);
  assert.ok(await exists(path.join(base, "sort-steps", "src", "lesson", "lesson.tsx")));
  await fs.rm(base, { recursive: true, force: true });
});

test("non-empty target without --overwrite is a usage error (exit 2)", async () => {
  const base = await tmp();
  const dir = path.join(base, "taken");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "keep.txt"), "x");
  let code = 0;
  await runFaradayCli(
    ["new", "taken", "--skip-install"],
    { cwd: base, stdout: () => {}, stderr: () => {}, setExitCode: (c) => (code = c) },
  );
  assert.equal(code, 2);
  await fs.rm(base, { recursive: true, force: true });
});
