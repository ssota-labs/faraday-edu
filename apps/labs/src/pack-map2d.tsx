// Labs-local copy of the map2d presentation (which now ships as a copy-in pack —
// `faraday pack add map2d`). Vendored here so the labs preview renders the 2D map
// without depending on the out-of-tree pack source. Keep in rough sync with
// packages/official-packs/map2d/runtime/map2d/map2d.tsx.
import type { WorldNode, WorldPack } from "@/faraday/world";

const W = 720;
const H = 440;
const R = 22;

const STATUS_FILL: Record<WorldNode["status"], string> = {
  complete: "var(--chart-3)",
  active: "var(--primary)",
  available: "var(--card)",
  locked: "var(--muted)",
};

function layout(nodes: WorldNode[]): Record<string, { x: number; y: number }> {
  const hasCoords = nodes.every(
    (n) => typeof n.meta?.x === "number" && typeof n.meta?.y === "number",
  );
  if (hasCoords) {
    return Object.fromEntries(
      nodes.map((n) => [n.id, { x: ((n.meta!.x as number) / 100) * W, y: ((n.meta!.y as number) / 100) * H }]),
    );
  }
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const depth: Record<string, number> = {};
  const compute = (id: string, seen: Set<string>): number => {
    if (depth[id] != null) return depth[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    const reqs = byId[id]?.requires ?? [];
    const v = reqs.length ? 1 + Math.max(...reqs.map((r) => compute(r, seen))) : 0;
    depth[id] = v;
    return v;
  };
  nodes.forEach((n) => compute(n.id, new Set()));
  const cols: Record<number, string[]> = {};
  nodes.forEach((n) => (cols[depth[n.id]] ??= []).push(n.id));
  const maxDepth = Math.max(0, ...Object.keys(cols).map(Number));
  const pos: Record<string, { x: number; y: number }> = {};
  for (const [d, ids] of Object.entries(cols)) {
    const col = Number(d);
    const x = maxDepth ? (col / maxDepth) * (W - 4 * R) + 2 * R : W / 2;
    ids.forEach((id, i) => {
      pos[id] = { x, y: ((i + 1) / (ids.length + 1)) * H };
    });
  }
  return pos;
}

export const map2dPack: WorldPack = ({ world, onEnter, onFocus }) => {
  const pos = layout(world.nodes);
  const byId = Object.fromEntries(world.nodes.map((n) => [n.id, n]));
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--border) 55%, transparent) 1px, transparent 1px)," +
            "linear-gradient(90deg, color-mix(in oklab, var(--border) 55%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, var(--background) 100%)" }}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`${world.title} map`}
      >
        <defs>
          <filter id="fd-map-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {world.edges.map((e, i) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          const open = byId[e.to]?.status !== "locked";
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={open ? "var(--primary)" : "var(--border)"}
              strokeOpacity={open ? 0.5 : 0.6}
              strokeWidth={open ? 2 : 1.5}
              strokeDasharray={open ? undefined : "4 6"}
            />
          );
        })}
        {world.nodes.map((n) => {
          const p = pos[n.id];
          if (!p) return null;
          const locked = n.status === "locked";
          const active = n.status === "active";
          const done = n.status === "complete";
          return (
            <g
              key={n.id}
              role="button"
              aria-label={`${n.title} (${n.status})`}
              tabIndex={locked ? -1 : 0}
              style={{ cursor: locked ? "default" : "pointer" }}
              onClick={() => !locked && onEnter(n.id)}
              onMouseEnter={() => !locked && onFocus(n.id)}
              onFocus={() => !locked && onFocus(n.id)}
              onKeyDown={(e) => {
                if (!locked && (e.key === "Enter" || e.key === " ")) onEnter(n.id);
              }}
            >
              {active ? (
                <circle className="animate-pulse" cx={p.x} cy={p.y} r={R + 9} fill="none" stroke="var(--primary)" strokeOpacity={0.55} strokeWidth={2} />
              ) : null}
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                filter={active || done ? "url(#fd-map-glow)" : undefined}
                style={{ fill: STATUS_FILL[n.status] }}
                stroke={active ? "var(--primary)" : done ? "var(--chart-3)" : locked ? "var(--border)" : "var(--muted-foreground)"}
                strokeWidth={active ? 3 : 2}
                strokeDasharray={locked ? "3 4" : undefined}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={14}
                style={{ fill: done || active ? "var(--primary-foreground)" : locked ? "var(--muted-foreground)" : "var(--foreground)" }}
              >
                {done ? "✓" : locked ? "🔒" : ""}
              </text>
              <text
                x={p.x}
                y={p.y + R + 18}
                textAnchor="middle"
                fontSize={12}
                fontWeight={active ? 600 : 500}
                style={{ fill: locked ? "var(--muted-foreground)" : "var(--foreground)" }}
              >
                {n.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
map2dPack.immersive = true;
map2dPack.hint = "Click an unlocked node to enter · hover for its briefing";
