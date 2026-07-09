// pack-map2d — a 2D node-map WorldPack (game-like). Nodes are places on a map,
// edges are paths, colour = status. Uses author-provided meta.{x,y} (0..100) or
// falls back to a prerequisite-depth layout. Driven adapter: reads `world`,
// emits onEnter/onFocus; owns no progression.
import type { WorldNode, WorldPack } from "../types";

const W = 720;
const H = 440;
const R = 26;

const STATUS_FILL: Record<WorldNode["status"], string> = {
  complete: "var(--chart-3)",
  active: "var(--primary)",
  available: "var(--muted-foreground)",
  locked: "var(--border)",
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
  // fallback: columns by prerequisite depth
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
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${world.title} map`}>
        {world.edges.map((e, i) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth={2} />;
        })}
        {world.nodes.map((n) => {
          const p = pos[n.id];
          if (!p) return null;
          const locked = n.status === "locked";
          return (
            <g
              key={n.id}
              role="button"
              aria-label={`${n.title} (${n.status})`}
              tabIndex={locked ? -1 : 0}
              style={{ cursor: locked ? "default" : "pointer" }}
              onClick={() => !locked && onEnter(n.id)}
              onMouseEnter={() => !locked && onFocus(n.id)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                style={{ fill: STATUS_FILL[n.status] }}
                stroke={n.status === "active" ? "var(--primary)" : "var(--card)"}
                strokeWidth={n.status === "active" ? 4 : 3}
              />
              {n.status === "complete" ? (
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={15} style={{ fill: "var(--card)" }}>
                  ✓
                </text>
              ) : null}
              <text x={p.x} y={p.y + R + 16} textAnchor="middle" fontSize={12} style={{ fill: "var(--foreground)" }}>
                {n.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
