/* Catalog metadata, parsed in the browser from raw source via Vite's
   import.meta.glob — no server/fs needed. Mirrors what a generated lesson would
   see: the runtime components (grouped), and the skills/packs the CLI + plugins
   ship. */
import ccPlugin from "../../../plugins/claude-code/.claude-plugin/plugin.json";
import codexPlugin from "../../../plugins/codex/.codex-plugin/plugin.json";

export type Component = {
  name: string;
  file: string;
  relPath: string;
  group: string;
  summary: string;
  exports: string[];
  isUtil: boolean;
};
export type ComponentGroup = {
  id: string;
  title: string;
  blurb: string;
  importPath: string;
  components: Component[];
};
export type Pack = { id: string; title: string; summary: string; relPath: string; tag: string };
export type OfficialPack = Pack & {
  category: string;
  kind: "skill" | "copy" | "runtime";
  defaultInstall: boolean;
};
export type SkillRef = { file: string; title: string };
export type Skill = { name: string; description: string; relPath: string; references: SkillRef[] };
export type Command = { name: string; description: string; relPath: string };
export type Agent = { name: string; description: string; relPath: string };
export type Plugin = { name: string; displayName: string; description: string; keywords: string[]; host: string };

// ── raw source (eager, as strings) ───────────────────────────────────────────

