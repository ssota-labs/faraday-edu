import {
  Prose,
  Quiz,
  Chart,
  CodeCell,
  Callout,
  TeX,
  Stat,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

const OBSERVED_HEADS = 8;
const FLIPS = 10;

// Expected counts from Binomial(10, 0.5) scaled to 10 000 fair-coin simulations.
const NULL_HIST = [
  { heads: "0", count: 10 },
  { heads: "1", count: 98 },
  { heads: "2", count: 445 },
  { heads: "3", count: 1172 },
  { heads: "4", count: 2057 },
  { heads: "5", count: 2461 },
  { heads: "6", count: 2057 },
  { heads: "7", count: 1172 },
  { heads: "8", count: 445 },
  { heads: "9", count: 98 },
  { heads: "10", count: 10 },
];

const extremeCount = NULL_HIST.filter((b) => Number(b.heads) >= OBSERVED_HEADS).reduce(
  (s, b) => s + b.count,
  0,
);
const pValueApprox = extremeCount / 10000;

export default function SimulationBasedInference() {
  return (
    <MethodShell
      method="Simulation-based inference"
      discipline="Statistics"
      topic="Hypothesis testing"
      title="Fair coin? Eight heads in ten flips"
      lead="A friend flips a coin ten times and reports eight heads. Is the coin fair? Simulation-based inference answers by building a null distribution — many repeats of the fair-coin story — then locating the observed statistic inside it."
      phases={["Statistic", "Simulate null", "Histogram", "Interpret p-value"]}
      families={["prose", "code", "chart", "quiz"]}
    >
      <Prose heading="Phase 1 — Choose the statistic">
        <p>
          The research question is whether the coin is biased toward heads. Under a{" "}
          <strong>fair-coin null</strong>, each flip is independent with{" "}
          <TeX>{String.raw`P(\text{heads}) = 0.5`}</TeX>. We summarise the data with
          one number: the <strong>count of heads</strong> in ten flips.
        </p>
        <p>
          Your friend observed <strong>{OBSERVED_HEADS} heads</strong> out of{" "}
          <strong>{FLIPS} flips</strong>. That is the statistic we will compare to what
          fair coins typically produce.
        </p>
      </Prose>

      <Callout title="Observed statistic">
        <div className="flex flex-wrap gap-4">
          <Stat label="Heads observed" value={OBSERVED_HEADS} />
          <Stat label="Flips" value={FLIPS} />
          <Stat label="Proportion heads" value={`${((OBSERVED_HEADS / FLIPS) * 100).toFixed(0)}%`} />
        </div>
      </Callout>

      <Quiz
        question="Why is 'number of heads in 10 flips' a good test statistic for this question?"
        options={[
          {
            label: "It directly measures how far the data sit from what a fair coin would typically produce",
            correct: true,
            hint: "Under the null, we know the sampling distribution of head counts — extreme values challenge fairness.",
          },
          {
            label: "It proves the coin is unfair whenever it is not exactly 5",
            hint: "Natural variability means fair coins often land away from 5; we need a distribution, not a single cutoff.",
          },
          {
            label: "It replaces the need for any simulation",
            hint: "The statistic is the input to simulation — we still build the null distribution to judge extremeness.",
          },
          {
            label: "It only works when the sample size is 10",
            hint: "Head counts work for any n; ten flips keeps the story concrete.",
          },
        ]}
      />

      <Prose heading="Phase 2 — Simulate the null">
        <p>
          If the coin is fair, what head counts would we see if we repeated the
          ten-flip experiment many times? Run the cell below: each repetition flips a
          fair coin ten times and records the head count. The loop builds an empirical
          null distribution.
        </p>
      </Prose>

      <CodeCell
        label="Fair-coin simulation (10 flips × many reps)"
        code={`const FLIPS = 10;
const REPS = 5000;

function oneRep() {
  let heads = 0;
  for (let i = 0; i < FLIPS; i++) {
    if (Math.random() < 0.5) heads++;
  }
  return heads;
}

const hist = Array.from({ length: FLIPS + 1 }, () => 0);
for (let r = 0; r < REPS; r++) {
  hist[oneRep()]++;
}

console.log("Heads : frequency (out of", REPS, "reps)");
hist.forEach((count, heads) => {
  console.log(String(heads).padStart(2), ":", count);
});

const observed = 8;
const asExtreme = hist.slice(observed).reduce((s, c) => s + c, 0);
console.log("\\nObserved heads:", observed);
console.log("Reps >= observed:", asExtreme);
console.log("Estimated p-value:", (asExtreme / REPS).toFixed(4));`}
        caption="Re-run with a different REPS to see Monte Carlo variability shrink as reps grow."
      />

      <Prose heading="Phase 3 — Histogram of the null distribution">
        <p>
          The bar chart shows {10_000} simulated ten-flip trials under the fair-coin
          null. Most results cluster near five heads. The bar at{" "}
          <strong>{OBSERVED_HEADS} heads</strong> is in the right tail — but how
          unusual is it?
        </p>
      </Prose>

      <Chart
        type="bar"
        data={NULL_HIST}
        x="heads"
        yAxis
        series={[{ key: "count", label: "Simulated frequency" }]}
        height={280}
      />

      <Callout title="Locate the observed statistic">
        <p className="text-sm">
          Shaded in spirit: outcomes with <strong>≥ {OBSERVED_HEADS} heads</strong> occurred{" "}
          {extremeCount.toLocaleString()} times in 10 000 fair-coin simulations — about{" "}
          <TeX>{String.raw`${(pValueApprox * 100).toFixed(1)}\%`}</TeX> of the null
          distribution. That proportion <em>is</em> the (one-sided) p-value estimate.
        </p>
      </Callout>

      <Prose heading="Phase 4 — Interpret the p-value">
        <p>
          The p-value answers: <em>if the coin were fair, how often would we see a result
          at least this extreme?</em> A small p-value means the observed heads would be rare
          under fairness — evidence against the null. A larger p-value means the data are
          plausibly consistent with a fair coin.
        </p>
      </Prose>

      <Quiz
        question={`With about ${(pValueApprox * 100).toFixed(1)}% of fair-coin simulations showing ≥ ${OBSERVED_HEADS} heads, what is the most careful conclusion?`}
        options={[
          {
            label: "The data are somewhat unusual for a fair coin, but not decisive at α = 0.05 — we cannot firmly reject fairness from this alone",
            correct: true,
            hint: "p ≈ 0.055 is just above the common 0.05 threshold; 'fail to reject' is different from 'prove fair'.",
          },
          {
            label: "The coin is definitely fair because 8 is close to the middle",
            hint: "8 is in the upper tail, not the centre — and a single study never proves the null.",
          },
          {
            label: "The coin is definitely biased because 8 > 5",
            hint: "Fair coins often deviate from exactly 5; we judge by the tail probability, not the distance from 5 alone.",
          },
          {
            label: "The p-value proves the friend lied about the flips",
            hint: "A p-value quantifies compatibility with the null model — it says nothing about honesty.",
          },
        ]}
      />
    </MethodShell>
  );
}
