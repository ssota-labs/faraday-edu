// Chapter 5 — 원운동
// Outcome: 구심가속도 a=v²/r, F=mv²/r 로 선회·선풍기 상황을 계산한다.
import { useMemo, useRef, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  Callout,
  Derivation,
  NumericAnswer,
  Quiz,
  TeX,
  Readout,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { useSimTime } from "../sim2d";

const CX = 320;
const CY = 140;

export default function CircularChapter() {
  const [r, setR] = useState(2.5);
  const [v, setV] = useState(4);
  const [playing, setPlaying] = useState(true);
  const [theta, setTheta] = useState(0);
  const timeRef = useRef(0);
  const omegaRef = useRef(0);

  const omega = r > 0 ? v / r : 0; // rad/s
  omegaRef.current = omega;
  const ac = r > 0 ? (v * v) / r : 0;
  const T = omega > 0 ? (2 * Math.PI) / omega : 1e9;

  useSimTime({
    playing,
    timeRef,
    until: 1e9,
    rate: 1,
    onTick: (t) => {
      setTheta(omegaRef.current * t);
    },
  });

  const pxR = 40 + r * 35;
  const bx = CX + pxR * Math.cos(theta);
  const by = CY + pxR * Math.sin(theta);

  const chartData = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const rr = 0.5 + i * 0.25;
        return { r: rr, ac: (v * v) / rr };
      }),
    [v],
  );

  // Check: v=6, r=2 → ac = 36/2 = 18
  const checkAc = 18;

  return (
    <Lesson
      topic="시험장의 물리 · 5"
      title="원운동"
      lead="선풍기 날개, 운동장 트랙의 곡선 — 속력은 일정해도 왜 ‘가속’이라고 할까?"
    >
      <Prose heading="Engage — 속력은 같은데 방향이 바뀐다">
        <p>
          등속 원운동에서 속력 <TeX>{String.raw`|\vec v|`}</TeX>는 일정하다. 그런데
          속도는 벡터이므로 방향이 바뀌면 가속도가 있다. 그 중심 방향 가속도가
          구심가속도다.
        </p>
      </Prose>

      <Prose heading="Explore — 반지름과 속력">
        <p>
          반지름을 키우면 같은 속력에서 구심가속도가 작아진다. 속력을 키우면{" "}
          <TeX>{String.raw`v^2`}</TeX>에 비례해 커진다. Play로 주기 변화를 보라.
        </p>
      </Prose>

      <Workbench
        title="트랙 위 등속 원운동"
        onReset={() => {
          setR(2.5);
          setV(4);
          timeRef.current = 0;
          setTheta(0);
        }}
        hud={
          <>
            <Readout label="ω" value={`${omega.toFixed(2)} rad/s`} />
            <Readout label="aₙ" value={`${ac.toFixed(2)} m/s²`} tone="primary" />
            <Readout label="T" value={`${T.toFixed(2)} s`} />
            <Button size="sm" onClick={() => setPlaying(!playing)}>
              {playing ? "Pause" : "Play"}
            </Button>
          </>
        }
        controls={
          <ControlGroup label="궤도">
            <ParamSlider
              label="반지름 r"
              value={r}
              min={0.8}
              max={4}
              step={0.1}
              onChange={setR}
              format={(n) => `${n.toFixed(1)} m`}
            />
            <ParamSlider
              label="속력 v"
              value={v}
              min={1}
              max={10}
              step={0.2}
              onChange={setV}
              format={(n) => `${n.toFixed(1)} m/s`}
            />
          </ControlGroup>
        }
      >
        <svg viewBox="0 0 640 280" role="img" aria-label="원운동">
          <circle
            cx={CX}
            cy={CY}
            r={pxR}
            fill="none"
            stroke="var(--border)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <circle cx={CX} cy={CY} r={4} style={{ fill: "var(--muted-foreground)" }} />
          {/* radius */}
          <line
            x1={CX}
            y1={CY}
            x2={bx}
            y2={by}
            stroke="var(--chart-2)"
            strokeWidth={1.5}
          />
          {/* centripetal arrow toward center */}
          <line
            x1={bx}
            y1={by}
            x2={CX + (bx - CX) * 0.55}
            y2={CY + (by - CY) * 0.55}
            stroke="var(--chart-1)"
            strokeWidth={3}
          />
          <circle cx={bx} cy={by} r={12} style={{ fill: "var(--primary)" }} />
        </svg>
      </Workbench>

      <Prose heading="Explain — 구심가속도">
        <p>
          한 주기 동안 속도 벡터가 한 바퀴 돈다. 기하학적으로 유도하면:
        </p>
      </Prose>

      <Derivation
        title="a = v²/r"
        steps={[
          { tex: String.raw`v = \omega r,\quad T = 2\pi/\omega`, note: "각속도와 주기" },
          {
            tex: String.raw`a_n = \omega^2 r = \dfrac{v^2}{r}`,
            note: "중심 방향(법선) 가속도",
          },
          {
            tex: String.raw`F_n = m\dfrac{v^2}{r}`,
            note: "구심력 — 알짜힘의 중심 성분",
          },
        ]}
      />

      <Prose heading="Elaborate — r에 따른 aₙ">
        <p>
          속력 고정, 반지름만 바꿀 때. 곡선이{" "}
          <TeX>{String.raw`1/r`}</TeX> 형태임을 그래프에서 확인하라.
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="r"
        xType="number"
        yAxis
        series={[{ key: "ac", label: "aₙ (m/s²)" }]}
      />

      <Callout title="오개념">
        「등속 원운동이므로 가속도가 없다」는 틀림. 속력 일정 ≠ 속도 일정.
      </Callout>

      <NumericAnswer
        question="v=6 m/s, r=2 m일 때 구심가속도 aₙ (m/s²)는?"
        answer={checkAc}
        unit="m/s²"
        tolerance={0.1}
        hint="a = v²/r = 36/2 = 18."
      />

      <Quiz
        question="등속 원운동에서 구심력의 방향은?"
        options={[
          { label: "접선 방향(진행 방향)", hint: "그건 접선가속도 — 속력 변화." },
          { label: "원의 중심을 향함", correct: true, hint: "속도 방향을 끊임없이 꺾음." },
          { label: "바깥쪽(원심)", hint: "비관성계 가상힘 — 관성계에선 구심." },
          { label: "중력과 항상 반대", hint: "구심력의 원천은 상황에 따라 다름." },
        ]}
      />
    </Lesson>
  );
}
