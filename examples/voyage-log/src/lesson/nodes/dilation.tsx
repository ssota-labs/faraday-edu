// Node 4 — Gravitational time dilation.
//
// Toy model uses the Schwarzschild proper-time ratio for a stationary observer:
//     dτ/dt = √(1 − r_s/r)
// where r_s = 2GM/c² is the Schwarzschild radius. This is only exact for a
// static observer in a static spherical spacetime — see the Callout. It's the
// right shape (rate → 0 as r → r_s, rate → 1 as r → ∞) for building intuition.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart, Callout, Quiz, Stat } from "@/faraday/blocks";
import { useNode } from "@/faraday/world";

const RS_MIN = 1.05; // r/r_s can't be ≤ 1 (event horizon), so start just above.

export default function DilationLesson() {
  const { complete } = useNode();
  const [rOverRs, setROverRs] = useState(3.0); // r / r_s for the "deep" observer
  const [years, setYears] = useState(10); // wall-clock time far away, in years

  const ratio = useMemo(() => Math.sqrt(1 - 1 / rOverRs), [rOverRs]);

  const chartData = useMemo(() => {
    const points: { r: number; rate: number }[] = [];
    for (let x = RS_MIN; x <= 8; x += 0.05) {
      points.push({ r: Number(x.toFixed(2)), rate: Number(Math.sqrt(1 - 1 / x).toFixed(4)) });
    }
    return points;
  }, []);

  const currentDeepYears = ratio * years;
  const drift = years - currentDeepYears;
  const reset = () => {
    setROverRs(3);
    setYears(10);
  };

  // "You are here" as a second series — null gaps (Recharts) so we don't draw a
  // 0→y spike; only the current bucket gets a point.
  const markedData = useMemo(
    () =>
      chartData.map((d) => ({
        ...d,
        marker: Math.abs(d.r - Number(rOverRs.toFixed(2))) < 0.03 ? ratio : null,
      })),
    [chartData, rOverRs, ratio],
  );

  return (
    <Lesson
      topic="Voyage Log · Node 4"
      title="Gravitational Time Dilation"
      lead="Two identical clocks: one hovering far above a mass, one hovering deep in its gravity well. After a year has passed 'up there', the deep clock has ticked less."
    >
      <Prose>
        <p>
          A clock deeper in a gravitational potential runs <strong>slower</strong>
          than an identical clock far away. In this toy model, the rate ratio for a
          stationary observer at radius <code>r</code> around a mass with
          Schwarzschild radius <code>r_s</code> is:
        </p>
        <p>
          <code>dτ / dt = √(1 − r_s / r)</code>
        </p>
        <p>
          As <code>r → r_s</code>, the deep clock nearly stops. As <code>r → ∞</code>,
          it matches the far clock. Below, sweep <code>r/r_s</code> and see how many
          "deep years" go by while <code>{years} yr</code> pass far away.
        </p>
      </Prose>

      <Workbench
        title="Two clocks"
        panelTitle="Well depth"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Deep observer">
              <ParamSlider
                label="r / r_s"
                value={rOverRs}
                min={1.05}
                max={8}
                step={0.05}
                onChange={setROverRs}
                format={(v) => v.toFixed(2)}
              />
            </ControlGroup>
            <ControlGroup label="Far observer">
              <ParamSlider label="Elapsed (far clock)" value={years} min={1} max={100} step={1} onChange={setYears} format={(v) => `${v.toFixed(0)} yr`} />
            </ControlGroup>
          </>
        }
      >
        <Chart
          type="area"
          data={markedData}
          x="r"
          series={[
            { key: "rate", label: "dτ / dt" },
            { key: "marker", label: "You are here" },
          ]}
          yAxis
          height={220}
        />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Rate ratio" value={ratio.toFixed(4)} delta={{ text: `at r/r_s = ${rOverRs.toFixed(2)}`, tone: "secondary" }} />
          <Stat label="Deep clock reads" value={`${currentDeepYears.toFixed(2)} yr`} />
          <Stat label="Drift" value={`${drift.toFixed(2)} yr`} delta={{ text: drift > 0 ? "deep clock behind" : "in sync", tone: drift > 0 ? "destructive" : "secondary" }} />
        </div>
      </Workbench>

      <Callout title="Toy model, honest name">
        This uses the <em>Schwarzschild</em> rate ratio for a <strong>static</strong>
        observer outside a non-rotating, spherically symmetric mass. It's not the
        general answer (moving observers, rotating masses, and time-varying fields
        each change the formula), but the shape is right: the deeper you are, the
        slower your clock. Real GPS satellites correct for exactly this effect.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="If two identical clocks separate — one deep, one far — and later meet again, which one shows LESS elapsed proper time?"
        options={[
          { label: "The far clock (higher in the well).", hint: "Higher-up clocks run FASTER, so they accumulate MORE time." },
          { label: "The deep clock (lower in the well).", correct: true, hint: "Deeper = slower rate = less elapsed proper time." },
          { label: "They must agree — clocks are clocks.", hint: "That's the classical intuition; relativity says otherwise." },
          { label: "Depends on which one is moving.", hint: "That's SR (velocity) dilation. This node is about gravitational (potential) dilation with static observers." },
        ]}
      />
    </Lesson>
  );
}
