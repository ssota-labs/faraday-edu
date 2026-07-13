import { useState, type ReactNode } from "react";
import { DEMOS } from "@/stories";

// Reference knowledge from the skill's audience.md — the reading-surface archetypes,
// split by scope (a single lesson page vs a whole course) and tagged with the
// audience each defaults to. Audience sets the default; the creator's request and
// the content override it (explicitly NOT a 1:1 mapping).

type LayoutItem = {
  id: string;
  name: string;
  what: string;
  build: string;
  audiences: string[];
  preview?: ReactNode;
  matrix?: boolean;
};
type LayoutGroup = { id: string; title: string; items: LayoutItem[] };

const AUDIENCE_DEFAULTS: { audience: string; method: string; layout: string }[] = [
  { audience: "Children / elementary (~6–12)", method: "CRA", layout: "SlideDeck + game worlds (map2d / world3d)" },
  { audience: "Adolescents / secondary (~13–18)", method: "5E learning cycle", layout: "Scroll (chaptered); paged for younger" },
  { audience: "Undergraduates / STEM", method: "Peer Instruction", layout: "Scroll — dense reading + derivations" },
  { audience: "General adult public", method: "Multimedia principles", layout: "Scroll with short chapters (Course); paged for kiosk" },
  { audience: "Working professionals", method: "First Principles", layout: "Linear Course / linearPack — usefulness, not XP" },
];

const GROUPS: LayoutGroup[] = [
  {
    id: "ref",
    title: "Reference",
    items: [
      {
        id: "audience",
        name: "Audience defaults",
        what: "Audience sets the default reading surface; the creator's request and the content override it — not a 1:1 mapping.",
        build: "",
        audiences: [],
        matrix: true,
      },
    ],
  },
  {
    id: "lesson",
    title: "교재 페이지 · Lesson page",
    items: [
      {
        id: "scroll",
        name: "Book scroll",
        what: "The default reading column — long-form prose + embedded instruments, scrolled like a chapter.",
        build: "<Lesson> as-is",
        audiences: ["Secondary", "Undergrad", "Professionals"],
        preview: DEMOS["Lesson"]?.render(),
      },
      {
        id: "slide-deck",
        name: "Slide deck / tablet",
        what: "Each slide fills the viewport — one idea per screen, prev/next + dots + arrow keys; landscape canvas ⇄ prose.",
        build: "<SlideDeck slides={…}> inside <Lesson>",
        audiences: ["Children"],
        preview: DEMOS["SlideDeck"]?.render(),
      },
    ],
  },
  {
    id: "curriculum",
    title: "커리큘럼 페이지 · Curriculum page",
    items: [
      {
        id: "course",
        name: "Chaptered course",
        what: "Several scroll lessons behind a chapter nav (prev/next, #hash deep links).",
        build: "<Course chapters={…}>",
        audiences: ["General public"],
        preview: DEMOS["Course"]?.render(),
      },
      {
        id: "list",
        name: "Curriculum list",
        what: "A graph of lessons with unlock progression, rendered inline as a doc-style status list.",
        build: "<CourseHost> + linearPack",
        audiences: ["Professionals"],
        preview: DEMOS["host"]?.render(),
      },
      {
        id: "world",
        name: "Game world",
        what: "A full-viewport map / constellation with a HUD; lessons open per node. An immersive game screen.",
        build: "<CourseHost> + map2dPack / world3dPack",
        audiences: ["Children"],
        preview: DEMOS["hud"]?.render(),
      },
    ],
  },
];

const GROUP_DOT: Record<string, string> = {
  ref: "var(--chart-3)",
  lesson: "var(--chart-1)",
  curriculum: "var(--chart-4)",
};

export function LayoutsView() {
  const all = GROUPS.flatMap((g) => g.items);
  const [selected, setSelected] = useState<string>("scroll");
  const current = all.find((i) => i.id === selected) ?? all[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-[64px] lg:h-[calc(100vh-88px)] lg:overflow-auto">
        <div className="flex flex-col gap-4">
          {GROUPS.map((g) => (
            <div key={g.id}>
              <div className="mb-1 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: GROUP_DOT[g.id] }} />
                {g.title}
              </div>
              <div className="flex flex-col">
                {g.items.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setSelected(i.id)}
                    className={
                      "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors " +
                      (i.id === current?.id
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground")
                    }
                  >
                    {i.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="min-w-0">{current && <Detail item={current} />}</main>
    </div>
  );
}

function Detail({ item }: { item: LayoutItem }) {
  if (item.matrix) {
    return (
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Audience → default layout</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{item.what}</p>
        </header>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-semibold">Audience</th>
                <th className="p-3 font-semibold">Method</th>
                <th className="p-3 font-semibold">Default layout</th>
              </tr>
            </thead>
            <tbody>
              {AUDIENCE_DEFAULTS.map((r) => (
                <tr key={r.audience} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.audience}</td>
                  <td className="p-3 text-muted-foreground">{r.method}</td>
                  <td className="p-3 text-muted-foreground">{r.layout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{item.name}</h1>
          {item.audiences.map((a) => (
            <span
              key={a}
              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {a}
            </span>
          ))}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.what}</p>
        <code className="pt-0.5 font-mono text-[12px] text-foreground">{item.build}</code>
      </header>
      {item.preview && (
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</div>
          <div className="overflow-hidden rounded-xl border border-border bg-background p-4">{item.preview}</div>
        </section>
      )}
    </div>
  );
}
