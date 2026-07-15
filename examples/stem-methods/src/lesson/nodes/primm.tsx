import {
  Prose,
  Quiz,
  CodeCell,
  Reveal,
  Callout,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";
import { posAt } from "../_shared/uam";

// Pre-compute the expected output so the Predict quiz is grounded in real numbers.
const DT = 1;
const V0 = 0;
const A = 2;
const steps = [0, 1, 2, 3, 4, 5];
const expected = steps.map((t) => posAt(V0, A, t).toFixed(2));
const finalPos = expected[expected.length - 1];

export default function PRIMM() {
  return (
    <MethodShell
      method="PRIMM"
      discipline="Computing / Physics"
      topic="Kinematics"
      title="PRIMM: uniform acceleration in code"
      lead="PRIMM (Predict · Run · Investigate · Modify · Make) is a research-backed sequence for reading and writing programs. We apply it to a loop that accumulates position under constant acceleration — a UAM (uniformly accelerated motion) model."
      phases={["Predict", "Run", "Investigate", "Modify", "Make"]}
      families={["quiz", "code", "reveal", "prose"]}
    >
      <Prose heading="The program — read it first">
        <p>
          Study the code below <em>without running it</em>. The loop models
          uniform acceleration starting from rest:{" "}
          <TeX>{String.raw`x \mathrel{+}= v_0 \Delta t + \tfrac{1}{2}a\,(\Delta t)^2`}</TeX>{" "}
          applied once per second for six steps.
        </p>
      </Prose>

      <Callout title="Phase 1 — Predict (do not run yet)">
        <p className="text-sm">
          Before pressing Run, answer the question below. Committing to a
          prediction makes the feedback from running much stickier.
        </p>
      </Callout>

      <Quiz
        question={`After the loop runs for t = 0 … 5 (six iterations, v0 = ${V0} m/s, a = ${A} m/s², Δt = ${DT} s), what is the final accumulated position x?`}
        options={[
          {
            label: `${finalPos} m`,
            correct: true,
            hint: `Yes — each step adds ½ · ${A} · 1² = ${A / 2} m and the sum is ${finalPos} m. The quadratic growth means each step adds more than the last.`,
          },
          {
            label: `${(parseFloat(finalPos) / 2).toFixed(2)} m`,
            hint: "That's about half the correct answer — a common slip when forgetting the ½ factor.",
          },
          {
            label: `${(steps.length * A).toFixed(2)} m`,
            hint: "This equals a·n — it ignores the ½ and also treats time as a count rather than a continuous variable.",
          },
          {
            label: `${(steps.length * A * DT).toFixed(2)} m`,
            hint: "Close to the above — still missing the ½ in the kinematic formula.",
          },
        ]}
      />

      <Prose heading="Phase 2 — Run">
        <p>
          Now run the cell and check your prediction against the console output.
          Each printed line shows the time step and the running position.
        </p>
      </Prose>

      <CodeCell
        label="UAM position accumulator"
        code={`const v0 = 0;   // initial velocity (m/s)
const a  = 2;   // acceleration  (m/s²)
const dt = 1;   // time step     (s)

let x = 0;
for (let t = 0; t <= 5; t++) {
  x += v0 * dt + 0.5 * a * dt * dt;
  console.log(\`t = \${t}  →  x = \${x.toFixed(2)} m\`);
}
console.log("Final position:", x.toFixed(2), "m");`}
        caption="Phase 3 task: change a to 9.8 and re-run. What does that model?"
      />

      <Prose heading="Phase 3 — Investigate">
        <p>
          Look at the printed values. Notice that the position increment is{" "}
          <em>the same every step</em> — because{" "}
          <TeX>{String.raw`v_0 = 0`}</TeX> and <TeX>{String.raw`\Delta t`}</TeX>{" "}
          is constant, each step adds exactly{" "}
          <TeX>{String.raw`\tfrac{1}{2}a(\Delta t)^2`}</TeX>. The <em>total</em>{" "}
          position, however, grows quadratically with the step count because we
          are adding that fixed increment repeatedly.
        </p>
      </Prose>

      <Reveal label="Why the position is quadratic even though each increment is constant">
        <p>
          Each iteration adds <TeX>{String.raw`\tfrac{1}{2}a(\Delta t)^2`}</TeX>{" "}
          to <em>x</em>. After <em>n</em> steps that sum is{" "}
          <TeX block>{String.raw`x = n \cdot \tfrac{1}{2}a(\Delta t)^2`}</TeX>
          which is linear in <em>n</em> — but <em>n = t/Δt</em>, so{" "}
          <TeX block>{String.raw`x = \tfrac{1}{2}a t^2`}</TeX>
          exactly matching the kinematic formula for constant acceleration from
          rest. The loop is a discrete Euler integration of Newton's second law.
        </p>
      </Reveal>

      <Prose heading="Phase 4 — Modify">
        <p>
          Go back to the code cell and make each of these changes in turn,
          predicting the output before you run:
        </p>
        <ol>
          <li>
            Set <code>a = 9.8</code> — this models free fall near Earth's
            surface (ignoring air resistance).
          </li>
          <li>
            Set <code>v0 = 5</code> with the original <code>a = 2</code> — how
            does a non-zero initial velocity change the increments?
          </li>
          <li>
            Halve <code>dt</code> to <code>0.5</code> and double the loop
            bound — do you get the same final position?
          </li>
        </ol>
      </Prose>

      <Prose heading="Phase 5 — Make">
        <p>
          You have explored the model — now build something new with it. The
          challenge below asks you to extend the loop to track{" "}
          <em>velocity</em> as well as position.
        </p>
      </Prose>

      <CodeCell
        label="Your turn — add velocity tracking"
        code={`// MAKE phase: extend this loop to also print velocity at each step.
// Kinematic update: v += a * dt

const v0 = 3;   // initial velocity (m/s)
const a  = 2;   // acceleration  (m/s²)
const dt = 1;

let x = 0;
let v = v0; // add a velocity variable
for (let t = 0; t <= 5; t++) {
  x += v * dt + 0.5 * a * dt * dt;
  v += a * dt; // update velocity each step
  console.log(\`t=\${t}  x=\${x.toFixed(2)} m  v=\${v.toFixed(2)} m/s\`);
}`}
        caption="Compare the velocity values to velAt(v0, a, t) from the UAM helpers. Do they match?"
      />

      <Quiz
        question="In the Make cell above, why must the velocity update (v += a·dt) come AFTER the position update?"
        options={[
          {
            label: "Because we want to use the velocity at the start of the step to advance position, then update to the end-of-step velocity",
            correct: true,
            hint: "Correct — this is the explicit (forward) Euler method: x advances with v(t), then v advances to v(t+Δt).",
          },
          {
            label: "It doesn't matter — both orders give the same answer",
            hint: "Try swapping them in the cell. The position values change because the update order selects a different Euler scheme.",
          },
          {
            label: "Because JavaScript executes assignments right-to-left",
            hint: "JavaScript executes statements top-to-bottom; the order here is a physics choice, not a language quirk.",
          },
          {
            label: "To avoid dividing by zero",
            hint: "There is no division in this loop — the order is about which value of v feeds into the position formula.",
          },
        ]}
      />
    </MethodShell>
  );
}
