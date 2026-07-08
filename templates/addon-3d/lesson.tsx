// 3D demo lesson (scaffolded with `faraday new --3d`): a code-generated solar
// system. Every object here is procedural Three.js geometry — no assets. This is
// the AUTHOR AREA; rewrite it. The 3D block under src/faraday/three is locked.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, ParamSwitch, Callout, Quiz } from "@/faraday/blocks";
import { Scene3D, Body, OrbitPath, Planet, Label3D } from "@/faraday/three";

const PALETTE = ["#8b9cf6", "#5eead4", "#fbbf24", "#fb7185", "#a78bfa"];

export default function OrbitsLesson() {
  const [speed, setSpeed] = useState(0.5);
  const [ecc, setEcc] = useState(0.2);
  const [count, setCount] = useState(3);
  const [showOrbits, setShowOrbits] = useState(true);

  const planets = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: 3 + i * 2.1,
        e: ecc * (1 - i * 0.15),
        size: 0.3 + (i % 3) * 0.12,
        speed: speed / Math.sqrt(3 + i * 2.1), // outer planets orbit slower (Kepler)
        color: PALETTE[i % PALETTE.length],
        phase: i * 1.7,
      })),
    [count, ecc, speed],
  );

  const reset = () => {
    setSpeed(0.5);
    setEcc(0.2);
    setCount(3);
    setShowOrbits(true);
  };

  return (
    <Lesson
      topic="Astronomy"
      title="How planets orbit"
      lead="A code-generated solar system. Drag to rotate the camera; use the panel to change the orbits. Every body and path here is procedural geometry — no 3D assets."
    >
      <Prose>
        <p>
          Planets trace <strong>ellipses</strong> with the star at one focus. Outer planets move
          slower — a taste of Kepler's third law. Reshape the orbits and watch the motion respond.
        </p>
      </Prose>

      <Workbench
        title="Solar system"
        panelTitle="Orbits"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Motion">
              <ParamSlider label="Speed" value={speed} min={0} max={1.5} step={0.05} onChange={setSpeed} format={(v) => v.toFixed(2)} />
              <ParamSlider label="Eccentricity" value={ecc} min={0} max={0.6} step={0.02} onChange={setEcc} format={(v) => v.toFixed(2)} />
            </ControlGroup>
            <ControlGroup label="Bodies">
              <ParamSlider label="Planets" value={count} min={1} max={5} onChange={setCount} />
              <ParamSwitch label="Show orbit paths" checked={showOrbits} onChange={setShowOrbits} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="space" height={420} camera={[0, 8, 14]}>
          <Body radius={1.1} color="#ffcc55" emissive="#ff9900" emissiveIntensity={0.7} />
          <Label3D position={[0, 1.7, 0]}>Star</Label3D>
          {planets.map((p, i) => (
            <group key={i}>
              {showOrbits ? <OrbitPath a={p.a} e={p.e} /> : null}
              <Planet a={p.a} e={p.e} size={p.size} speed={p.speed} color={p.color} phase={p.phase} />
            </group>
          ))}
        </Scene3D>
      </Workbench>

      <Callout title="Why the ellipse is off-center">
        The star sits at a <em>focus</em> of each ellipse, not its center. The higher the
        eccentricity, the more stretched the orbit and the more off-center the star appears.
      </Callout>

      <Quiz
        question="Where is the star located relative to a planet's elliptical orbit?"
        options={[
          { label: "At the exact center", hint: "That would be a circle, not a general ellipse." },
          { label: "At one of the two foci", correct: true, hint: "Right — Kepler's first law." },
          { label: "Outside the orbit", hint: "The star is always inside the ellipse." },
          { label: "It moves around the orbit too", hint: "The star stays put; the planet orbits it." },
        ]}
      />
    </Lesson>
  );
}
