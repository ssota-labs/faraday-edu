// Example — a CONTINUOUS lesson: the reader turns knobs and the picture responds
// live (no useStepper). Copy into src/lesson/lesson.tsx to try it. This is the
// other canonical shape alongside the stepped bubble-sort demo in lesson.tsx.
//
// Pattern: hold parameters in useState, derive the visualization with useMemo,
// drive it with <ParamSlider>/<Segmented>, and read results with <Chart>/<Stat>.
import { useMemo, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup,
  ParamSlider, Segmented, Chart, Stat, Callout, Quiz,
} from "@faraday-academy/runtime/blocks";

const PERIODS: Record<string, number> = { annual: 1, monthly: 12, daily: 365 };

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(6); // percent / year
  const [years, setYears] = useState(30);
  const [freq, setFreq] = useState("monthly");

  // Derived model — recomputed only when an input changes.
  const n = PERIODS[freq];
  const r = rate / 100;
  const data = useMemo(
    () =>
      Array.from({ length: years + 1 }, (_, t) => ({
        year: t,
        balance: Math.round(principal * (1 + r / n) ** (n * t)),
      })),
    [principal, r, n, years],
  );
  const finalBalance = data[data.length - 1].balance;
  const doublingYears = r > 0 ? Math.log(2) / (n * Math.log(1 + r / n)) : Infinity;

  return (
    <Lesson topic="Finance" title="Compound interest & the Rule of 72"
      lead="Turn the knobs and watch money grow on itself — then see where 'the Rule of 72' comes from.">
      <Prose><p>Interest earns interest. Small changes in rate or frequency compound into large differences over time.</p></Prose>

      <Workbench
        title="Growth" panelTitle="Assumptions"
        onReset={() => { setPrincipal(1000); setRate(6); setYears(30); setFreq("monthly"); }}
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="Principal" value={principal} min={100} max={10000} step={100}
              onChange={setPrincipal} format={(v) => `$${v.toLocaleString()}`} />
            <ParamSlider label="Annual rate" value={rate} min={0} max={20} step={0.5}
              onChange={setRate} format={(v) => `${v}%`} />
            <ParamSlider label="Years" value={years} min={1} max={50} onChange={setYears} />
            <Segmented label="Compounding" value={freq} onChange={setFreq}
              options={[{ value: "annual", label: "Annual" }, { value: "monthly", label: "Monthly" }, { value: "daily", label: "Daily" }]} />
          </ControlGroup>
        }
      >
        <Chart type="line" data={data} x="year"
          series={[{ key: "balance", label: "Balance" }]} yAxis />
        <div className="mt-4 flex gap-8">
          <Stat label="Final balance" value={`$${finalBalance.toLocaleString()}`} />
          <Stat label="Doubles in" value={Number.isFinite(doublingYears) ? `${doublingYears.toFixed(1)} yr` : "—"}
            delta={{ text: `Rule of 72 ≈ ${(72 / rate).toFixed(0)} yr`, tone: "secondary" }} />
        </div>
      </Workbench>

      <Callout title="The Rule of 72">
        Dividing 72 by the percent rate estimates the doubling time — compare it to the exact value above.
      </Callout>

      <Quiz question="At 6% per year, roughly how long to double your money?"
        options={[
          { label: "~6 years", hint: "That's 72 ÷ 12, not 72 ÷ 6." },
          { label: "~12 years", correct: true, hint: "72 ÷ 6 = 12 — matches the exact doubling time." },
          { label: "~30 years", hint: "That's the whole horizon, not the doubling time." },
        ]} />
    </Lesson>
  );
}
