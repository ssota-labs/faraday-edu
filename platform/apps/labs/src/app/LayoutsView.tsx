import type { ReactNode } from "react";
import { DEMOS } from "@/stories";

// Reference knowledge from the skill's audience.md — the reading-surface archetypes
// and which audience each one defaults to. Audience sets the default; the creator's
// request and the content override it (this is explicitly NOT a 1:1 mapping).

const AUDIENCE_DEFAULTS: { audience: string; method: string; layout: string }[] = [
  { audience: "Children / elementary (~6–12)", method: "CRA", layout: "Paged + game worlds (map2d / world3d)" },
  { audience: "Adolescents / secondary (~13–18)", method: "5E learning cycle", layout: "Scroll (chaptered); paged for younger" },
  { audience: "Undergraduates / STEM", method: "Peer Instruction", layout: "Scroll — dense reading + derivations" },
  { audience: "General adult public", method: "Multimedia principles", layout: "Scroll with short chapters (Course); paged for kiosk" },
  { audience: "Working professionals", method: "First Principles", layout: "Linear Course / linearPack — usefulness, not XP" },
];

const ARCHETYPES: { id: string; name: string; what: string; build: string; audiences: string[]; preview?: ReactNode }[] = [
  {
    id: "scroll",
    name: "Book scroll",
    what: "The default reading column — long-form prose + embedded instruments, scrolled like a chapter.",
    build: "<Lesson> as-is",
    audiences: ["Secondary", "Undergrad", "Professionals"],
    preview: DEMOS["Lesson"]?.render(),
  },
  {
    id: "paged",
    name: "Paged / tablet",
    what: "Each page fills the viewport — one idea per screen, prev/next + dots + arrow keys; landscape canvas ⇄ prose.",
    build: "<Paged pages={…}> inside <Lesson>",
    audiences: ["Children"],
    preview: DEMOS["Paged"]?.render(),
  },
  {
    id: "course",
    name: "Chaptered course",
    what: "Several scroll lessons behind a chapter nav (prev/next, #hash deep links).",
    build: "<Course chapters={…}>",
    audiences: ["General public"],
    preview: DEMOS["Course"]?.render(),
  },
  {
    id: "world",
    name: "Game world",
    what: "A full-viewport map / constellation with a HUD; lessons open per node with unlock progression.",
    build: "<CurriculumHost> + game pack (map2dPack / world3dPack)",
    audiences: ["Children"],
    preview: DEMOS["hud"]?.render(),
  },
];

export function LayoutsView() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Layouts</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The reading surface a course uses. <b className="text-foreground">Audience sets the default</b>; the creator's
          request and the content override it — this is deliberately not a 1:1 mapping. From the skill's{" "}
          <code className="code">audience.md</code>.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-border pb-2 text-lg font-semibold">Audience → default layout</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-border pb-2 text-lg font-semibold">Layout archetypes</h2>
        <div className="flex flex-col gap-5">
          {ARCHETYPES.map((a) => (
            <article key={a.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{a.name}</h3>
                {a.audiences.map((aud) => (
                  <span
                    key={aud}
                    className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {aud}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{a.what}</p>
              <code className="mt-2 mb-4 inline-block font-mono text-[12px] text-foreground">{a.build}</code>
              {a.preview && <div className="overflow-hidden rounded-lg border border-border bg-background p-4">{a.preview}</div>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
