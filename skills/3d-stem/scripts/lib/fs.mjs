import fs from "node:fs/promises";
import path from "node:path";

export const DEFAULT_IGNORE = new Set([
  ".DS_Store",
  ".git",
  "dist",
  "node_modules",
]);

export async function pathExists(target) {
  try {
    await fs.stat(target);
    return true;
  } catch {
    return false;
  }
}

export async function assertDirectory(dir, label) {
  let stat;
  try {
    stat = await fs.stat(dir);
  } catch {
    throw new Error(`${label} directory not found: ${dir}`);
  }
  if (!stat.isDirectory()) throw new Error(`${label} is not a directory: ${dir}`);
}

export async function copyDirectory(from, to, ignore = DEFAULT_IGNORE) {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isSymbolicLink()) {
      const link = await fs.readlink(src);
      await fs.symlink(link, dest);
    } else if (entry.isDirectory()) {
      await copyDirectory(src, dest, ignore);
    } else {
      await fs.copyFile(src, dest);
    }
  }
}

export async function isEffectivelyEmpty(dir) {
  if (!(await pathExists(dir))) return true;
  const entries = await fs.readdir(dir);
  return entries.every((name) => name === ".DS_Store");
}

export async function replaceInFile(file, from, to) {
  const text = await fs.readFile(file, "utf8");
  if (!text.includes(from)) return false;
  await fs.writeFile(file, text.split(from).join(to));
  return true;
}
