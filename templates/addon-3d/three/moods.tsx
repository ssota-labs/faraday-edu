// Domain moods for <Scene3D>. Each mood sets background, fog, lighting, and
// ambient decor so the canvas *feels* like its subject — space is dark with a
// starfield, a cell is an ethereal teal haze with drifting motes, etc. The
// AGENTS.md contract requires 3D lessons to pick a domain-appropriate mood.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Stars } from "@react-three/drei";
import type { Points as ThreePoints } from "three";

export type Mood = "space" | "cell" | "lab" | "physics" | "abstract" | "neutral";

interface MoodSpec {
  background?: string;
  fog?: [string, number, number];
  ambient: number;
  key: number;
  keyColor: string;
  decor: "stars" | "motes" | "grid" | null;
  decorColor?: string;
}

const MOODS: Record<Mood, MoodSpec> = {
  // astronomy / physics of the cosmos — deep dark + starfield
  space: { background: "#05060f", ambient: 0.22, key: 1.15, keyColor: "#ffffff", decor: "stars" },
  // biology — mysterious bioluminescent haze with floating motes
  cell: { background: "#07161a", fog: ["#0a2028", 9, 32], ambient: 0.5, key: 0.85, keyColor: "#7fe3d0", decor: "motes", decorColor: "#5eead4" },
  // chemistry — clean bright lab
  lab: { background: "#f5f6f9", ambient: 0.8, key: 1.4, keyColor: "#ffffff", decor: "grid", decorColor: "#ccd2de" },
  // mechanics — dim studio with a reference grid + shadows
  physics: { background: "#0e1014", ambient: 0.5, key: 1.5, keyColor: "#ffffff", decor: "grid", decorColor: "#262b35" },
  // math / abstract — minimal dark, no decor
  abstract: { background: "#0b0b12", ambient: 0.42, key: 1.2, keyColor: "#b7b7ff", decor: null },
  // no mood — transparent so the Card behind shows through (UI demos only)
  neutral: { ambient: 0.55, key: 1.4, keyColor: "#ffffff", decor: null },
};

export const MOOD_NAMES = Object.keys(MOODS) as Mood[];

function Motes({ color = "#5eead4", count = 150 }: { color?: string; count?: number }) {
  const ref = useRef<ThreePoints>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 11;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.14} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

/** Applies a mood's background, fog, lights, and decor. Rendered inside <Canvas>. */
export function MoodStage({ mood }: { mood: Mood }) {
  const m = MOODS[mood];
  return (
    <>
      {m.background ? <color attach="background" args={[m.background]} /> : null}
      {m.fog ? <fog attach="fog" args={m.fog} /> : null}
      <ambientLight intensity={m.ambient} />
      <directionalLight position={[6, 8, 4]} intensity={m.key} color={m.keyColor} />
      {m.decor === "stars" ? <Stars radius={120} depth={60} count={2400} factor={4} saturation={0} fade speed={0.5} /> : null}
      {m.decor === "motes" ? <Motes color={m.decorColor} /> : null}
      {m.decor === "grid" ? (
        <Grid args={[50, 50]} cellColor={m.decorColor} sectionColor={m.decorColor} position={[0, -2.6, 0]} infiniteGrid fadeDistance={34} fadeStrength={1.5} />
      ) : null}
    </>
  );
}
