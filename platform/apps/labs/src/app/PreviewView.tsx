import { useMemo, useState } from "react";
import type { Component, ComponentGroup } from "@/catalog";
import { DEMOS } from "@/stories";

const GROUP_DOT: Record<string, string> = {
  blocks: "var(--chart-1)",
  ui: "var(--chart-2)",
  runtime: "var(--chart-3)",
  world: "var(--chart-4)",
  lms: "var(--chart-5)",
};

export function PreviewView({ groups }: { groups: ComponentGroup[] }) {
  const all = useMemo(() => groups.flatMap((g) => g.components), [groups]);
  const firstWithDemo = all.find((c) => DEMOS[c.name]) ?? all[0];
  const [selected, setSelected] = useState<string>(firstWithDemo?.relPath ?? "");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const current = all.find((c) => c.relPath === selected) ?? firstWithDemo;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* sidebar */}
      <aside className="lg:sticky lg:top-[64px] lg:h-[calc(100vh-88px)] lg:overflow-auto">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter components…"
          className="mb-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex flex-col gap-4">
          {groups.map((g) => {
            const items = g.components.filter(
              (c) => !q || c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q),
            );
            if (items.length === 0) return null;
            return (
              <div key={g.id}>
                <div className="mb-1 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: GROUP_DOT[g.id] }} />
                  {g.title}
                  <span className="text-[10px] font-normal">{items.length}</span>
                </div>
                <div className="flex flex-col">
                  {items.map((c) => (
                    <button
                      key={c.relPath}
                      type="button"
                      onClick={() => setSelected(c.relPath)}
                      className={
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors " +
                        (c.relPath === current?.relPath
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground")
                      }
                    >
                      <span className="font-mono text-[13px]">{c.name}</span>
                      {DEMOS[c.name] && <span className="size-1.5 rounded-full bg-primary" title="live preview" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* detail */}
      <main className="min-w-0">{current ? <Detail component={current} /> : <p>Nothing selected.</p>}</main>
    </div>
  );
}

function Detail({ component }: { component: Component }) {
  const demo = DEMOS[component.name];
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-xl font-semibold">{component.name}</h1>
          {component.isUtil && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              util
            </span>
          )}
        </div>
        {(component.summary || demo?.blurb) && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{component.summary || demo?.blurb}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {component.exports.map((e) => (
            <span key={e} className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {e}
            </span>
          ))}
        </div>
        <code className="pt-1 font-mono text-[11px] text-muted-foreground/70">{component.relPath}</code>
      </header>

      {demo ? (
        <>
          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</div>
            <div className="rounded-xl border border-border bg-card p-6">{demo.render()}</div>
          </section>
          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usage</div>
            <pre className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 font-mono text-[12.5px] leading-relaxed">
              {demo.source}
            </pre>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No demo story yet for <span className="font-mono">{component.name}</span>. Add one in{" "}
          <span className="font-mono">src/stories.tsx</span> to preview it live.
        </div>
      )}
    </div>
  );
}
