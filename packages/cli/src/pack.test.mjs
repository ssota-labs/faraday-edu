import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateLesson } from "./generate.mjs";
import { runFaradayCli } from "./cli.mjs";
import {
  installPack,
  listPacks,
  readManifestAt,
  readPackSkill,
  removePack,
  resolvePack,
  scaffoldPack,
  validateManifest,
  validatePackDir,
} from "./pack.mjs";

async function tmp() {
  return fs.mkdtemp(path.join(os.tmpdir(), "faraday-pack-test-"));
}

const exists = async (value) => Boolean(await fs.stat(value).catch(() => null));
const read = (dir, rel) => fs.readFile(path.join(dir, rel), "utf8");

async function scaffold(name = "Pack Host") {
  const base = await tmp();
  const target = path.join(base, "lesson");
  await generateLesson({ targetDir: target, name, uuid: () => "fixed-id" });
  return target;
}

async function cli(args, cwd = process.cwd()) {
  let out = "";
  let err = "";
  let code = 0;
  await runFaradayCli(args, {
    cwd,
    stdout: (value) => (out += value),
    stderr: (value) => (err += value),
    setExitCode: (value) => (code = value),
    throwOnError: true,
  });
  return { out, err, code };
}

test("listPacks exposes only the remaining explicit packs", async () => {
  const packs = await listPacks();
  const names = packs.map((pack) => pack.name);
  for (const name of [
    "audience",
    "exam",
    "game2d",
    "lecture-design",
    "notes",
    "sim2d",
    "slide-view",
    "srs",
    "stem-methods",
    "storybook-game2d",
    "textbook-view",
  ]) {
    assert.ok(names.includes(name), `expected ${name}`);
  }
  for (const removed of ["map2d", "three", "tutor"]) {
    assert.ok(!names.includes(removed), `${removed} was removed`);
  }
  assert.ok(packs.every((pack) => !("default" in pack)), "packs have no default behavior");
});

test("every official pack passes manifest and deep validation", async () => {
  for (const pack of await listPacks()) {
    const resolved = await resolvePack(pack.name);
    assert.deepEqual(validateManifest(await readManifestAt(resolved.packDir)), []);
    const report = await validatePackDir(resolved.packDir);
    assert.deepEqual(report.errors, [], `${pack.name}: ${report.errors.join("; ")}`);
  }
});

test("skill-only folder pack installs under .faraday", async () => {
  const target = await scaffold("Pedagogy");
  const before = JSON.parse(await read(target, "package.json"));
  const result = await installPack("lecture-design", { fromDir: target });
  assert.ok(await exists(path.join(target, ".faraday/packs/lecture-design/overview.md")));
  assert.equal(result.addedDeps.length, 0);
  assert.deepEqual(JSON.parse(await read(target, "package.json")).dependencies, before.dependencies);
});

test("copy pack installs author-editable source without dependencies", async () => {
  const target = await scaffold("SRS");
  const before = JSON.parse(await read(target, "package.json"));
  await installPack("srs", { fromDir: target });
  assert.ok(await exists(path.join(target, "src/lesson/srs/Flashcards.tsx")));
  assert.ok(await exists(path.join(target, ".faraday/packs/srs/pack.md")));
  assert.deepEqual(JSON.parse(await read(target, "package.json")).dependencies, before.dependencies);
});

test("runtime pack installs dependencies, source, and its folder skill", async () => {
  const target = await scaffold("Game");
  await installPack("game2d", { fromDir: target });
  const pkg = JSON.parse(await read(target, "package.json"));
  assert.ok(pkg.dependencies["pixi.js"]);
  assert.ok(pkg.dependencies["matter-js"]);
  assert.ok(await exists(path.join(target, "src/lesson/game2d/Game2D.tsx")));
  assert.ok(await exists(path.join(target, ".faraday/packs/game2d/SKILL.md")));
});

