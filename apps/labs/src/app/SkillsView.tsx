import type { Agent, Command, OfficialPack, Pack, Plugin, Skill } from "@/catalog";

type Props = {
  skill: Skill | null;
  commands: Command[];
  agents: Agent[];
  officialPacks: OfficialPack[];
  worldPacks: Pack[];
  featurePacks: Pack[];
  plugins: Plugin[];
};

export function SkillsView({ skill, commands, agents, officialPacks, worldPacks, featurePacks, plugins }: Props) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {skill && (
        <Section title="Skill" color="var(--chart-4)" count={`${skill.references.length} refs`}>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-semibold">{skill.name}</h3>
              <Tag>SKILL.md</Tag>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{skill.description}</p>
            <code className="mt-2 block font-mono text-[11px] text-muted-foreground/70">{skill.relPath}</code>
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phase references</div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {skill.references.map((r) => (
                  <div key={r.file} className="rounded-lg border border-border p-3">
                    <div className="text-[13px] font-medium leading-snug">{r.title}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">{r.file}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {commands.length > 0 && (
        <Section title="Slash commands" color="var(--chart-2)" count={String(commands.length)}>
          <Grid>
            {commands.map((c) => (
              <Card key={c.name} name={`/${c.name}`} desc={c.description} path={c.relPath} />
            ))}
          </Grid>
        </Section>
      )}

      {agents.length > 0 && (
        <Section title="Subagents" color="var(--chart-3)" count={String(agents.length)}>
          <Grid>
            {agents.map((a) => (
              <Card key={a.name} name={a.name} desc={a.description} path={a.relPath} />
            ))}
          </Grid>
        </Section>
      )}

      {officialPacks.length > 0 && (
        <Section title="Official packs" color="var(--chart-5)" count="module packs">
          <Grid>
            {officialPacks.map((p) => (
              <Card
                key={p.id}
                name={p.title}
                desc={p.summary}
                path={p.relPath}
                tag={p.defaultInstall ? `${p.tag} · default` : p.tag}
              />
            ))}
          </Grid>
        </Section>
      )}

      {featurePacks.length > 0 && (
        <Section title="Feature packs" color="var(--chart-1)" count="CLI overlays">
          <Grid>
            {featurePacks.map((p) => (
              <Card key={p.id} name={p.title} desc={p.summary} path={p.relPath} tag={p.tag} />
            ))}
          </Grid>
        </Section>
      )}

      {worldPacks.length > 0 && (
        <Section title="World packs" color="var(--chart-1)" count="curriculum renderers">
          <Grid>
            {worldPacks.map((p) => (
              <Card key={p.id} name={p.title} desc={p.summary} path={p.relPath} tag={p.tag} />
            ))}
          </Grid>
        </Section>
      )}

      {plugins.length > 0 && (
        <Section title="Plugins" color="var(--chart-4)" count={String(plugins.length)}>
          <Grid>
            {plugins.map((p) => (
              <div key={p.name} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.displayName}</h3>
                  <Tag>{p.host}</Tag>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{p.description}</p>
                {p.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.keywords.slice(0, 6).map((k) => (
                      <Tag key={k}>{k}</Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

function Section({ title, color, count, children }: { title: string; color: string; count: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2.5 border-b border-border pb-2">
        <span className="size-2 translate-y-1.5 rounded-full" style={{ background: color }} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function Card({ name, desc, path, tag }: { name: string; desc: string; path: string; tag?: string }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <h3 className="font-mono font-semibold">{name}</h3>
        {tag && <Tag>{tag}</Tag>}
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{desc || "No description."}</p>
      <code className="mt-auto pt-1 font-mono text-[11px] text-muted-foreground/70">{path}</code>
    </article>
  );
}
