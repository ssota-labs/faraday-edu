// Chapter 2 — 등가속도 운동
// Outcome: 등가속도 식 x=v0t+½at², v=v0+at 로 등교·복도 상황을 계산한다.
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
  Quiz,
  NumericAnswer,
  TeX,
  Readout,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { setSvgTranslate, useSimTime } from "../sim2d";

const TRACK_M = 60;
const W = 640;
const H = 180;
const PAD = 40;
const GROUND = 120;
const RATE = 2;

const posAt = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
const velAt = (v0: number, a: number, t: number) => v0 + a * t;

function endTime(v0: number, a: number): number {
  let tEnd = 20;
  if (Math.abs(a) < 1e-9) {
    if (v0 > 1e-9) tEnd = Math.min(tEnd, TRACK_M / v0);
  } else {
    const disc = v0 * v0 + 2 * a * TRACK_M;
    if (disc >= 0) {
      const roots = [(-v0 + Math.sqrt(disc)) / a, (-v0 - Math.sqrt(disc)) / a].filter(
        (r) => r > 1e-6,
      );
      if (roots.length) tEnd = Math.min(tEnd, Math.min(...roots));
    }
  }
  if (a < 0 && v0 > 0) tEnd = Math.min(tEnd, v0 / Math.abs(a));
  return Math.max(0.05, tEnd);
}

const pxOf = (m: number) => PAD + (Math.min(Math.max(m, 0), TRACK_M) / TRACK_M) * (W - 2 * PAD);

