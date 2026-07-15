import { useState } from "react";
import {
  Prose,
  Quiz,
  Callout,
  Workbench,
  Readout,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";
import { posAt, velAt } from "../_shared/uam";

const V0 = 2;
const A = 3;
const T = 3;
const X_OBS = posAt(V0, A, T);
const V_OBS = velAt(V0, A, T);

export default function PredictObserveExplain() {
  const [committed, setCommitted] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  return (
    <MethodShell
      method="Predict–Observe–Explain"
      discipline="Physics"
      topic="Uniformly accelerated motion"
      title="POE: position at t = 3 s"
      lead="Commit to a prediction before you run the simulation — then reconcile what you expected with what you see."
      phases={["Predict", "Observe", "Explain"]}
      families={["check", "narrative", "manipulative", "formalism"]}
    >
      <Prose heading="Setup">
        <p>
          A cart starts at <TeX>{String.raw`x_0 = 0`}</TeX> with{" "}
          <TeX>{String.raw`v_0 = 2\ \text{m/s}`}</TeX> and constant{" "}
          <TeX>{String.raw`a = 3\ \text{m/s}^2`}</TeX>. You will observe its
          state at <TeX>{String.raw`t = 3\ \text{s}`}</TeX>.
        </p>
      </Prose>

      <Callout title="Phase 1 — Predict (locked)">
        <p className="text-sm">
          Choose an answer and press <strong>Check answer</strong> to lock your
          prediction. The simulation stays hidden until you commit.
        </p>
      </Callout>

      <Quiz
        question={`At t = 3 s, what is the cart's position? (v₀ = 2 m/s, a = 3 m/s²)`}
        onChecked={(correct) => {
          setCommitted(true);
          setPrediction(correct ? "correct" : "wrong");
        }}
        options={[
          { label: "19.5 m", correct: true, hint: `x = v₀t + ½at² = 6 + 13.5 = ${X_OBS.toFixed(1)} m.` },
          { label: "11 m", hint: "That confuses position with velocity at t = 3 s." },
          { label: "9 m", hint: "Check the ½at² term — acceleration contributes 13.5 m here." },
          { label: "6 m", hint: "That ignores the acceleration term entirely." },
        ]}
      />

      {!committed ? (
        <Callout variant="destructive" title="Observation locked">
          <p className="text-sm">Commit to a prediction above before the observe phase unlocks.</p>
        </Callout>
      ) : (
        <>
          <Prose heading="Phase 2 — Observe">
            <p>
              Simulation at <TeX>{String.raw`t = 3\ \text{s}`}</TeX> with the fixed
              parameters. Record what you see.
            </p>
          </Prose>

          <Workbench title="Observe at t = 3 s" panelTitle="Fixed run">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex gap-6">
                <Readout label="t" value={`${T} s`} />
                <Readout label="x" value={`${X_OBS.toFixed(1)} m`} tone="primary" />
                <Readout label="v" value={`${V_OBS.toFixed(1)} m/s`} />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Cart reached <strong>{X_OBS.toFixed(1)} m</strong> with velocity{" "}
                <strong>{V_OBS.toFixed(1)} m/s</strong>.
              </p>
            </div>
          </Workbench>

          <Prose heading="Phase 3 — Explain">
            <p>
              {prediction === "correct"
                ? "Your prediction matched the model. Explain why both v₀t and ½at² were needed."
                : "There is a gap between your prediction and the observation. Name which term you under- or over-counted."}
            </p>
            <TeX block>{String.raw`x = v_0 t + \tfrac{1}{2} a t^2 = 2(3) + \tfrac{1}{2}(3)(3)^2 = 19.5\ \text{m}`}</TeX>
            <p>
              The linear term carries initial motion; the quadratic term accumulates
              the effect of acceleration. POE works because you confront that split
              after committing, not after passively watching.
            </p>
          </Prose>
        </>
      )}
    </MethodShell>
  );
}
