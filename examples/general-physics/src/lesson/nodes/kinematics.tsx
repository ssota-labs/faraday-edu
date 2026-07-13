// Node: kinematics — position, velocity, acceleration + the constant-a equations.
// Continuous model (car on a track) + charts sampled from the real model +
// a live derivation + a compute check. All math via <TeX>.
import { useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, NumericAnswer, TeX,
} from "@faraday-academy/runtime/blocks";
import { Button } from "@faraday-academy/runtime/ui/button";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop } from "@faraday-academy/runtime/runtime";

const TRACK_M = 100; // metres represented by the track
const W = 560;
const H = 200;

// The real model — constant-acceleration kinematics.
const posOf = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
const velOf = (v0: number, a: number, t: number) => v0 + a * t;

function CarTrack({ v0, a, t }: { v0: number; a: number; t: number }) {
  const xM = Math.max(0, Math.min(TRACK_M, posOf(v0, a, t)));
  const toPix = (m: number) => 24 + (Math.max(0, Math.min(TRACK_M, m)) / TRACK_M) * (W - 90);
  const carX = toPix(xM);
  const trail = Array.from({ length: 12 }, (_, i) => posOf(v0, a, (t * (i + 1)) / 12));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Car accelerating along a track" width="100%">
      {/* track */}
      <line x1={24} y1={150} x2={W - 24} y2={150} stroke="var(--border)" strokeWidth={2} />
      {[0, 25, 50, 75, 100].map((m) => (
        <g key={m}>
          <line x1={toPix(m)} y1={146} x2={toPix(m)} y2={156} stroke="var(--muted-foreground)" strokeWidth={1} />
          <text x={toPix(m)} y={172} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>{m} m</text>
        </g>
      ))}
      {/* fading trail */}
      {trail.map((m, i) => (
        <circle key={i} cx={toPix(m)} cy={132} r={3} style={{ fill: "var(--primary)" }} opacity={(i + 1) / 18} />
      ))}
      {/* car */}
      <g transform={`translate(${carX}, 132)`}>
        <rect x={-16} y={-14} width={32} height={18} rx={4} style={{ fill: "var(--primary)" }} />
        <circle cx={-8} cy={6} r={4} style={{ fill: "var(--muted-foreground)" }} />
        <circle cx={8} cy={6} r={4} style={{ fill: "var(--muted-foreground)" }} />
      </g>
    </svg>
  );
}

