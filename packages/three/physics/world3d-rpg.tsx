// pack-world3d-rpg — an ADVANCED WorldPack: a walkable 3D world. You drive an
// avatar with WASD (Rapier physics + follow-cam); walking into a node enters its
// lesson. It's still "just a pack" on the same locked curriculum core — proof that
// swapping to a more sophisticated pack yields a real game feel with zero core
// changes. It uses the v2 packState seam to keep the avatar's position across the
// world↔lesson toggle (the core persists it without knowing what a "player" is).
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Html, Line } from "@react-three/drei";
import { Vector3 } from "three";
import type { WorldNode, WorldPack } from "@faraday-academy/kit/world";
import { Scene3D } from "../scene";
import type { Mood } from "../moods";

type Vec3 = [number, number, number];
const SPAN = 16;
const ENTER_RADIUS = 1.7;

interface RpgState {
  avatar: Vec3;
  inside: string | null;
}

const STATUS_COLOR: Record<WorldNode["status"], { color: string; emissive: string; intensity: number }> = {
  complete: { color: "#5eead4", emissive: "#0f766e", intensity: 0.35 },
  active: { color: "#8b9cf6", emissive: "#3b5bdb", intensity: 0.8 },
  available: { color: "#c9cfdb", emissive: "#334155", intensity: 0.2 },
  locked: { color: "#3a3f4b", emissive: "#000000", intensity: 0 },
};

function positions(nodes: WorldNode[]): Record<string, Vec3> {
  const hasCoords = nodes.every((n) => typeof n.meta?.x === "number" && typeof n.meta?.y === "number");
  if (hasCoords) {
    return Object.fromEntries(
      nodes.map((n) => [n.id, [((n.meta!.x as number) / 100) * SPAN - SPAN / 2, 0, ((n.meta!.y as number) / 100) * SPAN - SPAN / 2] as Vec3]),
    );
  }
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const depth: Record<string, number> = {};
  const compute = (id: string, seen: Set<string>): number => {
    if (depth[id] != null) return depth[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    const reqs = byId[id]?.requires ?? [];
    depth[id] = reqs.length ? 1 + Math.max(...reqs.map((r) => compute(r, seen))) : 0;
    return depth[id];
  };
  nodes.forEach((n) => compute(n.id, new Set()));
  const cols: Record<number, string[]> = {};
  nodes.forEach((n) => (cols[depth[n.id]] ??= []).push(n.id));
  const maxDepth = Math.max(0, ...Object.keys(cols).map(Number));
  const pos: Record<string, Vec3> = {};
  for (const [d, ids] of Object.entries(cols)) {
    const x = maxDepth ? (Number(d) / maxDepth) * SPAN - SPAN / 2 : 0;
    ids.forEach((id, i) => (pos[id] = [x, 0, ((i + 1) / (ids.length + 1)) * SPAN - SPAN / 2]));
  }
  return pos;
}

function useKeys() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

function Avatar({
  nodes,
  pos,
  onEnter,
  packState,
  setPackState,
}: {
  nodes: WorldNode[];
  pos: Record<string, Vec3>;
  onEnter: (id: string) => void;
  packState: unknown;
  setPackState: (s: unknown) => void;
}) {
  const saved = (packState as RpgState | null) ?? null;
  // spawn in a corner, clear of every node's entry radius
  const spawn: Vec3 = saved?.avatar ?? [-SPAN / 2 + 1, 1, SPAN / 2 - 1];
  const body = useRef<RapierRigidBody>(null);
  const keys = useKeys();
  const here = useRef(new Vector3(...spawn));
  const inside = useRef<string | null>(saved?.inside ?? null);
  const { camera } = useThree();

  // persist avatar position + which node we're inside when unmounting (e.g. on lesson entry)
  useEffect(() => {
    return () => setPackState({ avatar: [here.current.x, here.current.y, here.current.z], inside: inside.current });
  }, [setPackState]);

  useFrame(() => {
    const b = body.current;
    if (!b) return;
    const k = keys.current;
    const dir = new Vector3(
      (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0),
      0,
      (k["s"] || k["arrowdown"] ? 1 : 0) - (k["w"] || k["arrowup"] ? 1 : 0),
    );
    if (dir.lengthSq() > 0) dir.normalize();
    const v = b.linvel();
    b.setLinvel({ x: dir.x * 6, y: v.y, z: dir.z * 6 }, true);

    const t = b.translation();
    here.current.set(t.x, t.y, t.z);
    // follow camera
    camera.position.lerp(new Vector3(t.x, t.y + 8, t.z + 11), 0.12);
    camera.lookAt(t.x, t.y, t.z);

    // proximity entry — fire only on transition into a node's radius
    let near: string | null = null;
    for (const n of nodes) {
      if (n.status === "locked") continue;
      const p = pos[n.id];
      if (p && Math.hypot(t.x - p[0], t.z - p[2]) < ENTER_RADIUS) {
        near = n.id;
        break;
      }
    }
    if (near && near !== inside.current) {
      inside.current = near;
      onEnter(near);
    } else if (!near) {
      inside.current = null;
    }
  });

  return (
    <RigidBody ref={body} colliders="ball" position={spawn} enabledRotations={[false, false, false]} linearDamping={8}>
      <mesh castShadow>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}

export function createWorld3dRpgPack(options: { mood?: Mood } = {}): WorldPack {
  const mood = options.mood ?? "abstract";
  const Pack: WorldPack = ({ world, onEnter, packState, setPackState }) => {
    const pos = positions(world.nodes);
    return (
      <div className="relative h-full w-full">
        <Scene3D mood={mood} fill camera={[0, 9, 12]} controls={false}>
          <Physics gravity={[0, -12, 0]}>
            {/* floor */}
            <RigidBody type="fixed" position={[0, -0.5, 0]}>
              <mesh receiveShadow>
                <boxGeometry args={[SPAN + 6, 1, SPAN + 6]} />
                <meshStandardMaterial color="#1b2130" />
              </mesh>
            </RigidBody>
            {/* edges */}
            {world.edges.map((e, i) => {
              const a = pos[e.from];
              const b = pos[e.to];
              if (!a || !b) return null;
              return <Line key={i} points={[[a[0], 0.1, a[2]], [b[0], 0.1, b[2]]]} color="#64748b" lineWidth={1} transparent opacity={0.5} />;
            })}
            {/* nodes (visual beacons; proximity is distance-based, no collider needed) */}
            {world.nodes.map((n) => {
              const p = pos[n.id];
              if (!p) return null;
              const s = STATUS_COLOR[n.status];
              return (
                <group key={n.id} position={[p[0], 0.8, p[2]]}>
                  <mesh>
                    <sphereGeometry args={[0.8, 24, 24]} />
                    <meshStandardMaterial color={s.color} emissive={s.emissive} emissiveIntensity={s.intensity} transparent opacity={0.9} />
                  </mesh>
                  <Html position={[0, 1.4, 0]} center distanceFactor={14}>
                    <span className="pointer-events-none rounded bg-background/70 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground backdrop-blur-sm">
                      {n.title}
                    </span>
                  </Html>
                </group>
              );
            })}
            <Avatar nodes={world.nodes} pos={pos} onEnter={onEnter} packState={packState} setPackState={setPackState} />
          </Physics>
        </Scene3D>
      </div>
    );
  };
  Pack.immersive = true;
  Pack.hint = "WASD / arrows to move · walk into a place to enter it";
  return Pack;
}

/** Default walkable 3D world pack. createWorld3dRpgPack({ mood }) to re-theme. */
export const world3dRpgPack = createWorld3dRpgPack();
