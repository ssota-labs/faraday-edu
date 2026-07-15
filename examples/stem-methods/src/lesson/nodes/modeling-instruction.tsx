import { useMemo, useState } from "react";
import {
  Prose,
  Quiz,
  Callout,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  Chart,
  Derivation,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";
import { posAt, velAt, sampleMotion } from "../_shared/uam";

export default function ModelingInstruction() {
  const [v0, setV0] = useState(2);
  const [a, setA] = useState(1.5);
  const tMax = 6;

  const pts = useMemo(() => sampleMotion(v0, a, tMax), [v0, a]);
  const chartData = useMemo(() => pts.map((p) => ({ t: p.t, x: p.x, v: p.v })), [pts]);
  const xNow = posAt(v0, a, tMax);
  const vNow = velAt(v0, a, tMax);
  const carX = Math.min(92, (xNow / 40) * 92);

  return (
    <MethodShell
      method="Modeling Instruction"
      discipline="Physics"
      topic="Uniformly accelerated motion"
      title="Build the constant-acceleration model"
      lead="Modeling Instruction moves from phenomenon to equation to deployment to revision. This flagship UAM unit follows that arc with a cart on a track."
      phases={["Phenomenon", "Model construction", "Deployment", "Revision"]}
      families={["manipulative", "data", "formalism", "check"]}
    >
      <Prose heading="Phase 1 — Phenomenon">
        <p>
          A cart rolls along a straight track. Adjust initial velocity{" "}
          <TeX>{String.raw`v_0`}</TeX> and acceleration <TeX>{String.raw`a`}</TeX>.
          Notice how position curves upward while velocity climbs linearly — the
          signature of constant acceleration.
        </p>
      </Prose>

      <Workbench
        title="Cart on a track"
        panelTitle="Phenomenon controls"
        onReset={() => {
          setV0(2);
          setA(1.5);
        }}
        controls={
          <>
            <ControlGroup label="Initial conditions">
              <ParamSlider label="v₀ (m/s)" value={v0} min={0} max={8} step={0.5} onChange={setV0} />
              <ParamSlider label="a (m/s²)" value={a} min={-2} max={4} step={0.5} onChange={setA} />
            </ControlGroup>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 justify-center">
            <Readout label="x at 6 s" value={`${xNow.toFixed(1)} m`} />
            <Readout label="v at 6 s" value={`${vNow.toFixed(1)} m/s`} tone="primary" />
          </div>
          <div
            className="relative h-16 w-full max-w-lg mx-auto rounded border bg-muted/40"
            aria-label="Cart position on track"
          >
            <div
              className="absolute top-1/2 h-8 w-10 -translate-y-1/2 rounded bg-primary transition-all"
              style={{ left: `${carX}%` }}
            />
          </div>
          <Chart
            type="line"
            data={chartData}
            x="t"
            xType="number"
            yAxis
            legend
            height={220}
            series={[
              { key: "x", label: "Position x (m)" },
              { key: "v", label: "Velocity v (m/s)" },
            ]}
          />
        </div>
      </Workbench>

      <Prose heading="Phase 2 — Model construction">
        <p>
          From the graphs, position grows like <TeX>{String.raw`t^2`}</TeX> while
          velocity grows like <TeX>{String.raw`t`}</TeX>. Step through the
          derivation that links those observations to one kinematic equation.
        </p>
      </Prose>

      <Derivation
        title="Position under constant acceleration (x₀ = 0)"
        steps={[
          { tex: String.raw`a = \frac{\Delta v}{\Delta t}`, note: "acceleration is the rate of change of velocity" },
          { tex: String.raw`v(t) = v_0 + at`, note: "integrate constant a with respect to time" },
          { tex: String.raw`x(t) = \int v(t)\,dt = v_0 t + \tfrac{1}{2}at^2`, note: "integrate velocity to get position" },
        ]}
      />

      <Prose heading="Phase 3 — Deployment (new context)">
        <p>
          A drone hovers, then drops a package from rest at{" "}
          <TeX>{String.raw`h = 45\ \text{m}`}</TeX> with{" "}
          <TeX>{String.raw`a = 9.8\ \text{m/s}^2`}</TeX> downward. Use the model —
          not the sliders above.
        </p>
      </Prose>

      <Quiz
        question="How long until the package hits the ground? (Use x = ½at² with x = 45 m.)"
        options={[
          { label: "≈ 3.0 s", correct: true, hint: "t = √(2x/a) = √(90/9.8) ≈ 3.0 s — same quadratic structure, new surface." },
          { label: "≈ 4.6 s", hint: "Check the square root — did you forget the factor of 2 in ½at²?" },
          { label: "≈ 9.0 s", hint: "That would imply much less acceleration than gravity provides." },
          { label: "≈ 1.5 s", hint: "Too short — free fall from 45 m takes closer to 3 s." },
        ]}
      />

      <Prose heading="Phase 4 — Revision (ConcepTest)">
        <p>
          A common slip: treating acceleration as proportional to speed. Confront
          the misconception before moving on.
        </p>
      </Prose>

      <Quiz
        question="A car's speed doubles while acceleration stays constant. What happens to the displacement in the next second?"
        options={[
          { label: "It doubles, because speed doubled", hint: "Displacement in one second is roughly the speed during that second — but 'next second' depends on current velocity, not a fixed multiplier." },
          { label: "It increases, but not simply doubled — higher speed means more distance per second", correct: true, hint: "Right. With constant a, v grows linearly, so each successive second covers more ground — but the relationship is incremental, not 'double speed → double distance' in one step." },
          { label: "It stays the same, because acceleration is constant", hint: "Constant a means constant change in v, not constant displacement each second." },
          { label: "It halves", hint: "Nothing in constant positive acceleration shrinks displacement." },
        ]}
      />

      <Callout title="Modeling Instruction in one sentence">
        Observe first, derive the model, deploy it somewhere new, then revise when
        evidence or misconceptions push back.
      </Callout>
    </MethodShell>
  );
}
