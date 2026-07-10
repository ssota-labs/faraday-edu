// Node 1 — Kepler's 2nd law: equal areas in equal times.
//
// The learner drags the eccentricity and the "wedge start" phase. Two coloured
// sector wedges are drawn from the star to a pair of arc segments — each is
// swept in the SAME dt of MEAN anomaly (time), so by Kepler's 2nd law their
// areas must be equal even when the arcs look wildly different.
//
// The scene solves Kepler's equation M = E − e·sinE numerically so the planet
// speeds up near periapsis, unlike <Planet/> (which moves at a constant rate
// — that helper is a decoration, not a Kepler integrator; see authoring.md).
import { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Callout, Quiz, Stat } from "@/faraday/blocks";
import { Scene3D, Body, OrbitPath, Label3D } from "@/faraday/three";
import { useNode } from "@/faraday/world";

const A = 5; // semi-major axis (fixed; eccentricity is the interesting knob)

// Solve M = E - e sin E for E (Newton's method — converges in ~5 iters for e<0.9).
function eccentricAnomaly(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 8; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

type Vec3 = [number, number, number];

/** Position on the Kepler ellipse for mean anomaly M (radians). Focus at origin. */
function keplerPos(M: number, e: number): Vec3 {
  const b = A * Math.sqrt(1 - e * e);
  const c = A * e;
  const E = eccentricAnomaly(M, e);
  return [A * Math.cos(E) - c, 0, b * Math.sin(E)];
}

/** Build the arc polygon on the ellipse between M1 and M2 (excluding the two
 *  origin endpoints of the wedge). */
function arcSamples(M1: number, M2: number, e: number, segments = 40): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const M = M1 + ((M2 - M1) * i) / segments;
    pts.push(keplerPos(M, e));
  }
  return pts;
}

/** Build a closed wedge line: origin → arc(M1..M2) → origin, for drawing. */
function wedgePoints(M1: number, M2: number, e: number, segments = 40): Vec3[] {
  return [[0, 0, 0], ...arcSamples(M1, M2, e, segments), [0, 0, 0]];
}

/** Shoelace area of a closed 2D polygon in the y=0 plane (x, z coords). */
function polygonArea(poly: Vec3[]): number {
  let s = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    s += poly[i][0] * poly[i + 1][2] - poly[i + 1][0] * poly[i][2];
  }
  return Math.abs(s) / 2;
}

/** A planet that actually obeys Kepler's 2nd law (speeds up near periapsis). */
function KeplerPlanet({ e, speed = 0.35 }: { e: number; speed?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    const M = state.clock.elapsedTime * speed;
    const [x, y, z] = keplerPos(M, e);
    ref.current?.position.set(x, y, z);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshStandardMaterial color="#8b9cf6" />
    </mesh>
  );
}

