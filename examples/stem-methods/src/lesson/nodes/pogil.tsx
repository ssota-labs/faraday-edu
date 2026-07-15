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
  NumericAnswer,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";
import { velAt, sampleMotion } from "../_shared/uam";

export default function POGIL() {
  const [v0, setV0] = useState(0);
  const [a, setA] = useState(2);
  const tMax = 8;

  const pts = useMemo(() => sampleMotion(v0, a, tMax), [v0, a]);
  const vtData = useMemo(() => pts.map((p) => ({ t: p.t, v: p.v })), [pts]);
  const appAnswer = velAt(1, 2.5, 4);

  return (
    <MethodShell
      method="POGIL"
      discipline="Physics"
      topic="Velocity–time graphs"
      title="POGIL: slope of a v–t graph"
      lead="Process-Oriented Guided Inquiry Learning uses a sheet rhythm: explore patterns, invent the concept, then apply it to a fresh setup."
      phases={["Explore", "Concept invention", "Application"]}
      families={["manipulative", "data", "check", "formalism"]}
    >
      <Prose heading="Explore — Question 1">
        <p>
          <strong>Role card (Recorder):</strong> Fix{" "}
          <TeX>{String.raw`v_0`}</TeX> and sweep acceleration{" "}
          <TeX>{String.raw`a`}</TeX>. Sketch what you notice about the{" "}
          <TeX>{String.raw`v`}</TeX>–<TeX>{String.raw`t`}</TeX> graph before
          reading ahead.
        </p>
      </Prose>

      <Workbench
        title="v–t graph explorer"
        panelTitle="Explore controls"
        onReset={() => {
          setV0(0);
          setA(2);
        }}
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="v₀ (m/s)" value={v0} min={-2} max={6} step={0.5} onChange={setV0} />
            <ParamSlider label="a (m/s²)" value={a} min={-3} max={5} step={0.5} onChange={setA} />
          </ControlGroup>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-4">
            <Readout label="Slope Δv/Δt" value={`${a.toFixed(1)} m/s²`} tone="primary" />
            <Readout label="v at t = 0" value={`${v0.toFixed(1)} m/s`} />
          </div>
          <Chart
            type="line"
            data={vtData}
            x="t"
            xType="number"
            yAxis
            height={240}
            series={[{ key: "v", label: "Velocity v (m/s)" }]}
          />
        </div>
      </Workbench>

      <Prose heading="Concept invention — Question 2">
        <p>
          <strong>Role card (Spokesperson):</strong> Name the pattern in your own
          words, then check whether your team agrees with the formal statement below.
        </p>
      </Prose>

      <Quiz
        question="For motion with constant acceleration, what does the slope of the v–t graph represent?"
        options={[
          { label: "Acceleration a", correct: true, hint: "Yes — slope = Δv/Δt = a. This is the concept you invent from the explore data." },
          { label: "Displacement x", hint: "Displacement is the area under the v–t curve, not the slope." },
          { label: "Initial velocity v₀", hint: "v₀ is the y-intercept (value at t = 0), not the slope." },
          { label: "Jerk (rate of change of acceleration)", hint: "Jerk would appear if acceleration were changing — here a is constant." },
        ]}
      />

      <Callout title="Formal vocabulary">
        <p className="text-sm">
          Constant acceleration ⇒ linear <TeX>{String.raw`v(t) = v_0 + at`}</TeX> ⇒ slope on a{" "}
          <TeX>{String.raw`v`}</TeX>–<TeX>{String.raw`t`}</TeX> plot equals{" "}
          <TeX>{String.raw`a`}</TeX>.
        </p>
      </Callout>

      <Prose heading="Application — Question 3">
        <p>
          <strong>Role card (Manager):</strong> A new runner starts at{" "}
          <TeX>{String.raw`v_0 = 1\ \text{m/s}`}</TeX> and accelerates at{" "}
          <TeX>{String.raw`a = 2.5\ \text{m/s}^2`}</TeX> for{" "}
          <TeX>{String.raw`t = 4\ \text{s}`}</TeX>. Compute — do not re-use the
          sliders.
        </p>
      </Prose>

      <NumericAnswer
        question="What is the runner's velocity after 4 s? (m/s)"
        answer={appAnswer}
        unit="m/s"
        tolerance={0.05}
        hint="Use v = v₀ + at with the application values, not the explore sliders."
      />
    </MethodShell>
  );
}
