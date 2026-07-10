// Node 2 — Gravity assist (slingshot).
//
// Toy model of a planetary flyby: in the planet's frame a flyby is an elastic
// deflection — the spacecraft's speed |v'| doesn't change, only its direction
// (by angle δ). Add the planet's heliocentric velocity U back and the sun-frame
// exit speed can be larger or smaller than entry. Learner adjusts approach
// speed, approach angle (relative to planet motion), and deflection angle δ.
//
// This is an intuition model, not a hyperbolic-trajectory integrator: we don't
// derive δ from an impact parameter, we let the learner set it directly.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Callout, Quiz, Stat } from "@/faraday/blocks";
import { useNode } from "@/faraday/world";

const U = 20; // planet's heliocentric speed (km/s-ish, toy scale). Fixed for clarity.

function rotate([x, y]: [number, number], theta: number): [number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [x * c - y * s, x * s + y * c];
}

export default function SlingshotLesson() {
  const { complete } = useNode();
  const [vInMag, setVInMag] = useState(15); // approach speed in sun frame (km/s)
  const [approachDeg, setApproachDeg] = useState(150); // direction of v_in (0° = along +x planet motion)
  const [deflectDeg, setDeflectDeg] = useState(100); // deflection δ in planet frame

  const model = useMemo(() => {
    const alpha = (approachDeg * Math.PI) / 180;
    const delta = (deflectDeg * Math.PI) / 180;
    const vIn: [number, number] = [vInMag * Math.cos(alpha), vInMag * Math.sin(alpha)];
    const uVec: [number, number] = [U, 0];
    // planet frame
    const vp: [number, number] = [vIn[0] - uVec[0], vIn[1] - uVec[1]];
    const vpOut = rotate(vp, delta);
    // back to sun frame
    const vOut: [number, number] = [vpOut[0] + uVec[0], vpOut[1] + uVec[1]];
    const mag = (v: [number, number]) => Math.hypot(v[0], v[1]);
    return { vIn, vOut, vp, vpOut, uVec, vInMag: mag(vIn), vOutMag: mag(vOut), vpMag: mag(vp), deltaV: mag([vOut[0] - vIn[0], vOut[1] - vIn[1]]) };
  }, [vInMag, approachDeg, deflectDeg]);

  const reset = () => {
    setVInMag(15);
    setApproachDeg(150);
    setDeflectDeg(100);
  };

  // SVG scales: 1 km/s → 4 px. Origin = planet center.
  const scale = 4;
  const cx = 260;
  const cy = 180;
  const arrow = (from: [number, number], to: [number, number], color: string, label?: string) => {
    const x1 = cx + from[0] * scale;
    const y1 = cy - from[1] * scale;
    const x2 = cx + to[0] * scale;
    const y2 = cy - to[1] * scale;
    return (
      <g style={{ color }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2} markerEnd="url(#va-arrow)" />
        {label ? (
          <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 6} fill="currentColor" fontSize={12} fontWeight={600}>
            {label}
          </text>
        ) : null}
      </g>
    );
  };

  return (
    <Lesson
      topic="Voyage Log · Node 2"
      title="Gravity Assist — steal a planet's momentum"
      lead="A close flyby rotates your velocity in the planet's frame. Back in the sun's frame, that free rotation can add — or subtract — real speed."
    >
      <Prose>
        <p>
          In the planet's rest frame, a flyby is an elastic deflection: your speed
          <code> |v′|</code> is unchanged, only its direction rotates by an angle
          <code> δ</code> (set by how close you come). Now boost back into the sun's
          frame by adding the planet's velocity <code>U</code>. Your new heliocentric
          speed <code>|v_out|</code> can be very different from <code>|v_in|</code>
          — that difference is the "assist".
        </p>
      </Prose>

      <Workbench
        title="Flyby (sun frame)"
        panelTitle="Trajectory"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Incoming (sun frame)">
              <ParamSlider label="Approach speed" value={vInMag} min={2} max={30} step={0.5} onChange={setVInMag} format={(v) => `${v.toFixed(1)} km/s`} />
              <ParamSlider label="Approach angle" value={approachDeg} min={0} max={360} step={5} onChange={setApproachDeg} format={(v) => `${v.toFixed(0)}°`} />
            </ControlGroup>
            <ControlGroup label="Flyby geometry">
              <ParamSlider label="Deflection δ (planet frame)" value={deflectDeg} min={0} max={180} step={5} onChange={setDeflectDeg} format={(v) => `${v.toFixed(0)}°`} />
            </ControlGroup>
          </>
        }
      >
        <div className="rounded-lg border bg-card p-2">
          <svg viewBox="0 0 520 360" className="w-full" style={{ maxHeight: 360 }}>
            <defs>
              <marker id="va-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {/* Frame */}
            <rect x={0} y={0} width={520} height={360} fill="var(--card)" />
            {/* Planet */}
            <circle cx={cx} cy={cy} r={16} fill="var(--muted-foreground)" opacity={0.35} />
            <circle cx={cx} cy={cy} r={7} fill="var(--primary)" />
            <text x={cx + 14} y={cy - 12} fill="var(--muted-foreground)" fontSize={11}>planet (moving →)</text>
            {/* Planet velocity U */}
            {arrow([0, 0], [U, 0], "var(--muted-foreground)", "U")}
            {/* Incoming */}
            {arrow([-model.vIn[0] * 1.4, -model.vIn[1] * 1.4], [0, 0], "var(--chart-1)", `v_in ${model.vInMag.toFixed(1)}`)}
            {/* Outgoing */}
            {arrow([0, 0], [model.vOut[0] * 1.4, model.vOut[1] * 1.4], "var(--chart-3)", `v_out ${model.vOutMag.toFixed(1)}`)}
          </svg>
          <p className="mt-2 px-2 pb-1 text-xs text-muted-foreground">
            Blue: incoming velocity in the sun frame. Green: outgoing. Grey: planet's
            velocity <code>U</code>. Arrows are scaled the same.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="|v_in|" value={`${model.vInMag.toFixed(2)} km/s`} />
          <Stat label="|v_out|" value={`${model.vOutMag.toFixed(2)} km/s`} delta={{ text: `${(model.vOutMag - model.vInMag >= 0 ? "+" : "")}${(model.vOutMag - model.vInMag).toFixed(2)}`, tone: model.vOutMag > model.vInMag ? "secondary" : "destructive" }} />
          <Stat label="|v'| planet frame" value={`${model.vpMag.toFixed(2)}`} />
          <Stat label="|Δv|" value={`${model.deltaV.toFixed(2)} km/s`} />
        </div>
      </Workbench>

      <Callout title="Why free energy isn't free">
        The energy the spacecraft gains comes out of the planet's orbital motion.
        The planet's mass is enormous so its slow-down is unmeasurable — but total
        momentum and energy are conserved. Set <code>U → 0</code> (planet at rest)
        and no assist happens: <code>|v_out| = |v_in|</code>.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="Where does the extra kinetic energy of a gained assist come from?"
        options={[
          { label: "The planet's gravity creates it.", hint: "Gravity is conservative — no net work over a closed encounter in the planet's frame." },
          { label: "The planet's own orbital motion.", correct: true, hint: "The planet loses a tiny bit of orbital speed; the spacecraft picks it up." },
          { label: "The spacecraft's thrusters, indirectly.", hint: "The gain works even with engines off — it's purely geometric." },
          { label: "The sun's radiation pressure.", hint: "Not involved in a Keplerian gravity assist." },
        ]}
      />
    </Lesson>
  );
}
