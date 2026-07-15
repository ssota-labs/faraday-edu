import { useMemo, useState } from "react";
import {
  Prose,
  Quiz,
  Chart,
  TeX,
  Reveal,
  ParamSlider,
  Readout,
  Workbench,
  ControlGroup,
  Callout,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

const XS = [0, 1, 2, 3, 4, 5];

export default function VariationTheory() {
  const [m, setM] = useState(2);
  const contrast = useMemo(
    () => XS.map((x) => ({ x: String(x), m1: x, m2: 2 * x, m3: 3 * x })),
    [],
  );
  const probe = useMemo(
    () => XS.map((x) => ({ x: String(x), y: m * x })),
    [m],
  );

  return (
    <MethodShell
      method="Variation theory"
      discipline="Math"
      topic="Linear functions"
      title="What stays the same when m changes in y = mx?"
      lead="Vary slope m in y = mx and discern what changes versus what stays invariant."
      phases={["Contrast", "Generalize", "Apply", "Boundary"]}
      families={["data", "manipulative", "check", "formalism"]}
    >
      <Prose heading="Contrast — m = 1, 2, 3 on one grid">
        <p>
          Compare <TeX>{String.raw`y = x`}</TeX>, <TeX>{String.raw`y = 2x`}</TeX>, and{" "}
          <TeX>{String.raw`y = 3x`}</TeX>. Predict which point all three lines share before you
          answer the quiz.
        </p>
      </Prose>

      <Chart
        type="line"
        data={contrast}
        x="x"
        yAxis
        series={[
          { key: "m1", label: "m = 1" },
          { key: "m2", label: "m = 2" },
          { key: "m3", label: "m = 3" },
        ]}
      />

      <Quiz
        question="Which property is invariant for every line y = mx when m = 1, 2, or 3?"
        options={[
          { label: "Each line passes through (0, 0)", correct: true, hint: "y = m·0 = 0 for any m." },
          { label: "Each line has the same slope", hint: "Slope is what we varied." },
          { label: "Each line has the same y when x = 3", hint: "y is 3, 6, and 9 — not the same." },
          { label: "Each line is horizontal", hint: "Nonzero m makes the line rise." },
        ]}
      />

      <Prose heading="Generalize">
        <TeX block>{String.raw`y = mx \Rightarrow (0,0) \text{ on every line}`}</TeX>
      </Prose>

      <Workbench
        title="Apply — vary m"
        panelTitle="Slope"
        controls={
          <ControlGroup label="One dimension at a time">
            <ParamSlider label="m" value={m} min={1} max={3} step={1} onChange={setM} />
          </ControlGroup>
        }
        hud={<Readout label="At x = 2" value={`y = ${2 * m}`} />}
      >
        <Chart type="line" data={probe} x="x" yAxis series={[{ key: "y", label: `y = ${m}x` }]} />
      </Workbench>

      <Reveal label="Boundary — y = mx + b shifts the intercept">
        <p>
          With <TeX>{String.raw`b \neq 0`}</TeX>, the line crosses at{" "}
          <TeX>{String.raw`(0, b)`}</TeX> — the shared-origin invariant breaks. Varying only{" "}
          <TeX>{String.raw`m`}</TeX> in <TeX>{String.raw`y = mx`}</TeX> preserves the anchor you found.
        </p>
      </Reveal>

      <Callout title="Variation theory in one sentence">
        Change one thing at a time until structure appears — then name it.
      </Callout>
    </MethodShell>
  );
}
