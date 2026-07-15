import { useMemo } from "react";
import {
  Prose,
  Quiz,
  Callout,
  Chart,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";
import { velAt } from "../_shared/uam";

const G = 9.8;
const T_MAX = 4;
const STEPS = 20;

function fallSeries(label: string) {
  const rows: Record<string, number | string>[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = (T_MAX * i) / STEPS;
    rows.push({ t, [label]: velAt(0, G, t) });
  }
  return rows;
}

export default function ArgumentDrivenInquiry() {
  const light = useMemo(() => fallSeries("feather"), []);
  const heavy = useMemo(() => fallSeries("hammer"), []);
  const evidence = useMemo(() => {
    return light.map((row, i) => ({
      t: row.t,
      feather: row.feather as number,
      hammer: heavy[i].hammer as number,
    }));
  }, [light, heavy]);

  return (
    <MethodShell
      method="Argument-driven inquiry"
      discipline="Physics"
      topic="Mass and free fall"
      title="ADI: does mass determine acceleration?"
      lead="Argument-driven inquiry builds claims from evidence, subjects arguments to critique, then revises. Here: free fall in vacuum."
      phases={["Question", "Investigation", "Argument review", "Revise"]}
      families={["narrative", "check", "data"]}
    >
      <Prose heading="Research question">
        <p>
          In a vacuum chamber on the Moon, a feather and a hammer are dropped from
          rest. <strong>Does the heavier object accelerate faster?</strong>
        </p>
      </Prose>

      <Quiz
        question="Claim (before evidence): which statement will you defend?"
        options={[
          { label: "The hammer accelerates faster because it has more mass", hint: "A common intuition — hold this claim until you inspect the data." },
          { label: "Both objects accelerate at the same rate g in vacuum", correct: true, hint: "This is the claim supported by ideal free-fall evidence — but you must still justify it with data." },
          { label: "The feather accelerates faster because it is lighter", hint: "Lightness does not increase g in vacuum." },
          { label: "Neither accelerates — vacuum removes gravity", hint: "Vacuum removes air drag, not gravitational acceleration." },
        ]}
      />

      <Prose heading="Investigation — evidence">
        <p>
          Simulated velocity–time data for each object with{" "}
          <TeX>{String.raw`a = g = 9.8\ \text{m/s}^2`}</TeX> and no air resistance.
          Trace the curves — what do they share?
        </p>
      </Prose>

      <Chart
        type="line"
        data={evidence}
        x="t"
        xType="number"
        yAxis
        legend
        height={260}
        series={[
          { key: "feather", label: "Feather v (m/s)" },
          { key: "hammer", label: "Hammer v (m/s)" },
        ]}
      />

      <Callout title="Evidence note">
        <p className="text-sm">
          Both series follow <TeX>{String.raw`v = gt`}</TeX> — identical slopes.
          Mass does not appear in the kinematic model for free fall in vacuum.
        </p>
      </Callout>

      <Prose heading="Peer review — flawed sample argument">
        <p>Read a teammate's draft and find the weakest link.</p>
        <blockquote className="border-l-4 pl-4 text-sm text-muted-foreground">
          "The hammer hits first in classroom demos, so heavier objects must have
          larger acceleration. Mass is in Newton's second law, therefore bigger mass
          means bigger acceleration."
        </blockquote>
      </Prose>

      <Quiz
        question="What is the critical flaw in the sample argument?"
        options={[
          { label: "It confuses everyday air-resistance demos with vacuum free fall", correct: true, hint: "Exactly — classroom 'hammer first' demos include drag; vacuum data show equal g." },
          { label: "It uses the wrong value of g", hint: "g is not the main error — the argument misapplies evidence from air-filled rooms." },
          { label: "It ignores that velocity is constant", hint: "Free-fall velocity is not constant — it grows linearly with t." },
          { label: "Mass is not in Newton's second law", hint: "Mass is in F = ma — the flaw is inferring acceleration from mass alone without net force." },
        ]}
      />

      <Prose heading="Revise">
        <p>
          <strong>Revised claim:</strong> In vacuum, all objects at the same
          location fall with the same acceleration <TeX>{String.raw`g`}</TeX>,
          independent of mass. Classroom demos where heavy objects land first are
          explained by air resistance, not by mass determining{" "}
          <TeX>{String.raw`a`}</TeX>.
        </p>
      </Prose>
    </MethodShell>
  );
}
