import { useMemo, useState } from "react";
import {
  Prose,
  Quiz,
  Callout,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

const V0 = 12;
const G = 9.8;

function rangeM(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return (V0 * V0 * Math.sin(2 * rad)) / G;
}

export default function InquiryBasedLearning() {
  const [angle, setAngle] = useState(30);
  const r = useMemo(() => rangeM(angle), [angle]);
  const r45 = rangeM(45);

  return (
    <MethodShell
      method="Inquiry-based learning"
      discipline="Science"
      topic="Projectile motion"
      title="IBL: what angle maximizes range?"
      lead="Inquiry-based learning gives learners ownership of the question within clear bounds. You choose what to investigate, then synthesize a claim with limitations."
      phases={["Orient", "Question", "Investigate", "Synthesize"]}
      families={["narrative", "check", "manipulative", "formalism"]}
    >
      <Prose heading="Orient — puzzling situation">
        <p>
          A ball launcher fires at <TeX>{String.raw`v_0 = 12\ \text{m/s}`}</TeX> from
          ground level on Earth (<TeX>{String.raw`g = 9.8\ \text{m/s}^2`}</TeX>).
          The angle can change, but speed and height are fixed.{" "}
          <strong>What do you want to find out?</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Bounds: no air resistance, flat ground, launch and landing at the same
          height. Tools: angle slider and range readout only.
        </p>
      </Prose>

      <Quiz
        question="Which investigable question fits the bounds and tools?"
        options={[
          { label: "How does launch angle affect horizontal range?", correct: true, hint: "Feasible with the slider — you can sweep angle and compare range." },
          { label: "How does ball color affect range?", hint: "Color is outside the model — not investigable with these tools." },
          { label: "What is the maximum height at v₀ = 20 m/s?", hint: "Speed is fixed at 12 m/s in this inquiry." },
          { label: "How does air density change the path?", hint: "Air resistance is explicitly excluded from the bounds." },
        ]}
      />

      <Prose heading="Investigate">
        <p>
          Sweep launch angle and record range. Look for a pattern before reading
          any formula.
        </p>
      </Prose>

      <Workbench
        title="Projectile range lab"
        panelTitle="Your investigation"
        onReset={() => setAngle(30)}
        controls={
          <ControlGroup label="Independent variable">
            <ParamSlider
              label="Launch angle (°)"
              value={angle}
              min={5}
              max={85}
              step={1}
              onChange={setAngle}
            />
          </ControlGroup>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-6">
            <Readout label="Angle" value={`${angle}°`} />
            <Readout label="Range" value={`${r.toFixed(1)} m`} tone="primary" />
            <Readout label="Range at 45°" value={`${r45.toFixed(1)} m`} />
          </div>
          <div
            className="relative h-24 w-full max-w-lg rounded border bg-muted/30"
            aria-label="Range schematic"
          >
            <div
              className="absolute bottom-2 left-4 h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (r / r45) * 70)}%` }}
            />
            <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Bar length scales with range (45° = reference)
            </p>
          </div>
        </div>
      </Workbench>

      <Prose heading="Synthesize">
        <p>
          <strong>Claim:</strong> For fixed <TeX>{String.raw`v_0`}</TeX> and level
          ground, range is maximized near <TeX>{String.raw`45^\circ`}</TeX> because{" "}
          <TeX>{String.raw`\sin 2\theta`}</TeX> peaks at{" "}
          <TeX>{String.raw`90^\circ`}</TeX>.
        </p>
        <TeX block>{String.raw`R = \frac{v_0^2 \sin 2\theta}{g}`}</TeX>
        <p>
          <strong>Limitations:</strong> No air drag, no launch height, point
          particle — real sports balls deviate at high speed or low angle. A next
          inquiry might add measured drag data.
        </p>
      </Prose>

      <Callout title="IBL in one sentence">
        You chose the question, ran a bounded investigation, and reported both
        pattern and limits — not just the answer.
      </Callout>
    </MethodShell>
  );
}
