// Chapter 3 — 포물선 운동
// Outcome: 수평·연직 분해로 사거리 R=v²sin2θ/g 를 이해하고 계산한다.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Challenge,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { setSvgTranslate, useSimTime } from "../sim2d";

const G = 9.8;
const W = 640;
const H = 280;
const OX = 48;
const OY = 240;
const SCALE = 4.2; // px per metre

function rangeOf(v: number, deg: number) {
  const th = (deg * Math.PI) / 180;
  return (v * v * Math.sin(2 * th)) / G;
}
function flightTime(v: number, deg: number) {
  const th = (deg * Math.PI) / 180;
  return (2 * v * Math.sin(th)) / G;
}
function pos(v: number, deg: number, t: number) {
  const th = (deg * Math.PI) / 180;
  const x = v * Math.cos(th) * t;
  const y = v * Math.sin(th) * t - 0.5 * G * t * t;
  return { x, y };
}

export default function ProjectileChapter() {
  const [v, setV] = useState(18);
  const [angle, setAngle] = useState(40);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ t: 0, x: 0, y: 0 });
  const timeRef = useRef(0);
  const ballRef = useRef<SVGGElement>(null);
  const hudTick = useRef(0);

  const R = rangeOf(v, angle);
  const T = flightTime(v, angle);
  const targetX = 28; // mission target (m)
  const landed = !playing && hud.t >= T - 0.02 && hud.t > 0;
  const nearTarget = landed && Math.abs(R - targetX) <= 1.5;

  const paint = useCallback(
    (t: number) => {
      const tt = Math.min(t, T);
      const p = pos(v, angle, tt);
      const y = Math.max(0, p.y);
      setSvgTranslate(ballRef.current, OX + p.x * SCALE, OY - y * SCALE);
      hudTick.current += 1;
      if (hudTick.current % 2 === 0 || !playing) setHud({ t: tt, x: p.x, y });
    },
    [v, angle, T, playing],
  );

  useSimTime({
    playing,
    timeRef,
    until: T,
    rate: 1.2,
    onTick: paint,
    onComplete: () => setPlaying(false),
  });

  useEffect(() => {
    paint(0);
  }, [v, angle, paint]);

  function reset() {
    timeRef.current = 0;
    setHud({ t: 0, x: 0, y: 0 });
    setPlaying(false);
    paint(0);
  }

  const traj = useMemo(() => {
    const n = 50;
    return Array.from({ length: n + 1 }, (_, i) => {
      const t = (T * i) / n;
      const p = pos(v, angle, t);
      return { x: Number(p.x.toFixed(2)), y: Math.max(0, Number(p.y.toFixed(2))) };
    });
  }, [v, angle, T]);

  const angleSweep = useMemo(
    () =>
      Array.from({ length: 19 }, (_, i) => {
        const deg = 5 + i * 5;
        return { angle: deg, range: rangeOf(v, deg) };
      }),
    [v],
  );

  // Numeric check: v=14, θ=30 → R = 196 * sin60 / 9.8 = 196 * 0.8660 / 9.8 ≈ 17.32
  const checkR = (14 * 14 * Math.sin(Math.PI / 3)) / G;

  return (
    <Lesson
      topic="시험장의 물리 · 3"
      title="포물선 운동"
      lead="쉬는 시간, 종이비행기를 비스듬히 던지면 궤적은 왜 포물선일까?"
    >
      <Prose heading="Engage — 종이비행기 내각">
        <p>
          같은 속력으로 던져도 각도를 바꾸면 멀리 가는 정도가 달라진다. 「45°가
          제일 멀다」는 말을 들어 봤다면, 지금 시뮬에서 직접 확인해 보자.
        </p>
      </Prose>

      <Prose heading="Explore — 발사 각도 실험">
        <p>
          속력과 각도를 바꾼 뒤 Play. 공기저항은 무시한다(이상화). 수평 도달
          거리와 최고점이 어떻게 바뀌는지 관찰하라.
        </p>
      </Prose>

      <Challenge
        goal={
          <>
            사거리를 목표 <TeX>{String.raw`28\,\mathrm{m}`}</TeX> ± 1.5 m 안에
            맞춰 착지시키세요.
          </>
        }
        done={nearTarget}
        hint="같은 속력에서 사거리는 θ와 90°−θ에서 같다. 30~50° 근처를 탐색."
      >
        <Workbench
          title="종이비행기 발사 (이상화)"
          onReset={reset}
          hud={
            <>
              <Readout label="t" value={`${hud.t.toFixed(2)} s`} />
              <Readout label="x" value={`${hud.x.toFixed(1)} m`} />
              <Readout label="y" value={`${hud.y.toFixed(1)} m`} />
              <Readout label="R" value={`${R.toFixed(1)} m`} tone="primary" />
              <Button size="sm" onClick={() => setPlaying(!playing)}>
                {playing ? "Pause" : "Fire"}
              </Button>
            </>
          }
          controls={
            <ControlGroup label="발사">
              <ParamSlider
                label="속력 v"
                value={v}
                min={8}
                max={24}
                step={0.5}
                onChange={(n) => {
                  setV(n);
                  reset();
                }}
                format={(n) => `${n.toFixed(1)} m/s`}
              />
              <ParamSlider
                label="각도 θ"
                value={angle}
                min={10}
                max={80}
                step={1}
                onChange={(n) => {
                  setAngle(n);
                  reset();
                }}
                format={(n) => `${n}°`}
              />
            </ControlGroup>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="포물선 궤적">
            <line x1={OX} y1={OY} x2={W - 20} y2={OY} stroke="var(--border)" strokeWidth={2} />
            <line x1={OX} y1={OY} x2={OX} y2={30} stroke="var(--border)" strokeWidth={2} />
            {/* target flag */}
            <line
              x1={OX + targetX * SCALE}
              y1={OY}
              x2={OX + targetX * SCALE}
              y2={OY - 40}
              stroke="var(--chart-3)"
              strokeWidth={2}
            />
            <rect
              x={OX + targetX * SCALE}
              y={OY - 40}
              width={18}
              height={12}
              style={{ fill: "var(--chart-3)" }}
            />
            {/* trail */}
            {traj.map((p, i) =>
              i % 2 === 0 ? (
                <circle
                  key={i}
                  cx={OX + p.x * SCALE}
                  cy={OY - p.y * SCALE}
                  r={1.5}
                  style={{ fill: "var(--muted-foreground)", opacity: 0.45 }}
                />
              ) : null,
            )}
            <g ref={ballRef}>
              <circle cx={0} cy={0} r={8} style={{ fill: "var(--primary)" }} />
            </g>
          </svg>
        </Workbench>
      </Challenge>

      <Prose heading="Explain — 독립 운동의 합성">
        <p>
          수평은 등속도, 연직은 등가속도(중력). 두 성분을 합치면 궤적이 포물선이
          된다.
        </p>
        <TeX block>{String.raw`x = (v\cos\theta)\,t,\quad y = (v\sin\theta)\,t - \tfrac12 g t^2`}</TeX>
      </Prose>

      <Derivation
        title="사거리 공식"
        steps={[
          {
            tex: String.raw`T = \dfrac{2 v\sin\theta}{g}`,
            note: "y=0으로 돌아오는 비행 시간",
          },
          {
            tex: String.raw`R = (v\cos\theta)\,T = \dfrac{v^2\sin 2\theta}{g}`,
            note: "수평 변위 = 사거리",
          },
          {
            tex: String.raw`R_{\max}(\theta=45^\circ) = \dfrac{v^2}{g}`,
            note: "공기저항 없을 때 최대 사거리",
          },
        ]}
      />

      <Prose heading="Elaborate — 각도와 사거리">
        <p>
          같은 <TeX>{String.raw`v`}</TeX>에서 각도만 바꾼 사거리 곡선.{" "}
          <TeX>{String.raw`45^\circ`}</TeX>에서 꼭짓점,{" "}
          <TeX>{String.raw`\theta`}</TeX>와{" "}
          <TeX>{String.raw`90^\circ-\theta`}</TeX>가 같은{" "}
          <TeX>{String.raw`R`}</TeX>를 준다.
        </p>
      </Prose>

      <Chart
        type="line"
        data={angleSweep}
        x="angle"
        xType="number"
        yAxis
        series={[{ key: "range", label: "사거리 R (m)" }]}
      />

      <Callout title="수능식 함정">
        「비스듬히 던져 최고점에서 속도가 0」은 흔한 오개념이다. 최고점에서도
        수평 성분 <TeX>{String.raw`v\cos\theta`}</TeX>는 남아 있다.
      </Callout>

      <NumericAnswer
        question="v=14 m/s, θ=30°, g=9.8 m/s²일 때 사거리 R (m)은? (소수 첫째 자리까지 허용)"
        answer={checkR}
        unit="m"
        tolerance={0.3}
        hint="R = v² sin(2θ)/g = 196·sin60°/9.8."
      />

      <Quiz
        question="공기저항이 없을 때, 같은 속력으로 던질 때 사거리가 최대인 각도는?"
        options={[
          { label: "30°", hint: "R(30°)=R(60°)이지만 최대는 아님." },
          { label: "45°", correct: true, hint: "sin2θ 최대는 2θ=90°." },
          { label: "60°", hint: "30°와 사거리는 같지만 최대는 45°." },
          { label: "90°", hint: "수직 투척 — 사거리 0." },
        ]}
      />
    </Lesson>
  );
}
