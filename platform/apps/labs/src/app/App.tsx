import { useMemo, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "@/faraday/runtime";
import {
  loadAgents,
  loadCommands,
  loadComponentGroups,
  loadFeaturePacks,
  loadPlugins,
  loadSkill,
  loadWorldPacks,
} from "@/catalog";
import { DEMOS } from "@/stories";
import { BLOCK_GROUPS } from "@/block-groups";
import { PreviewView } from "./PreviewView";
import { SkillsView } from "./SkillsView";
import { LayoutsView } from "./LayoutsView";

type Tab = "components" | "layouts" | "skills";

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
    >
      {resolved === "dark" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </button>
  );
}

export function App() {
  const [tab, setTab] = useState<Tab>("components");
  // Only show components that actually have a live preview. This drops the UI
  // primitives group and the non-visual hooks/logic/types entirely.
  const groups = useMemo(() => {
    const base = loadComponentGroups()
      .map((g) => ({ ...g, components: g.components.filter((c) => DEMOS[c.name]) }))
      .filter((g) => g.components.length > 0);
    // Split the flat blocks group into functional sub-groups (by authoring role).
    return base.flatMap((g) => {
      if (g.id !== "blocks") return [g];
      return BLOCK_GROUPS.map((bg) => ({
        id: `blocks-${bg.id}`,
        title: bg.title,
        blurb: bg.blurb,
        importPath: g.importPath,
        components: bg.members.flatMap((name) => {
          const c = g.components.find((x) => x.name === name);
          return c ? [c] : [];
        }),
      })).filter((sg) => sg.components.length > 0);
    });
  }, []);
  const skill = useMemo(loadSkill, []);
  const commands = useMemo(loadCommands, []);
  const agents = useMemo(loadAgents, []);
  const worldPacks = useMemo(loadWorldPacks, []);
  const featurePacks = useMemo(loadFeaturePacks, []);
  const plugins = useMemo(loadPlugins, []);

  const previewable = groups.reduce((n, g) => n + g.components.length, 0);

  return (
    <div>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">
              FL
            </span>
            Faraday <span className="text-muted-foreground">Labs</span>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <TabButton active={tab === "components"} onClick={() => setTab("components")}>
              Components
            </TabButton>
            <TabButton active={tab === "layouts"} onClick={() => setTab("layouts")}>
              Layouts
            </TabButton>
            <TabButton active={tab === "skills"} onClick={() => setTab("skills")}>
              Skills &amp; Packs
            </TabButton>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">{previewable} live previews</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-6">
        {tab === "components" ? (
          <PreviewView groups={groups} />
        ) : tab === "layouts" ? (
          <LayoutsView />
        ) : (
          <SkillsView
            skill={skill}
            commands={commands}
            agents={agents}
            worldPacks={worldPacks}
            featurePacks={featurePacks}
            plugins={plugins}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-md px-3 py-1.5 transition-colors " +
        (active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
