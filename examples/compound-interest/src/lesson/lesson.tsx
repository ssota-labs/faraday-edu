// S1 demo — Compound interest: sliders drive a growth chart and final Stat.
// Stage 1 soft-launch Wow lesson (2D).
import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  Callout,
  Quiz,
  Stat,
  TeX,
  Derivation,
  Reveal,
} from "@faraday-academy/runtime/blocks";

function futureValue(principal: number, ratePct: number, years: number, compoundsPerYear: number) {
  const r = ratePct / 100;
  const n = compoundsPerYear;
  if (n <= 0) return principal;
  return principal * Math.pow(1 + r / n, n * years);
}

function buildSeries(principal: number, ratePct: number, years: number, compoundsPerYear: number) {
  const points: { year: number; balance: number; linear: number }[] = [];
  for (let y = 0; y <= years; y++) {
    points.push({
      year: y,
      balance: futureValue(principal, ratePct, y, compoundsPerYear),
      linear: principal * (1 + (ratePct / 100) * y),
    });
  }
  return points;
}

const INSTALL_CTA = `/plugin marketplace add ssota-labs/faraday-academy
/plugin install faraday@faraday

Then say: "Turn this topic into an interactive Faraday lesson: compound interest.
Scaffold, author, run pnpm check and pnpm dev, then give me the URL."

Repo: https://github.com/ssota-labs/faraday-academy`;

export default function CompoundInterestLesson() {
  const [principal, setPrincipal] = useState(10_000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(30);
  const [compounds, setCompounds] = useState(12);

  const data = useMemo(
    () => buildSeries(principal, rate, years, compounds),
    [principal, rate, years, compounds],
  );
  const final = data[data.length - 1]?.balance ?? principal;
  const coffeeMonth = 150;
  const coffeeYears = futureValue(0, rate, years, compounds); // unused placeholder
  void coffeeYears;
  const coffeeAsPrincipal = futureValue(coffeeMonth * 12, rate, years, compounds);

  return (
    <Lesson
      title="복리의 폭주"
      lead="한 달 커피값, 30년 뒤? 슬라이더를 움직이면 곡선이 답한다."
      topic="finance"
    >
      <Prose heading="왜 복리가 '폭주'처럼 보이나">
        단리는 원금에만 이자가 붙고, 복리는 이자에도 이자가 붙습니다. 공식은
        {" "}
        <TeX>{String.raw`A = P\left(1+\frac{r}{n}\right)^{nt}`}</TeX>
        {" "}
        — 아래 슬라이더가 곧 <TeX>{String.raw`P, r, n, t`}</TeX>입니다.
      </Prose>

      <Workbench
        title="Growth workbench"
        panelTitle="Parameters"
        onReset={() => {
          setPrincipal(10_000);
          setRate(7);
          setYears(30);
          setCompounds(12);
        }}
        hud={
          <div className="flex flex-wrap gap-2">
            <Stat label="Final" value={`$${Math.round(final).toLocaleString()}`} />
            <Stat
              label="vs simple"
              value={`$${Math.round(final - principal * (1 + (rate / 100) * years)).toLocaleString()}`}
              delta={{ text: "compound edge" }}
            />
          </div>
        }
        controls={
          <>
            <ControlGroup label="Principal & rate" defaultOpen>
              <ParamSlider
                label="Principal (P)"
                value={principal}
                min={1000}
                max={100000}
                step={500}
                onChange={setPrincipal}
                format={(v) => `$${v.toLocaleString()}`}
              />
              <ParamSlider
                label="Annual rate (r)"
                value={rate}
                min={0}
                max={20}
                step={0.25}
                onChange={setRate}
                format={(v) => `${v}%`}
              />
            </ControlGroup>
            <ControlGroup label="Time & compounding" defaultOpen>
              <ParamSlider
                label="Years (t)"
                value={years}
                min={1}
                max={50}
                step={1}
                onChange={setYears}
                format={(v) => `${v}y`}
              />
              <ParamSlider
                label="Compounds / year (n)"
                value={compounds}
                min={1}
                max={365}
                step={1}
                onChange={setCompounds}
              />
            </ControlGroup>
          </>
        }
      >
        <Chart
          type="area"
          data={data}
          x="year"
          xType="number"
          series={[
            { key: "balance", label: "Compound" },
            { key: "linear", label: "Simple interest" },
          ]}
        />
      </Workbench>

      <Callout title="Coffee-money thought experiment">
        매달 ${coffeeMonth}를 1년치 원금(${(coffeeMonth * 12).toLocaleString()})으로
        넣고 같은 이율로 {years}년 굴리면 약{" "}
        <strong>${Math.round(coffeeAsPrincipal).toLocaleString()}</strong>.
        곡선의 끝이 아니라 슬라이더로 직접 확인하세요.
      </Callout>

      <Prose heading="공식 유도">
        한 기간의 성장 인자는 <TeX>{String.raw`1 + r/n`}</TeX>.{" "}
        <TeX>{String.raw`n`}</TeX>번 복리하면 1년, <TeX>{String.raw`t`}</TeX>년이면 지수가
        <TeX>{String.raw`nt`}</TeX>가 됩니다.
      </Prose>

      <Derivation
        title="Compound growth"
        steps={[
          { tex: String.raw`A_1 = P\left(1+\frac{r}{n}\right)`, note: "after one compounding period" },
          { tex: String.raw`A_n = P\left(1+\frac{r}{n}\right)^{n}`, note: "after one year" },
          { tex: String.raw`A = P\left(1+\frac{r}{n}\right)^{nt}`, note: "after t years" },
        ]}
      />

      <Reveal label="When does continuous compounding appear?">
        <TeX block>{String.raw`\lim_{n\to\infty} P\left(1+\frac{r}{n}\right)^{nt} = Pe^{rt}`}</TeX>
      </Reveal>

      <Quiz
        question="You double the compounding frequency (n → 2n) while keeping P, r, t fixed. What happens to A?"
        options={[
          {
            label: "It exactly doubles",
            hint: "The exponent and the rate-per-period both change — not a linear scale.",
          },
          {
            label: "It increases, but less than double — approaching a continuous limit",
            correct: true,
          },
          {
            label: "It decreases because each period earns less",
            hint: "Each period’s rate falls, but you compound more often; net effect is still up.",
          },
          {
            label: "It stays identical for any n",
            hint: "Only the continuous limit is the ceiling; finite n still moves A.",
          },
        ]}
      />

      <Prose heading="Make your own">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
          {INSTALL_CTA}
        </pre>
      </Prose>
    </Lesson>
  );
}