const runtimeSrc = import.meta.glob("../../../packages/kit/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const uiSrc = import.meta.glob("../../../packages/ui/src/components/ui/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const skillSrc = import.meta.glob("../../../plugins/claude-code/skills/faraday/SKILL.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const refSrc = import.meta.glob("../../../plugins/claude-code/skills/faraday/references/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const commandSrc = import.meta.glob("../../../plugins/claude-code/commands/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const agentSrc = import.meta.glob("../../../plugins/claude-code/agents/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const officialPackManifests = import.meta.glob("../../../packages/official-packs/**/pack.json", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ── parsers ──────────────────────────────────────────────────────────────────

function headerDoc(text: string): string {
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*\/\/ ?(.*)$/);
    if (m) {
      // A blank comment line ends the lead paragraph. By convention these
      // headers put the description first, then a blank `//`, then a code
      // example or an implementation note — none of which belong in a summary.
      if (m[1].trim() === "") {
        if (out.length) break;
        continue;
      }
      out.push(m[1]);
      continue;
    }
    if (line.trim() === "") {
      if (out.length) break;
      continue;
    }
    break;
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

/** Drop the redundant leading "<Name> —" / "pack-x —" (the name is shown
 *  separately) and sentence-case the result, for a cleaner card summary. */
function cleanSummary(doc: string): string {
  const s = doc
    .replace(/^<[^>]+>\s*—\s*/, "")
    .replace(/^[a-z][a-z0-9-]+\s*—\s*/, "")
    .trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function displayName(doc: string, fallback: string): { name: string; isUtil: boolean } {
  const angle = doc.match(/^<([A-Za-z0-9]+)>/);
  if (angle) return { name: angle[1], isUtil: false };
  const pack = doc.match(/^([a-z][a-z0-9-]+) —/);
  if (pack) return { name: pack[1], isUtil: false };
  return { name: fallback, isUtil: true };
}

function exportsOf(text: string): string[] {
  const names = new Set<string>();
  for (const m of text.matchAll(/export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g)) {
    names.add(m[1]);
  }
  for (const m of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const id = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (id && /^[A-Za-z]/.test(id)) names.add(id);
    }
  }
  return [...names];
}

function frontmatter(text: string): Record<string, string> {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) out[mm[1]] = mm[2].trim();
  }
  return out;
}

function firstH1(text: string): string {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

const base = (p: string) => p.split("/").pop() ?? p;
const kitRel = (p: string) => "packages/kit/" + p.split("/packages/kit/")[1];
const uiRel = (p: string) => "packages/ui/" + p.split("/packages/ui/")[1];
const pluginRel = (p: string) => "plugins/" + p.split("/plugins/")[1];
/** group segment after packages/kit/, e.g. ".../kit/blocks/Quiz.tsx" -> "blocks" */
const groupOf = (p: string) => p.split("/packages/kit/")[1]?.split("/")[0] ?? "";

// ── component groups ─────────────────────────────────────────────────────────

const GROUP_DEFS = [
  { id: "blocks", title: "Blocks", importPath: "@/faraday/blocks", blurb: "The authoring API — lesson building blocks composed from shadcn UI. What lesson code writes against." },
  { id: "ui", title: "UI primitives", importPath: "@/faraday/ui", blurb: "Shared shadcn / Base UI primitives (@faraday-academy/ui) the blocks and platform are built on." },
  { id: "runtime", title: "Runtime", importPath: "@/faraday/runtime", blurb: "Lesson & course hosts, the stepper, motion helpers, and theming." },
] as const;

export function loadComponentGroups(): ComponentGroup[] {
  return GROUP_DEFS.map((g) => {
    const entries =
      g.id === "ui"
        ? Object.entries(uiSrc)
        : Object.entries(runtimeSrc).filter(
            ([p]) => groupOf(p) === g.id && base(p) !== "index.ts" && !p.includes("/packs/"),
          );
    const components: Component[] = entries
      .map(([p, text]) => {
        const doc = headerDoc(text);
        const fileBase = base(p).replace(/\.(tsx|ts)$/, "");
        const { name, isUtil } = displayName(doc, fileBase);
        return {
          name,
          file: base(p),
          relPath: g.id === "ui" ? uiRel(p) : kitRel(p),
          group: g.id,
          summary: cleanSummary(doc),
          exports: exportsOf(text),
          isUtil,
        };
      })
      .sort((a, b) => Number(a.isUtil) - Number(b.isUtil) || a.name.localeCompare(b.name));
    return { id: g.id, title: g.title, blurb: g.blurb, importPath: g.importPath, components };
  });
}

// ── packs ────────────────────────────────────────────────────────────────────

const FEATURE_PACKS: Pack[] = [
  { id: "starter", title: "starter", tag: "base", relPath: "packages/cli/templates/starter", summary: "The minimal vinext app shell every standalone lesson starts from." },
];

export function loadWorldPacks(): Pack[] {
  return Object.entries(runtimeSrc)
    .filter(([p]) => p.includes("/world/packs/") && p.endsWith(".tsx"))
    .map(([p, text]) => {
      const doc = headerDoc(text);
      const fileBase = base(p).replace(/\.tsx$/, "");
      return { id: fileBase, title: displayName(doc, fileBase).name, summary: cleanSummary(doc), relPath: kitRel(p), tag: "world pack" };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function loadFeaturePacks(): Pack[] {
  return FEATURE_PACKS;
}

type PackManifest = {
  name: string;
  displayName?: string;
  description?: string;
  default?: boolean;
  runtime?: { dependencies?: Record<string, string>; copy?: { from: string }[] };
};

function inferPackKind(m: PackManifest): OfficialPack["kind"] {
  const rt = m.runtime ?? {};
  if (rt.dependencies && Object.keys(rt.dependencies).length > 0) return "runtime";
  if (rt.copy?.some((c) => c.from.startsWith("runtime/"))) return "copy";
  return "skill";
}

/** Official module packs — auto-discovered from every pack.json under official-packs. */
export function loadOfficialPacks(): OfficialPack[] {
  return Object.entries(officialPackManifests)
    .map(([p, text]) => {
      const m = JSON.parse(text) as PackManifest;
      const tail = p.split("/packages/official-packs/")[1] ?? "";
      const [category, nameFromPath] = tail.split("/");
      const name = m.name || nameFromPath || "";
      return {
        id: name,
        title: m.displayName || name,
        summary: m.description || "",
        relPath: `packages/official-packs/${category}/${name}`,
        tag: `${category} · ${inferPackKind(m)}`,
        category: category || "uncategorized",
        kind: inferPackKind(m),
        defaultInstall: m.default === true,
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
}

// ── skills / commands / agents / plugins ─────────────────────────────────────

export function loadSkill(): Skill | null {
  const entry = Object.entries(skillSrc)[0];
  if (!entry) return null;
  const [p, text] = entry;
  const fm = frontmatter(text);
  const references = Object.entries(refSrc)
    .map(([rp, rt]) => ({ file: base(rp), title: firstH1(rt) || base(rp).replace(/\.md$/, "") }))
    .sort((a, b) => a.file.localeCompare(b.file));
  return { name: fm.name || "faraday", description: fm.description || "", relPath: pluginRel(p), references };
}

export function loadCommands(): Command[] {
  return Object.entries(commandSrc)
    .map(([p, text]) => ({ name: base(p).replace(/\.md$/, ""), description: frontmatter(text).description || "", relPath: pluginRel(p) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function loadAgents(): Agent[] {
  return Object.entries(agentSrc).map(([p, text]) => {
    const fm = frontmatter(text);
    return { name: fm.name || base(p).replace(/\.md$/, ""), description: fm.description || "", relPath: pluginRel(p) };
  });
}

type RawPlugin = { name?: string; displayName?: string; description?: string; keywords?: string[]; interface?: { displayName?: string; shortDescription?: string } };

export function loadPlugins(): Plugin[] {
  const mk = (j: RawPlugin, host: string): Plugin => ({
    name: j.name ?? host,
    displayName: j.displayName ?? j.interface?.displayName ?? host,
    description: j.description ?? j.interface?.shortDescription ?? "",
    keywords: j.keywords ?? [],
    host,
  });
  return [mk(ccPlugin as RawPlugin, "Claude Code"), mk(codexPlugin as RawPlugin, "Codex")];
}