export default function Kinematics() {
  const { complete } = useNode();
  const [v0, setV0] = useState(0);
  const [a, setA] = useState(3);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(0);
  tRef.current = t;

  useRafLoop((dt) => {
    const next = tRef.current + dt;
    const reached = posOf(v0, a, next) >= TRACK_M || posOf(v0, a, next) < 0;
    if (reached && tRef.current > 0) { setPlaying(false); return; }
    setT(Math.min(next, 20));
  }, playing);

  const x = posOf(v0, a, t);
  const v = velOf(v0, a, t);

  // Charts sampled from the same model, over a fixed 6-second window.
  const curve = useMemo(
    () => Array.from({ length: 25 }, (_, i) => {
      const tt = (i / 24) * 6;
      return { t: Number(tt.toFixed(2)), x: Number(posOf(v0, a, tt).toFixed(2)), v: Number(velOf(v0, a, tt).toFixed(2)) };
    }),
    [v0, a],
  );

  const reset = () => { setPlaying(false); setT(0); setV0(0); setA(3); };

  return (
    <Lesson topic="Kinematics" title="Motion: position, velocity, acceleration"
      lead="Before forces, we need the language of motion. Position tells you where; velocity is how fast position changes; acceleration is how fast velocity changes. Drive the car and watch the three quantities move together.">
      <Prose>
        <p>
          All of mechanics rests on describing <strong>how something moves</strong> before asking{" "}
          <em>why</em>. Three quantities do the whole job. <strong>Position</strong> <TeX>{String.raw`x`}</TeX>{" "}
          locates the object. <strong>Velocity</strong> <TeX>{String.raw`v`}</TeX> is the rate at which
          position changes, <TeX>{String.raw`v = \frac{dx}{dt}`}</TeX> — its sign carries direction.{" "}
          <strong>Acceleration</strong> <TeX>{String.raw`a`}</TeX> is the rate at which{" "}
          <em>velocity</em> changes, <TeX>{String.raw`a = \frac{dv}{dt}`}</TeX>.
        </p>
        <p>
          The subtle idea students miss: acceleration is not "how fast it goes" — it is how fast the
          going itself changes. A car at a steady 30 m/s has <em>zero</em> acceleration even though it
          is moving quickly. Set the acceleration below and press Play to feel the difference.
        </p>
      </Prose>

      <Workbench
        title="Constant-acceleration test track"
        panelTitle="Initial conditions"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Button size="sm" variant={playing ? "secondary" : "default"} onClick={() => {
              if (x >= TRACK_M) setT(0);
              setPlaying((p) => !p);
            }}>{playing ? "Pause" : "Play"}</Button>
            <Readout label="t" value={`${t.toFixed(2)} s`} />
            <Readout label="x" value={`${x.toFixed(1)} m`} tone="primary" />
            <Readout label="v" value={`${v.toFixed(1)} m/s`} />
          </div>
        }
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="Initial velocity v₀" value={v0} min={0} max={20} step={0.5}
              onChange={(n) => { setV0(n); setT(0); setPlaying(false); }} format={(n) => `${n} m/s`} />
            <ParamSlider label="Acceleration a" value={a} min={-4} max={6} step={0.5}
              onChange={(n) => { setA(n); setT(0); setPlaying(false); }} format={(n) => `${n} m/s²`} />
          </ControlGroup>
        }
      >
        <CarTrack v0={v0} a={a} t={t} />
      </Workbench>

      <Prose heading="Reading the two graphs">
        <p>
          The same run tells two stories. Because acceleration is constant, <strong>velocity</strong>{" "}
          grows in a straight line — equal gains in equal times. <strong>Position</strong> grows as a{" "}
          <em>parabola</em>: as the object speeds up it covers more ground each second, so the curve
          steepens. The slope of the position graph at any instant <em>is</em> the velocity on the
          velocity graph — that is the whole meaning of <TeX>{String.raw`v = dx/dt`}</TeX>.
        </p>
      </Prose>

      <Chart type="line" data={curve} x="t" xType="number" yAxis height={240}
        series={[{ key: "x", label: "position x (m)" }]} />
      <Prose>
        <p>Velocity over the same six seconds is a straight line whose slope is the acceleration:</p>
      </Prose>
      <Chart type="line" data={curve} x="t" xType="number" yAxis height={220}
        series={[{ key: "v", label: "velocity v (m/s)" }]} />

      <Prose heading="Where the equations come from">
        <p>
          Averaging the straight-line velocity over a time <TeX>{String.raw`t`}</TeX> and multiplying by{" "}
          <TeX>{String.raw`t`}</TeX> gives the displacement. Carried through, the constant-acceleration
          ("SUVAT") relations fall out:
        </p>
      </Prose>
      <Derivation title="The constant-acceleration equations" steps={[
        { tex: String.raw`v = v_0 + a\,t`, note: "velocity changes at the constant rate a" },
        { tex: String.raw`\bar v = \tfrac{1}{2}(v_0 + v)`, note: "average velocity of a straight line" },
        { tex: String.raw`\Delta x = \bar v\, t = \tfrac{1}{2}(v_0 + v)\,t`, note: "displacement = average velocity × time" },
        { tex: String.raw`\Delta x = v_0 t + \tfrac{1}{2} a t^2`, note: "substitute v = v₀ + at" },
        { tex: String.raw`v^2 = v_0^2 + 2 a\,\Delta x`, note: "eliminate t between the first and third" },
      ]} />

      <Callout title="The key idea">
        Constant acceleration ⇒ velocity is linear in time and position is quadratic. The three
        equations above are just this statement written for the unknowns you happen to be missing.
      </Callout>

      <Prose heading="Your turn">
        <p>
          A car starts <strong>from rest</strong> and accelerates at a constant{" "}
          <TeX>{String.raw`a = 3.0\ \text{m/s}^2`}</TeX>. How far does it travel in the first{" "}
          <TeX>{String.raw`t = 5.0\ \text{s}`}</TeX>? Use <TeX>{String.raw`\Delta x = v_0 t + \tfrac{1}{2}a t^2`}</TeX>{" "}
          — you can check yourself by setting v₀ = 0, a = 3 on the track and reading x at t = 5 s.
        </p>
      </Prose>
      <NumericAnswer question="Displacement of the car after 5.0 s (from rest, a = 3.0 m/s²):"
        answer={37.5} unit="m" tolerance={0.5} onCorrect={complete}
        hint="From rest v₀ = 0, so Δx = ½·a·t² = ½·3·5². Run the track to t = 5 s and read x." />
    </Lesson>
  );
}
