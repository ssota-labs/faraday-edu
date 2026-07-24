import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useRef, useState } from "react";
import type { Mesh } from "three";

type Props = {
  title: string;
};

/**
 * Blockout scene — replace meshes with the concept model.
 * Primary manipulable: `period` (demo stand-in for orbital / cyclic ideas).
 */
export function LessonScene({ title }: Props) {
  const [period, setPeriod] = useState(4);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [4, 3, 6], fov: 45 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0b1020"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 8, 4]} intensity={1.1} />
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.6}
          sectionSize={2}
          sectionThickness={1.1}
          fadeDistance={28}
          infiniteGrid
        />
        <OrbitingBody period={period} />
        <OrbitControls makeDefault enableDamping />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
          color: "#e8eefc",
        }}
      >
        <header style={{ position: "absolute", top: 20, left: 24 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.08em", opacity: 0.7 }}>3D STEM</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 600 }}>{title}</h1>
        </header>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 220,
            padding: "12px 14px",
            background: "rgba(8, 12, 24, 0.72)",
            border: "1px solid rgba(232, 238, 252, 0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <label style={{ fontSize: 13, opacity: 0.85 }}>
            Period (s): <strong>{period.toFixed(1)}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={12}
            step={0.1}
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            aria-label="Orbital period"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function OrbitingBody({ period }: { period: number }) {
  const body = useRef<Mesh>(null);
  const radius = 1.6 + period * 0.12;

  useFrame(({ clock }) => {
    if (!body.current) return;
    const t = clock.getElapsedTime();
    const angle = (t / Math.max(period, 0.2)) * Math.PI * 2;
    body.current.position.set(Math.cos(angle) * radius, 0.35, Math.sin(angle) * radius);
  });

  return (
    <group>
      <mesh ref={body}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#f0c27a" emissive="#5a3a10" emissiveIntensity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.03, 16, 96]} />
        <meshStandardMaterial color="#7eb6ff" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#f5f0e6" emissive="#665533" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