test("requires installs dependency packs first", async () => {
  const target = await scaffold("Story");
  await installPack("storybook-game2d", { fromDir: target });
  assert.ok(await exists(path.join(target, "src/lesson/game2d/Game2D.tsx")));
  assert.ok(await exists(path.join(target, "src/lesson/storybook-game2d/StorybookGame.tsx")));
  const provenance = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.ok(provenance.packs.includes("game2d"));
  assert.ok(provenance.packs.includes("storybook-game2d"));
});

test("pack install is idempotent", async () => {
  const target = await scaffold("Repeat");
  await installPack("sim2d", { fromDir: target });
  await installPack("sim2d", { fromDir: target });
  const provenance = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.equal(provenance.packs.filter((pack) => pack === "sim2d").length, 1);
});

test("removePack unregisters skill and reversible dependencies", async () => {
  const target = await scaffold("Remove");
  await installPack("game2d", { fromDir: target });
  const result = await removePack("game2d", { fromDir: target });
  assert.equal(await exists(path.join(target, ".faraday/packs/game2d")), false);
  assert.ok(result.removedDeps.includes("pixi.js"));
  assert.ok(result.leftFiles.includes("src/lesson/game2d"));
});

test("external local pack records source provenance", async () => {
  const base = await tmp();
  const target = path.join(base, "lesson");
  await generateLesson({ targetDir: target, name: "External", uuid: () => "fixed-id" });
  const packDir = path.join(base, "vocab-pack");
  await fs.mkdir(packDir, { recursive: true });
  await fs.writeFile(
    path.join(packDir, "pack.json"),
    JSON.stringify({ displayName: "Vocab", skill: { reference: "guide.md" } }),
  );
  await fs.writeFile(path.join(packDir, "guide.md"), "# Vocabulary");
  await installPack("vocab-pack", { fromDir: target, packDir, source: packDir });
  const provenance = JSON.parse(await read(target, ".faraday/provenance.json"));
  assert.ok(provenance.packs.some((entry) => entry.name === "vocab-pack" && entry.source === packDir));
});

test("pack show progressively discloses folder skills", async () => {
  const index = await cli(["pack", "show", "lecture-design"]);
  assert.match(index.out, /overview/i);
  assert.match(index.out, /more in this pack:/);
  const section = await cli(["pack", "show", "lecture-design", "spaced-retrieval.md"]);
  assert.match(section.out, /Space and retrieve/);
});

test("pack new scaffolds and round-trips each archetype", async () => {
  const base = await tmp();
  for (const kind of ["skill", "copy", "runtime"]) {
    const result = await scaffoldPack(`sample-${kind}`, {
      cwd: base,
      dir: path.join(base, `sample-${kind}`),
      kind,
    });
    assert.deepEqual(validateManifest(await readManifestAt(result.packDir)), []);
    const report = await validatePackDir(result.packDir);
    assert.deepEqual(report.errors, []);
  }
});

test("CLI pack add and validate use the same contract", async () => {
  const target = await scaffold("CLI");
  const add = await cli(["pack", "add", "srs", "--dir", target, "--json"]);
  assert.equal(JSON.parse(add.out).pack, "srs");
  const validate = await cli(["pack", "validate", "srs", "--json"]);
  assert.equal(JSON.parse(validate.out).ok, true);
});

test("block commands expose registry metadata", async () => {
  const listed = await cli(["block", "list", "--json"]);
  const blocks = JSON.parse(listed.out);
  assert.ok(blocks.some((block) => block.name === "Quiz"));
  const shown = await cli(["block", "show", "Quiz", "--json"]);
  assert.equal(JSON.parse(shown.out).importPath, "@faraday-academy/kit/blocks");
});

test("unknown packs and blocks return usage errors", async () => {
  const base = await tmp();
  await assert.rejects(() => installPack("missing", { fromDir: base }), /Unknown pack/);
  await assert.rejects(() => cli(["block", "show", "missing"]), /Unknown block/);
});
