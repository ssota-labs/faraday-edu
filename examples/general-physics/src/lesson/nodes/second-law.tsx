// Node: second-law — Newton's 2nd law F = ma. Direct manipulation: drag the force
// vector on the block; mass on a slider; the block accelerates by the real a = F/m.
import { useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, Compare, NumericAnswer, TeX,
} from "@faraday-academy/runtime/blocks";
import { Button } from "@faraday-academy/runtime/ui/button";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop, useSvgDrag } from "@faraday-academy/runtime/runtime";

const TRACK_M = 60;
const W = 560;
const H = 210;
const PX_PER_N = 6;
const toPix = (m: number) => 24 + (Math.max(0, Math.min(TRACK_M, m)) / TRACK_M) * (W - 96);

export default function SecondLaw() {
  const { complete } = useNode();
  const [force, setForce] = useState(8); // N (signed)
  const [mass, setMass] = useState(2); // kg
  const [posM, setPosM] = useState(6);
  const [v, setV] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vRef = useRef(0);
  const pRef = useRef(6);
  vRef.current = v;
  pRef.current = posM;

  const a = force / mass;

  useRafLoop((dt) => {
    const nv = vRef.current + a * dt;
    const np = pRef.current + nv * dt;
    if (np >= TRACK_M || np <= 0) { setPlaying(false); return; }
    setV(nv);
    setPosM(np);
  }, playing);

  const blockPix = toPix(posM);
  const tipPix = blockPix + force * PX_PER_N;
  const drag = useSvgDrag((x, _y, phase) => {
    if (phase !== "end") setPlaying(false);
    const f = (x - blockPix) / PX_PER_N;
    setForce(Math.max(-20, Math.min(20, Math.round(f * 2) / 2)));
  });

  // a vs F for the current mass — sampled from the model.
  const aVsF = useMemo(
    () => Array.from({ length: 21 }, (_, i) => {
      const F = i; // 0..20 N
      return { F, a: Number((F / mass).toFixed(3)) };
    }),
    [mass],
  );

  const reset = () => { setForce(8); setMass(2); setPosM(6); setV(0); setPlaying(false); };

  return (
    <Lesson topic="Newton's 2nd law" title="F = ma: how force makes acceleration"
      lead="The first law says a net force changes motion. The second law says exactly how much: acceleration is proportional to the net force and inversely proportional to the mass. Drag the push, change the mass, and watch the acceleration obey.">
      <Prose>
        <p>
          Newton's second law is the quantitative heart of mechanics:{" "}
          <TeX>{String.raw`\sum \vec F = m\vec a`}</TeX>. Read it as a cause-and-effect statement — a{" "}
          <em>net</em> force is the cause, acceleration is the effect, and the mass sets the "exchange
          rate" between them. Solve it for the acceleration and the two dependencies are explicit:
          push twice as hard and you get twice the acceleration; load twice the mass and you get half.
        </p>
        <p>
          Grab the tip of the red force arrow and drag it — longer means a bigger push. Then press Play
          and watch how quickly the block picks up speed. Make the block heavier and the same push
          produces a visibly gentler acceleration.
        </p>
      </Prose>

      <Workbench
        title="Push a block"
        panelTitle="Mass"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Button size="sm" variant={playing ? "secondary" : "default"} onClick={() => {
              if (posM >= TRACK_M - 0.5) { setPosM(6); setV(0); }
              setPlaying((p) => !p);
            }}>{playing ? "Pause" : "Play"}</Button>
            <Readout label="F" value={`${force.toFixed(1)} N`} tone="destructive" />
            <Readout label="m" value={`${mass.toFixed(1)} kg`} />
            <Readout label="a = F/m" value={`${a.toFixed(2)} m/s²`} tone="primary" />
            <Readout label="v" value={`${v.toFixed(1)} m/s`} />
          </div>
        }
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="Mass m" value={mass} min={1} max={8} step={0.5}
              onChange={(n) => { setMass(n); setPlaying(false); }} format={(n) => `${n} kg`} />
            <p className="text-sm text-muted-foreground">Drag the red arrow on the canvas to set the force.</p>
          </ControlGroup>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A block pushed by a force arrow" width="100%">
          <line x1={16} y1={150} x2={W - 16} y2={150} stroke="var(--border)" strokeWidth={3} />
          {[0, 20, 40, 60].map((m) => (
            <text key={m} x={toPix(m)} y={172} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>{m} m</text>
          ))}
          {/* block */}
          <rect x={blockPix - 22} y={112} width={44} height={38} rx={5} style={{ fill: "var(--chart-1)" }} />
          {/* force vector */}
          {Math.abs(force) > 0.05 && (
            <g>
              <line x1={blockPix} y1={131} x2={tipPix} y2={131} stroke="var(--destructive)" strokeWidth={4} />
              <polygon
                points={force >= 0
                  ? `${tipPix},124 ${tipPix + 12},131 ${tipPix},138`
                  : `${tipPix},124 ${tipPix - 12},131 ${tipPix},138`}
                style={{ fill: "var(--destructive)" }}
              />
            </g>
          )}
          {/* draggable handle */}
          <circle {...drag} cx={tipPix} cy={131} r={11} style={{ fill: "var(--destructive)" }} opacity={0.28} cursor="grab" />
          <text x={blockPix} y={104} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>drag →</text>
        </svg>
      </Workbench>

      <Prose heading="The straight line that is F = ma">
        <p>
          Hold the mass fixed and plot acceleration against force. The law predicts a perfectly straight
          line through the origin whose <strong>slope is <TeX>{String.raw`1/m`}</TeX></strong>. That is
          what proportionality <em>looks like</em>. Increase the mass on the slider and watch the same line
          tilt flatter — a heavier block wrings less acceleration out of each newton.
        </p>
      </Prose>
      <Chart type="line" data={aVsF} x="F" xType="number" yAxis height={240}
        series={[{ key: "a", label: "acceleration a (m/s²)" }]} />

      <Prose heading="Solving the law for what you want">
        <p>
          The law is usually applied by rearranging it for the unknown. The acceleration form is the one
          you reach for most:
        </p>
      </Prose>
      <Derivation title="Acceleration from the second law" steps={[
        { tex: String.raw`\sum \vec F = m\,\vec a`, note: "Newton's second law" },
        { tex: String.raw`\vec a = \frac{\sum \vec F}{m}`, note: "divide both sides by the mass m" },
        { tex: String.raw`a = \frac{F}{m}`, note: "one dimension, F the net force along the motion" },
      ]} />

      <Prose heading="Two levers, opposite effects">
        <p>Force and mass pull the acceleration in opposite directions:</p>
      </Prose>
      <Compare items={[
        { value: "force", label: "Double the force", content: (
          <p className="text-sm">
            <TeX>{String.raw`a = \frac{2F}{m} = 2\left(\frac{F}{m}\right)`}</TeX> — acceleration{" "}
            <strong>doubles</strong>. Acceleration is directly proportional to net force.
          </p>
        ) },
        { value: "mass", label: "Double the mass", content: (
          <p className="text-sm">
            <TeX>{String.raw`a = \frac{F}{2m} = \tfrac{1}{2}\left(\frac{F}{m}\right)`}</TeX> — acceleration{" "}
            <strong>halves</strong>. Acceleration is inversely proportional to mass (inertia).
          </p>
        ) },
      ]} />

      <Callout title="The key idea">
        <TeX>{String.raw`a = F/m`}</TeX>: only the <em>net</em> force accelerates a body, the response
        is proportional to it, and mass is the resistance that divides it down.
      </Callout>

      <Prose heading="Your turn">
        <p>
          A single net force of <TeX>{String.raw`12\ \text{N}`}</TeX> acts on a{" "}
          <TeX>{String.raw`3.0\ \text{kg}`}</TeX> cart. What is its acceleration? You can confirm it by
          setting <TeX>{String.raw`m = 3`}</TeX> and dragging the force to 12 N — read <TeX>{String.raw`a`}</TeX> in the HUD.
        </p>
      </Prose>
      <NumericAnswer question="Acceleration of a 3.0 kg cart under a 12 N net force:"
        answer={4} unit="m/s²" tolerance={0.1} onCorrect={complete}
        hint="a = F/m = 12 ÷ 3. Set m = 3 kg and the force to 12 N on the canvas to check." />
    </Lesson>
  );
}