export default function KeplerLesson() {
  const { complete } = useNode();
  const [ecc, setEcc] = useState(0.55);
  const [phaseA, setPhaseA] = useState(0.0); // fraction of orbit (0..1) where wedge A starts
  const [phaseB, setPhaseB] = useState(0.5); // wedge B start
  const dtFrac = 0.08; // both wedges sweep the same fraction of orbital period

  const { wedgeAPts, wedgeBPts, areaA, areaB, arcLenA, arcLenB, periEdge, apoEdge } = useMemo(() => {
    const M1a = phaseA * Math.PI * 2;
    const M2a = M1a + dtFrac * Math.PI * 2;
    const M1b = phaseB * Math.PI * 2;
    const M2b = M1b + dtFrac * Math.PI * 2;
    const wA = wedgePoints(M1a, M2a, ecc);
    const wB = wedgePoints(M1b, M2b, ecc);
    const arclen = (poly: Vec3[]): number => {
      // First and last points are the origin (focus); skip those.
      let d = 0;
      for (let i = 2; i < poly.length - 1; i++) {
        d += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][2] - poly[i - 1][2]);
      }
      return d;
    };
    return {
      wedgeAPts: wA,
      wedgeBPts: wB,
      areaA: polygonArea(wA),
      areaB: polygonArea(wB),
      arcLenA: arclen(wA),
      arcLenB: arclen(wB),
      periEdge: keplerPos(0, ecc),
      apoEdge: keplerPos(Math.PI, ecc),
    };
  }, [ecc, phaseA, phaseB]);

  const reset = () => {
    setEcc(0.55);
    setPhaseA(0.0);
    setPhaseB(0.5);
  };

  const pctDiff = Math.abs(areaA - areaB) / ((areaA + areaB) / 2) * 100;

  return (
    <Lesson
      topic="Voyage Log · Node 1"
      title="Kepler Orbit — equal areas, equal times"
      lead="Drag two wedges around the same orbit. Each covers the same slice of TIME. Their areas stay equal — that's Kepler's 2nd law."
    >
      <Prose>
        <p>
          A planet on an ellipse is <strong>not</strong> a clock that ticks off equal
          <em> arc lengths</em> per second. It ticks off equal <strong>areas</strong>.
          Near periapsis (closest to the star) it flies through a long thin arc; near
          apoapsis (farthest) it crawls through a short fat arc. Same time, same area.
        </p>
        <p>
          Below, wedge <span className="text-primary font-medium">A</span> and wedge
          <span className="text-primary font-medium"> B</span> each cover the same
          fraction of the orbital period. Watch the arc lengths differ wildly while
          the areas stay locked together.
        </p>
      </Prose>

      <Workbench
        title="Kepler wedges"
        panelTitle="Orbit"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Orbit shape">
              <ParamSlider label="Eccentricity" value={ecc} min={0} max={0.85} step={0.02} onChange={setEcc} format={(v) => v.toFixed(2)} />
            </ControlGroup>
            <ControlGroup label="Wedges (same Δt each)">
              <ParamSlider label="Wedge A start" value={phaseA} min={0} max={0.92} step={0.01} onChange={setPhaseA} format={(v) => `${(v * 100).toFixed(0)}%`} />
              <ParamSlider label="Wedge B start" value={phaseB} min={0} max={0.92} step={0.01} onChange={setPhaseB} format={(v) => `${(v * 100).toFixed(0)}%`} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="space" height={420} camera={[0, 9, 12]}>
          <Body radius={0.9} color="#ffcc55" emissive="#ff9900" emissiveIntensity={0.7} />
          <Label3D position={[0, 1.5, 0]}>Star (focus)</Label3D>
          <OrbitPath a={A} e={ecc} color="#94a3b8" opacity={0.55} />
          <Line points={wedgeAPts} color="#8b9cf6" lineWidth={2} transparent opacity={0.9} />
          <Line points={wedgeBPts} color="#f472b6" lineWidth={2} transparent opacity={0.9} />
          <KeplerPlanet e={ecc} />
          <Label3D position={[periEdge[0], 0.9, periEdge[2]]}>periapsis</Label3D>
          <Label3D position={[apoEdge[0], 0.9, apoEdge[2]]}>apoapsis</Label3D>
        </Scene3D>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Area A" value={areaA.toFixed(3)} />
          <Stat label="Area B" value={areaB.toFixed(3)} delta={{ text: `Δ ${pctDiff.toFixed(1)}%`, tone: pctDiff < 1 ? "secondary" : "destructive" }} />
          <Stat label="Arc A" value={arcLenA.toFixed(2)} />
          <Stat label="Arc B" value={arcLenB.toFixed(2)} />
        </div>
      </Workbench>

      <Callout title="Why they stay equal">
        Angular momentum <code>L = m r²(dθ/dt)</code> is constant for a central force.
        The wedge area swept per unit time is <code>dA/dt = L / (2m)</code> — also
        constant. So equal <em>times</em> ⇒ equal <em>areas</em>, no matter where on
        the orbit you sample. Arc <em>length</em> is free to vary; area is not.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="Two wedges cover the same amount of TIME on a very eccentric orbit. What must be true?"
        options={[
          { label: "Their arc lengths are equal.", hint: "Arc length varies — the planet flies faster near periapsis." },
          { label: "Their areas are equal.", correct: true, hint: "Kepler's 2nd law: equal areas in equal times." },
          { label: "The wedge near periapsis has a smaller area.", hint: "Same time ⇒ same area, regardless of position." },
          { label: "Both wedges are triangles.", hint: "The arc side is curved; area equality is what matters, not shape." },
        ]}
      />
    </Lesson>
  );
}
