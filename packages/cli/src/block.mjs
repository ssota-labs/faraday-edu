import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function catalogPath() {
  const bundled = path.join(CLI_ROOT, "catalog.json");
  try {
    await fs.access(bundled);
    return bundled;
  } catch {
    return path.resolve(CLI_ROOT, "..", "registry", "generated", "catalog.json");
  }
}

async function readCatalog() {
  return JSON.parse(await fs.readFile(await catalogPath(), "utf8"));
}

export async function listBlocks() {
  const catalog = await readCatalog();
  return catalog.blocks ?? [];
}

export async function readBlock(name) {
  const normalized = name.toLowerCase();
  const block = (await listBlocks()).find(
    (item) =>
      item.name.toLowerCase() === normalized || item.slug.toLowerCase() === normalized,
  );
  if (!block) {
    const error = new Error(`Unknown block: ${name}`);
    error.exitCode = 2;
    throw error;
  }
  return block;
}
