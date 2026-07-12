// pack-world3d — a 3D open-world WorldPack (opt-in, needs --3d). A driven adapter
// that plugs into the same curriculum core as pack-linear/pack-map2d: it renders
// the graph as nodes-in-space (click to enter, hover to focus) and emits intents;
// it owns no progression. Reuses <Scene3D> (canvas, OrbitControls, mood).
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import type { Mesh, PerspectiveCamera } from "three";
import type { WorldNode, WorldPack } from "@faraday-academy/runtime/world";
import { Scene3D } from "./scene";
import type { Mood } from "./moods";

type Vec3 = [number, number, number];
const SPAN = 16;

/** Frame the whole node field to the current viewport aspect. The world is a
 *  full-viewport (immersive) layer, so a hardcoded camera clips the outer nodes
 *  at narrow/portrait aspects — this fits the camera to the node bounds on mount
 *  and on resize, keeping the current objective on screen. The user can still
 *  orbit/zoom from the framed start. */
function FitCamera({ positions }: { positions: Record<string, Vec3> }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const pts = Object.values(positions);
    if (!pts.length) return;
    const xs = pts.map((p) => p[0]);
    const zs = pts.map((p) => p[2]);
    // half-extent to frame, in world units, with margin for labels + HUD plates
    const halfX = Math.max(Math.abs(Math.min(...xs)), Math.abs(Math.max(...xs))) + 2.5;
    const halfZ = Math.max(Math.abs(Math.min(...zs)), Math.abs(Math.max(...zs))) + 2.5;
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vHalf = (cam.fov * Math.PI) / 360; // vertical half-FOV in radians
    // distance needed so both extents fit (horizontal FOV = vertical × aspect)
    const distForZ = halfZ / Math.tan(vHalf);
    const distForX = halfX / (Math.tan(vHalf) * aspect);
    const dist = Math.max(distForZ, distForX) * 1.02;
    // keep the original pleasant downward tilt (y/z ≈ 8/14)
    cam.position.set(0, dist * 0.5, dist * 0.88);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, positions]);
  return null;
}

// Every status keeps some emissive glow — on dark moods (space) a purely lit
// sphere reads as a black blob; locked must stay *visible*, just dormant.
const STATUS: Record<WorldNode["status"], { color: string; emissive: string; intensity: number }> = {
  complete: { color: "#5eead4", emissive: "#0f766e", intensity: 0.35 },
  active: { color: "#8b9cf6", emissive: "#3b5bdb", intensity: 0.9 },
  available: { color: "#c9cfdb", emissive: "#64748b", intensity: 0.3 },
  locked: { color: "#4b5266", emissive: "#2a3040", intensity: 0.3 },
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

export function createWorld3dPack(options: { mood?: Mood } = {}): WorldPack {
  const mood = options.mood ?? "space";
  const World3dPack: WorldPack = ({ world, onEnter, onFocus }) => {
    const pos = positions(world.nodes);
    return (
      <Scene3D mood={mood} fill camera={[0, 8, 14]}>
        <FitCamera positions={pos} />
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
  World3dPack.immersive = true;
  World3dPack.hint = "Drag to orbit · click an unlocked node to enter · hover for its briefing";
  return World3dPack;
}

/** Default 3D world pack (space mood). Use createWorld3dPack({ mood }) to re-theme. */
export const world3dPack = createWorld3dPack();
