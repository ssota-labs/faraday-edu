// pack-world3d — a 3D open-world WorldPack (opt-in, needs --3d). A driven adapter
// that plugs into the same curriculum core as pack-linear/pack-map2d: it renders
// the graph as nodes-in-space (click to enter, hover to focus) and emits intents;
// it owns no progression. Reuses <Scene3D> (canvas, OrbitControls, mood).
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import type { Mesh } from "three";
import type { WorldNode, WorldPack } from "@/faraday/world";
import { Scene3D } from "@/faraday/three";
import type { Mood } from "@/faraday/three";

type Vec3 = [number, number, number];
const SPAN = 16;

const STATUS: Record<WorldNode["status"], { color: string; emissive: string; intensity: number }> = {
  complete: { color: "#5eead4", emissive: "#0f766e", intensity: 0.35 },
  active: { color: "#8b9cf6", emissive: "#3b5bdb", intensity: 0.9 },
  available: { color: "#c9cfdb", emissive: "#000000", intensity: 0 },
  locked: { color: "#3a3f4b", emissive: "#000000", intensity: 0 },
};

/** Node positions on the ground plane (y=0): author meta.{x,y} (0..100) or a
 *  prerequisite-depth layout (x = progress, z = spread). */
function positions(nodes: WorldNode[]): Record<string, Vec3> {
  const hasCoords = nodes.every((n) => typeof n.meta?.x === "number" && typeof n.meta?.y === "number");
  if (hasCoords) {
    return Object.fromEntries(
      nodes.map((n) => [
        n.id,
        [((n.meta!.x as number) / 100) * SPAN - SPAN / 2, 0, ((n.meta!.y as number) / 100) * SPAN - SPAN / 2] as Vec3,
      ]),
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
  const pos: Record<string, Vec3> = {};
  for (const [d, ids] of Object.entries(cols)) {
    const x = maxDepth ? (Number(d) / maxDepth) * SPAN - SPAN / 2 : 0;
    ids.forEach((id, i) => {
      const z = ((i + 1) / (ids.length + 1)) * SPAN - SPAN / 2;
      pos[id] = [x, 0, z];
    });
  }
  return pos;
}

function NodeMesh({
  node,
  pos,
  onEnter,
  onFocus,
}: {
  node: WorldNode;
  pos: Vec3;
  onEnter: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  const ref = useRef<Mesh>(null);
  const s = STATUS[node.status];
  const locked = node.status === "locked";

  useFrame((state) => {
    if (node.status === "active" && ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.07);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          if (!locked) onEnter(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!locked) {
            onFocus(node.id);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={s.color} emissive={s.emissive} emissiveIntensity={s.intensity} />
      </mesh>
      <Html position={[0, 1.25, 0]} center distanceFactor={13}>
        <span className="pointer-events-none rounded bg-background/70 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground backdrop-blur-sm">
          {node.title}
        </span>
      </Html>
    </group>
  );
}

export function createWorld3dPack(options: { mood?: Mood; height?: number } = {}): WorldPack {
  const mood = options.mood ?? "space";
  const height = options.height ?? 460;
  const World3dPack: WorldPack = ({ world, onEnter, onFocus }) => {
    const pos = positions(world.nodes);
    return (
      <Scene3D mood={mood} height={height} camera={[0, 8, 14]}>
        {world.edges.map((e, i) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          return <Line key={i} points={[a, b]} color="#64748b" lineWidth={1} transparent opacity={0.5} />;
        })}
        {world.nodes.map((n) => {
          const p = pos[n.id];
          if (!p) return null;
          return <NodeMesh key={n.id} node={n} pos={p} onEnter={onEnter} onFocus={onFocus} />;
        })}
      </Scene3D>
    );
  };
  return World3dPack;
}

/** Default 3D world pack (space mood). Use createWorld3dPack({ mood }) to re-theme. */
export const world3dPack = createWorld3dPack();