export default function AccelerationChapter() {
  const [v0, setV0] = useState(2);
  const [a, setA] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ t: 0, x: 0, v: 0 });
  const timeRef = useRef(0);
  const studentRef = useRef<SVGGElement>(null);
  const hudTick = useRef(0);

  const tEnd = endTime(v0, a);

  const paint = useCallback(
    (t: number) => {
      const xM = posAt(v0, a, Math.min(t, tEnd));
      const vNow = velAt(v0, a, Math.min(t, tEnd));
      setSvgTranslate(studentRef.current, pxOf(xM), 0);
      hudTick.current += 1;
      if (hudTick.current % 3 === 0 || !playing) setHud({ t, x: xM, v: vNow });
    },
    [v0, a, tEnd, playing],
  );

  useSimTime({
    playing,
    timeRef,
    until: tEnd,
    rate: RATE,
    onTick: paint,
    onComplete: () => setPlaying(false),
  });

  useEffect(() => {
    paint(timeRef.current);
  }, [v0, a, paint]);

  function resetRun() {
    timeRef.current = 0;
    setHud({ t: 0, x: 0, v: 0 });
    setPlaying(false);
    hudTick.current = 0;
    paint(0);
  }

  const chartData = useMemo(() => {
    const n = 40;
    return Array.from({ length: n + 1 }, (_, i) => {
      const t = (tEnd * i) / n;
      return { t: Number(t.toFixed(2)), x: posAt(v0, a, t), v: velAt(v0, a, t) };
    });
  }, [v0, a, tEnd]);

  // Check: v0=2, a=0.5, t=4 → x = 8 + 4 = 12 m
  const checkX = 2 * 4 + 0.5 * 0.5 * 16; // 12

  return (
    <Lesson
      topic="시험장의 물리 · 2"
      title="등가속도 운동"
      lead="지각 직전, 복도를 일정한 가속도로 달릴 때 위치·속도는 어떻게 변할까?"
    >
      <Prose heading="Engage — 지각 카운트다운">
        <p>
          입실 마감 30초 전. 고사실까지 남은 거리는{" "}
          <TeX>{String.raw`60\,\mathrm{m}`}</TeX>. 처음 속력{" "}
          <TeX>{String.raw`v_0`}</TeX>로 출발해 일정한 가속도{" "}
          <TeX>{String.raw`a`}</TeX>로 달린다면, 도착 시각은 어떻게 정해질까?
        </p>
        <p>
          「빨리 달리면 된다」는 감각만으로는 부족하다. 등가속도에서는 위치가{" "}
          <strong>시간에 대해 이차식</strong>으로 자란다.
        </p>
      </Prose>

      <Prose heading="Explore — 복도 스프린트">
        <p>
          먼저 슬라이더만 만지며 Play를 눌러 보라. 가속도를 키우면 같은 시간에
          어디까지 가는지, 감속하면 중간에 멈추는지 눈으로 확인한다. 식은 나중에.
        </p>
      </Prose>

      <Workbench
        title="고사실까지 60 m"
        onReset={resetRun}
        hud={
          <>
            <Readout label="t" value={`${hud.t.toFixed(2)} s`} />
            <Readout label="x" value={`${hud.x.toFixed(1)} m`} tone="primary" />
            <Readout label="v" value={`${hud.v.toFixed(2)} m/s`} />
            <Button size="sm" onClick={() => (playing ? setPlaying(false) : setPlaying(true))}>
              {playing ? "Pause" : "Play"}
            </Button>
          </>
        }
        controls={
          <ControlGroup label="운동">
            <ParamSlider
              label="초기 속력 v₀"
              value={v0}
              min={0}
              max={6}
              step={0.1}
              onChange={(n) => {
                setV0(n);
                resetRun();
              }}
              format={(n) => `${n.toFixed(1)} m/s`}
            />
            <ParamSlider
              label="가속도 a"
              value={a}
              min={-1.5}
              max={2.5}
              step={0.1}
              onChange={(n) => {
                setA(n);
                resetRun();
              }}
              format={(n) => `${n.toFixed(1)} m/s²`}
            />
          </ControlGroup>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="복도 등가속도 시뮬">
          <line
            x1={PAD}
            y1={GROUND}
            x2={W - PAD}
            y2={GROUND}
            stroke="var(--border)"
            strokeWidth={2}
          />
          {[0, 15, 30, 45, 60].map((m) => (
            <g key={m}>
              <line
                x1={pxOf(m)}
                y1={GROUND - 6}
                x2={pxOf(m)}
                y2={GROUND + 6}
                stroke="var(--muted-foreground)"
              />
              <text
                x={pxOf(m)}
                y={GROUND + 22}
                textAnchor="middle"
                fontSize={11}
                style={{ fill: "var(--muted-foreground)" }}
              >
                {m} m
              </text>
            </g>
          ))}
          <rect
            x={W - PAD - 18}
            y={GROUND - 48}
            width={18}
            height={48}
            rx={2}
            style={{ fill: "var(--chart-2)" }}
          />
          <text
            x={W - PAD - 9}
            y={GROUND - 54}
            textAnchor="middle"
            fontSize={10}
            style={{ fill: "var(--muted-foreground)" }}
          >
            고사실
          </text>
          <g ref={studentRef}>
            <circle cx={0} cy={GROUND - 18} r={12} style={{ fill: "var(--primary)" }} />
            <rect
              x={-8}
              y={GROUND - 8}
              width={16}
              height={20}
              rx={3}
              style={{ fill: "var(--primary)" }}
            />
          </g>
        </svg>
      </Workbench>

      <Prose heading="Explain — 등가속도의 두 식">
        <p>
          가속도가 일정하면 속도는 시간에 비례해 변하고, 위치는 그 속도를
          적분한 결과다. 방금 본 궤적이 이차곡선인 이유다.
        </p>
      </Prose>

      <Derivation
        title="위치식 유도"
        steps={[
          { tex: String.raw`a = \text{const}`, note: "등가속도 가정" },
          { tex: String.raw`v(t) = v_0 + a t`, note: "속도 = 초기속도 + 가속도×시간" },
          {
            tex: String.raw`x(t) = \int_0^t v(\tau)\,d\tau = v_0 t + \tfrac12 a t^2`,
            note: "위치를 적분 (x₀=0)",
          },
          {
            tex: String.raw`x = v_0 t + \tfrac12 a t^2`,
            note: "시험에 쓰는 최종식",
          },
        ]}
      />

      <Prose heading="Elaborate — 같은 모델의 그래프">
        <p>
          시뮬과 <strong>같은</strong> <TeX>{String.raw`v_0, a`}</TeX>로{" "}
          <TeX>{String.raw`x(t)`}</TeX>·<TeX>{String.raw`v(t)`}</TeX>를 샘플링했다.
          속도 그래프가 직선이면 가속도가 상수라는 뜻이다.
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="t"
        xType="number"
        yAxis
        series={[
          { key: "x", label: "x (m)" },
          { key: "v", label: "v (m/s)" },
        ]}
      />

      <Callout title="자주 하는 실수">
        「평균 속도 = (v₀+v)/2」는 <em>등가속도일 때만</em> 안전하다. 가속도가
        바뀌면 이 공식을 쓰지 말 것.
      </Callout>

      <Prose heading="Evaluate">
        <p>
          슬라이더를 <TeX>{String.raw`v_0=2\,\mathrm{m/s}`}</TeX>,{" "}
          <TeX>{String.raw`a=0.5\,\mathrm{m/s^2}`}</TeX>로 맞춘 뒤 4초 위치를
          식으로 계산해 보라.
        </p>
      </Prose>

      <NumericAnswer
        question="v₀=2 m/s, a=0.5 m/s²일 때 t=4 s에서 위치 x는? (x₀=0)"
        answer={checkX}
        unit="m"
        tolerance={0.1}
        hint="x = v₀t + ½at² = 2·4 + ½·0.5·16 = 8+4 = 12."
      />

      <Quiz
        question="등가속도에서 v–t 그래프의 기울기는?"
        options={[
          { label: "위치 x", hint: "기울기가 아니라 아래 면적이 변위." },
          { label: "가속도 a", correct: true, hint: "dv/dt = a." },
          { label: "운동량 p", hint: "역학 장 개념." },
          { label: "일 W", hint: "에너지 장 개념." },
        ]}
      />
    </Lesson>
  );
}
