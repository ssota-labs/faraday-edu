// Procedural building blocks for code-generated 3D lessons (no assets needed).
// These cover the parametric/astronomy/physics sweet spot: spheres, orbit paths,
// orbiting bodies, and 3D labels. For detailed organic models, load a .glb with
// drei's useGLTF instead (see docs/authoring.md).
import { useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import type { Mesh } from "three";

type Vec3 = [number, number, number];

/** Ellipse points in the XZ plane; semi-major `a` along X, eccentricity `e`.
 * Offset by the focal distance so the central body sits at a focus (Kepler). */
function ellipsePoints(a: number, e: number, segments = 160): Vec3[] {
  const b = a * Math.sqrt(1 - e * e);
  const c = a * e;
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([a * Math.cos(t) - c, 0, b * Math.sin(t)]);
  }
  return pts;
}

/** A stationary sphere (star, nucleus, atom, moon…). */
export function Body(props: {
  position?: Vec3;
  radius?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  const { position = [0, 0, 0], radius = 0.5, color = "#e5e7eb", emissive, emissiveIntensity = 1 } = props;
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
      />
    </mesh>
  );
}

/** The elliptical orbit line for a body. */
export function OrbitPath(props: { a: number; e?: number; color?: string; opacity?: number }) {
  const { a, e = 0, color = "#6b7280", opacity = 0.5 } = props;
  return <Line points={ellipsePoints(a, e)} color={color} lineWidth={1} transparent opacity={opacity} />;
}

/** A sphere that orbits the origin along an ellipse, animated in the render loop. */
export function Planet(props: {
  a: number;
  e?: number;
  size?: number;
  speed?: number;
  color?: string;
  phase?: number;
}) {
  const { a, e = 0, size = 0.35, speed = 0.5, color = "#8b9cf6", phase = 0 } = props;
  const ref = useRef<Mesh>(null);
  const b = a * Math.sqrt(1 - e * e);
  const c = a * e;
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    ref.current?.position.set(a * Math.cos(t) - c, 0, b * Math.sin(t));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/** An HTML label anchored at a 3D point (uses theme text color). */
export function Label3D(props: { position: Vec3; children: ReactNode }) {
  return (
    <Html position={props.position} center distanceFactor={12} className="pointer-events-none select-none">
      <span className="rounded bg-background/70 px-1.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
        {props.children}
      </span>
    </Html>
  );
}
