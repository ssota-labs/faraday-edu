// Node 3 — Einstein's elevator (equivalence principle).
//
// Same cabin, two labels. In "accelerating" mode the cabin sits in deep space
// with rockets pushing it upward at g. In "gravity" mode the cabin sits at rest
// on a planet with surface gravity g. Inside the cabin the ball and the light
// ray behave IDENTICALLY — which is the whole point of the equivalence
// principle. The visualisation is the same in both modes; only the caption
// and reference frame changes.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Segmented, Callout, Quiz } from "@/faraday/blocks";
import { useNode } from "@/faraday/world";

export default function ElevatorLesson() {
  const { complete } = useNode();
  const [mode, setMode] = useState<"accel" | "gravity">("accel");
  const [g, setG] = useState(9.8); // acceleration (or surface gravity), m/s²
  const [vBall, setVBall] = useState(4); // ball's initial horizontal speed, m/s

  // Cabin is 6m wide × 5m tall (toy units). Ball is launched from the left wall
  // at height 4.5m with horizontal velocity vBall. Under acceleration g (or in
  // gravity g) it traces a parabola: y = y0 - 0.5*g*(x/vBall)^2.
  const ballPath = useMemo(() => {
    const y0 = 4.5;
    const w = 6;
    const N = 40;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * w;
      const t = x / vBall;
      const y = y0 - 0.5 * g * t * t;
      if (y < 0) break;
      pts.push([x, y]);
    }
    return pts;
  }, [g, vBall]);

  // Light "ray" fires from the left wall at height 3m, moving right at c_toy.
  // Same equation, just tiny deflection. We amplify c_toy so it's visible.
  const lightPath = useMemo(() => {
    const y0 = 3.0;
    const w = 6;
    const cToy = 12; // "speed of light" in this cabin, m/s (visibly finite)
    const N = 40;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * w;
      const t = x / cToy;
      const y = y0 - 0.5 * g * t * t;
      pts.push([x, y]);
    }
    return pts;
  }, [g]);

  const reset = () => {
    setMode("accel");
    setG(9.8);
    setVBall(4);
  };

  // SVG: 6m × 5m cabin drawn 60 px/m in a 500 × 340 viewbox.
  const px = 60;
  const originX = 90;
  const originY = 320; // floor at y=0 → svg y = 320
  const toSvg = ([x, y]: [number, number]): [number, number] => [originX + x * px, originY - y * px];
  const ballPts = ballPath.map(toSvg);
  const lightPts = lightPath.map(toSvg);
  const ballEnd = ballPts[ballPts.length - 1];

  const modeLabel = mode === "accel"
    ? "Cabin is in deep space, rockets pushing it 'up' with acceleration g."
    : "Cabin sits at rest on a planet with surface gravity g.";

  return (
    <Lesson
      topic="Voyage Log · Node 3"
      title="Equivalence Elevator"
      lead="Sealed cabin, no windows. Can the person inside tell whether they're accelerating in deep space or standing still in gravity? Einstein said: no."
    >
      <Prose>
        <p>
          Toggle between the two scenarios. Watch the thrown ball and the
          horizontally-launched light ray. Their trajectories inside the cabin are
          <strong> identical</strong> — same parabola, same bend. The learner locked
          in the cabin has no experiment that can distinguish these two situations.
          That's the <em>equivalence principle</em>, the seed of general relativity.
        </p>
      </Prose>

      <Workbench
        title="Sealed cabin"
        panelTitle="Setup"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Frame">
              <Segmented
                label="What's outside the cabin?"
                value={mode}
                onChange={(v) => setMode(v as "accel" | "gravity")}
                options={[
                  { value: "accel", label: "Accelerating (deep space)" },
                  { value: "gravity", label: "At rest (in gravity)" },
                ]}
              />
            </ControlGroup>
            <ControlGroup label="Parameters">
              <ParamSlider label={mode === "accel" ? "Acceleration g" : "Surface gravity g"} value={g} min={1} max={20} step={0.5} onChange={setG} format={(v) => `${v.toFixed(1)} m/s²`} />
              <ParamSlider label="Ball throw speed" value={vBall} min={1.5} max={10} step={0.25} onChange={setVBall} format={(v) => `${v.toFixed(2)} m/s`} />
            </ControlGroup>
          </>
        }
      >
        <div className="rounded-lg border bg-card p-2">
          <svg viewBox="0 0 500 360" className="w-full" style={{ maxHeight: 380 }}>
            {/* Cabin walls */}
            <rect x={originX - 8} y={originY - 5 * px - 8} width={6 * px + 16} height={5 * px + 16} fill="none" stroke="var(--border)" strokeWidth={4} rx={6} />
            <rect x={originX} y={originY - 5 * px} width={6 * px} height={5 * px} fill="var(--muted)" opacity={0.25} />
            {/* Floor label */}
            <line x1={originX} y1={originY} x2={originX + 6 * px} y2={originY} stroke="var(--foreground)" strokeWidth={1.5} />
            {/* Ball path */}
            <polyline
              points={ballPts.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            {/* Ball */}
            {ballEnd ? <circle cx={ballEnd[0]} cy={ballEnd[1]} r={7} fill="var(--chart-1)" /> : null}
            <circle cx={toSvg([0, 4.5])[0]} cy={toSvg([0, 4.5])[1]} r={7} fill="var(--chart-1)" opacity={0.3} />
            <text x={originX + 4} y={originY - 4.5 * px - 6} fill="var(--chart-1)" fontSize={11} fontWeight={600}>ball</text>
            {/* Light path */}
            <polyline
              points={lightPts.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="var(--chart-3)"
              strokeWidth={2}
            />
            <text x={originX + 4} y={originY - 3 * px - 6} fill="var(--chart-3)" fontSize={11} fontWeight={600}>light ray</text>
            {/* Outside label — differs by mode */}
            {mode === "accel" ? (
              <g>
                {/* Rocket flames underneath */}
                <path d={`M ${originX + 60} ${originY + 10} q 10 30 20 0 q 10 30 20 0 q 10 30 20 0 q 10 30 20 0`} fill="none" stroke="var(--destructive)" strokeWidth={3} opacity={0.7} />
                <text x={originX + 6 * px + 24} y={originY - 2.5 * px} fill="var(--muted-foreground)" fontSize={12}>↑ a = g (thrust)</text>
              </g>
            ) : (
              <g>
                {/* Ground hatching */}
                {Array.from({ length: 8 }, (_, i) => (
                  <line key={i} x1={originX + i * 46} y1={originY + 6} x2={originX + i * 46 + 20} y2={originY + 26} stroke="var(--muted-foreground)" strokeWidth={1.5} />
                ))}
                <text x={originX + 6 * px + 24} y={originY - 2.5 * px} fill="var(--muted-foreground)" fontSize={12}>↓ gravity g</text>
              </g>
            )}
          </svg>
          <p className="mt-2 px-2 pb-1 text-xs text-muted-foreground">{modeLabel} The paths inside are identical — only the label outside changed.</p>
        </div>
      </Workbench>

      <Callout title="Weak equivalence, strong equivalence">
        Inside a small enough patch, being <em>accelerated</em> is
        indistinguishable from being <em>in a uniform gravitational field</em>. This
        is what tells us gravity isn't a "force" like the others — it's the geometry
        of spacetime you're falling through.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="A physicist wakes up in a sealed cabin. She sees a ball fall to the floor with acceleration g. What can she conclude about the cabin?"
        options={[
          { label: "It is at rest on a planet with surface gravity g.", hint: "That's ONE consistent story, not the only one." },
          { label: "It is accelerating through deep space at g.", hint: "Also consistent — but again, not the only one." },
          { label: "One of the above — no local experiment can distinguish them.", correct: true, hint: "That's the equivalence principle." },
          { label: "It is in orbit around a black hole.", hint: "Free-fall inside an orbit would look weightless, not accelerated." },
        ]}
      />
    </Lesson>
  );
}
