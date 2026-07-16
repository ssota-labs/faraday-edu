import catalogJson from "@faraday-academy/registry/catalog";

export interface PackCatalogItem {
  name: string;
  displayName: string;
  description: string;
  category: string;
  requires: string[];
  variants: string[];
  dependencies: Array<{ packageName: string; version: string }>;
  quality: string | null;
  installCommand: string;
}

export interface BlockCatalogItem {
  name: string;
  slug: string;
  group: string;
  summary: string;
  importPath: string;
  sourcePath: string | null;
}

export interface ExampleCatalogItem {
  slug: string;
  title: string;
  description: string;
  packs: string[];
}

export const catalog = catalogJson as {
  schemaVersion: number;
  packs: PackCatalogItem[];
  blocks: BlockCatalogItem[];
  examples: ExampleCatalogItem[];
};

export function packByName(name: string) {
  return catalog.packs.find((pack) => pack.name === name);
}

export function blockBySlug(slug: string) {
  return catalog.blocks.find((block) => block.slug === slug);
}
