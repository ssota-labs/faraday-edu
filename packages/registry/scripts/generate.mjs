import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = join(root, "packages/registry/generated/catalog.json");
const check = process.argv.includes("--check");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function directories(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readQuality(packDir, manifest) {
  if (!manifest.quality) return null;
  const path = join(packDir, manifest.quality);
  return existsSync(path) ? readFileSync(path, "utf8").trim() : null;
}

function loadPacks() {
  const packsRoot = join(root, "packages/official-packs");
  const packs = [];
  for (const category of directories(packsRoot)) {
    for (const name of directories(join(packsRoot, category))) {
      const packDir = join(packsRoot, category, name);
      const manifestPath = join(packDir, "pack.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      packs.push({
        name,
        displayName: manifest.displayName ?? name,
        description: manifest.description ?? "",
        category: manifest.category ?? category,
        requires: manifest.requires ?? [],
        variants: Object.keys(manifest.runtime?.variants ?? {}).sort(),
        dependencies: Object.entries(manifest.runtime?.dependencies ?? {}).map(
          ([packageName, version]) => ({ packageName, version }),
        ),
        quality: readQuality(packDir, manifest),
        installCommand: `faraday pack add ${name}`,
      });
    }
  }
  return packs.sort((a, b) => a.name.localeCompare(b.name));
}

const blockGroups = {
  lesson: "Layout",
  prose: "Layout",
  stage: "Layout",
  workbench: "Layout",
  controlgroup: "Layout",
  slidedeck: "Layout",
  paramslider: "Controls",
  paramswitch: "Controls",
  segmented: "Controls",
  scrubber: "Controls",
  readout: "Data",
  chart: "Data",
  stat: "Data",
  quiz: "Assessment",
  numericanswer: "Assessment",
  challenge: "Assessment",
  sketchpad: "Assessment",
  derivation: "Explanation",
  tex: "Explanation",
  codecell: "Explanation",
  reveal: "Explanation",
  compare: "Explanation",
  callout: "Explanation",
};

function summaryFromSource(source, name) {
  const comments = source
    .split("\n")
    .slice(0, 8)
    .filter((line) => line.trim().startsWith("//"))
    .map((line) => line.replace(/^\s*\/\/\s?/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return comments || `${name} lesson block.`;
}

function loadBlocks() {
  const blocksRoot = join(root, "packages/kit/blocks");
  const index = readFileSync(join(blocksRoot, "index.ts"), "utf8");
  const matches = [
    ...index.matchAll(
      /export\s+\{\s*([A-Za-z0-9_]+)(?:[^}]*)\}\s+from\s+"\.\/([^"]+)";/g,
    ),
  ];
  return matches
    .map((match) => {
      const name = match[1];
      const moduleName = match[2];
      const sourcePath = [".tsx", ".ts"]
        .map((extension) => join(blocksRoot, `${moduleName}${extension}`))
        .find(existsSync);
      const source = sourcePath ? readFileSync(sourcePath, "utf8") : "";
      return {
        name,
        slug: name.toLowerCase(),
        group: blockGroups[name.toLowerCase()] ?? "More",
        summary: summaryFromSource(source, name),
        importPath: "@faraday-academy/kit/blocks",
        sourcePath: sourcePath ? relative(root, sourcePath) : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function loadExamples() {
  const examplesRoot = join(root, "examples");
  return directories(examplesRoot)
    .flatMap((slug) => {
      const packagePath = join(examplesRoot, slug, "package.json");
      if (!existsSync(packagePath)) return [];
      const pkg = readJson(packagePath);
      const provenancePath = join(examplesRoot, slug, ".faraday/provenance.json");
      const provenance = existsSync(provenancePath)
        ? readJson(provenancePath)
        : null;
      return [
        {
          slug,
          title: pkg.displayName ?? pkg.name ?? slug,
          description: pkg.description ?? "Interactive Faraday lesson example.",
          packs: (provenance?.packs ?? []).map((pack) =>
            typeof pack === "string" ? pack : pack.name,
          ),
        },
      ];
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const catalog = {
  schemaVersion: 1,
  packs: loadPacks(),
  blocks: loadBlocks(),
  examples: loadExamples(),
};
const next = `${JSON.stringify(catalog, null, 2)}\n`;

if (check) {
  const current = existsSync(output) ? readFileSync(output, "utf8") : "";
  if (current !== next) {
    console.error("registry catalog is stale; run: pnpm --filter @faraday-academy/registry generate");
    process.exit(1);
  }
  console.log("registry catalog is current");
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, next);
  console.log(`generated ${relative(root, output)}`);
}
