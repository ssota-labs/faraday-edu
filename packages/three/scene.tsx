// <Scene3D> — a preconfigured React Three Fiber canvas: perspective camera,
// OrbitControls, ambient + key light, transparent background (so the Card behind
// shows through). Drop it into a <Workbench> center; put procedural meshes (or a
// loaded <Model>) inside. Importing from "@faraday-academy/three" is what pulls three +
// R3F into the bundle — 2D lessons that never import it stay light.
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MoodStage, type Mood } from "./moods";

export function Scene3D(props: {
  children: ReactNode;
  /** Domain mood — sets background, fog, lighting, and decor. Pick the one that
   *  matches the subject (space, cell, lab, physics, abstract). REQUIRED for
   *  domain scenes; "neutral" is transparent and for UI demos only. */
  mood?: Mood;
  height?: number;
  /** Fill the parent instead of a fixed height — for full-viewport (immersive)
   *  hosts. The parent must have a real height (e.g. absolute inset-0). */
  fill?: boolean;
  camera?: [number, number, number];
  fov?: number;
  controls?: boolean;
  autoRotate?: boolean;
}) {
  const { mood = "neutral", height = 420, fill = false, camera = [0, 6, 11], fov = 45, controls = true } = props;

  // Domain scenes that forget `mood` silently render as a flat transparent
  // canvas — catch that in dev so authors don't chase a "why is space white?" bug.
  useEffect(() => {
    if (import.meta.env?.DEV && mood === "neutral") {
      console.warn(
        '[Scene3D] mood="neutral" (default). For a real subject set mood to ' +
          '"space" | "cell" | "lab" | "physics" | "abstract". Neutral is for UI demos only.',
      );
    }
  }, [mood]);

  // Defer the WebGL canvas until the container has a real width — R3F (like
  // Recharts) renders blank if it mounts at 0px (collapsed group, hidden tab).
  const ref = useRef<HTMLDivElement>(null);
  const [sized, setSized] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.clientWidth > 0) setSized(true);
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setSized(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={fill ? "h-full w-full overflow-hidden" : "w-full overflow-hidden rounded-lg"}
      style={fill ? undefined : { height }}
    >
      {sized ? (
        <Canvas camera={{ position: camera, fov }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
          <MoodStage mood={mood} />
          {props.children}
          {controls ? (
            <OrbitControls enablePan={false} minDistance={3} maxDistance={40} autoRotate={props.autoRotate} autoRotateSpeed={0.6} />
          ) : null}
        </Canvas>
      ) : null}
    </div>
  );
}
