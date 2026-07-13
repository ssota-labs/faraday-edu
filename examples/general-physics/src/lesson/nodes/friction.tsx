// Node: friction — static & kinetic. Drag the applied force up; static friction
// matches it to the break-away point μ_s·N, then kinetic friction μ_k·N takes over.
import { useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, NumericAnswer, TeX,
} from "@faraday-academy/runtime/blocks";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop, useSvgDrag } from "@faraday-academy/runtime/runtime";

const W = 560;
const H = 210;
const G = 9.8;
const MASS = 5; // kg (fixed for this lesson)
const SPAN_M = 30;
const PX_PER_N = 3.4;
const toPix = (m: number) => 40 + (Math.max(0, Math.min(SPAN_M, m)) / SPAN_M) * (W - 150);

export default function Friction() {
  const { complete } = useNode();
  const [muS, setMuS] = useState(0.5);
  const [muK, setMuK] = useState(0.3);
  const [fApp, setFApp] = useState(10); // N
  const [posM, setPosM] = useState(3);
  const [v, setV] = useState(0);
  const [moving, setMoving] = useState(false);
  const st = useRef({ v: 0, posM: 3, moving: false, fApp: 10, muK: 0.3, muS: 0.5 });
  st.current = { v, posM, moving, fApp, muK, muS };

  const N = MASS * G;
  const maxStatic = muS * N;
  const fKinetic = muK * N;

  useRafLoop((dt) => {
    const s = st.current;
    const fk = s.muK * N;
    const maxS = s.muS * N;
    if (!s.moving) {
      if (s.fApp > maxS) setMoving(true);
      return;
    }
    const a = (s.fApp - fk) / MASS;
    let nv = s.v + a * dt;
    if (nv <= 0) { setV(0); setMoving(false); return; }
    let np = s.posM + nv * dt;
    if (np >= SPAN_M) { np = 3; nv = 0; setMoving(false); }
    setV(nv);
    setPosM(np);
  }, true);

  const blockPix = toPix(posM);
  const rightFace = blockPix + 24;
  const tipPix = rightFace + fApp * PX_PER_N;
  const drag = useSvgDrag((x) => {
    const f = (x - rightFace) / PX_PER_N;
    setFApp(Math.max(0, Math.min(40, Math.round(f * 2) / 2)));
  });

  const frictionNow = moving ? fKinetic : Math.min(fApp, maxStatic);
  const state = moving ? "slipping (kinetic)" : fApp >= maxStatic - 0.05 ? "at break-away" : "static (gripping)";
  const a = moving ? (fApp - fKinetic) / MASS : 0;

  // Friction force vs applied force — the rise-then-drop signature.
  const curve = useMemo(
    () => Array.from({ length: 41 }, (_, i) => {
      const F = i;
      return { F, f: Number((F <= maxStatic ? F : fKinetic).toFixed(2)) };
    }),
    [maxStatic, fKinetic],
  );

  const reset = () => { setFApp(10); setPosM(3); setV(0); setMoving(false); setMuS(0.5); setMuK(0.3); };

  return (
    <Lesson topic="Friction" title="Friction: the force that grips, then slips"
      lead="Friction is why nothing slides forever — but it isn't one number. A stationary block grips back with exactly enough force to stay put, up to a limit. Push past that limit and it lets go, and a smaller, steadier kinetic friction takes over.">
      <Prose>
        <p>
          Friction acts along the surfaces in contact, opposing relative sliding. It comes in two
          regimes. <strong>Static friction</strong> acts while the surfaces are locked together; it is a
          <em>reactive</em> force that grows to match whatever tries to move the block — but only up to a
          ceiling, <TeX>{String.raw`f_s \le \mu_s N`}</TeX>. <strong>Kinetic friction</strong> acts once
          the block is sliding and has a fixed size, <TeX>{String.raw`f_k = \mu_k N`}</TeX>. On a flat
          surface the normal force is just the weight, <TeX>{String.raw`N = mg`}</TeX>.
        </p>
        <p>
          Because <TeX>{String.raw`\mu_k < \mu_s`}</TeX> for almost all materials, the friction{" "}
          <em>drops</em> the instant the block breaks free — which is exactly why a stuck drawer suddenly
          jerks loose. Drag the applied-force arrow up slowly and watch for the moment it lets go.
        </p>
      </Prose>

      <Workbench
        title="Pull a 5 kg block"
        panelTitle="Coefficients"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Readout label="applied F" value={`${fApp.toFixed(1)} N`} tone="destructive" />
            <Readout label="friction f" value={`${frictionNow.toFixed(1)} N`} tone="primary" />
            <Readout label="state" value={state} tone={moving ? "destructive" : "default"} />
            <Readout label="a" value={`${a.toFixed(2)} m/s²`} />
          </div>
        }
        controls={
          <ControlGroup label="Surfaces">
            <ParamSlider label="Static μ_s" value={muS} min={0.1} max={0.9} step={0.05}
              onChange={(n) => { setMuS(n); setMuK((k) => Math.min(k, n)); setMoving(false); setV(0); }} format={(n) => n.toFixed(2)} />
            <ParamSlider label="Kinetic μ_k" value={muK} min={0.05} max={0.8} step={0.05}
              onChange={(n) => { setMuK(Math.min(n, muS)); }} format={(n) => n.toFixed(2)} />
            <p className="text-sm text-muted-foreground">
              N = mg = {N.toFixed(1)} N. Break-away at μ_s·N = {maxStatic.toFixed(1)} N. Drag the red arrow on the canvas.
            </p>
          </ControlGroup>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A block on a surface being pulled" width="100%">
          {/* ground with hatching */}
          <line x1={16} y1={150} x2={W - 16} y2={150} stroke="var(--border)" strokeWidth={3} />
          {Array.from({ length: 18 }, (_, i) => (
            <line key={i} x1={20 + i * 30} y1={150} x2={12 + i * 30} y2={162} stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.5} />
          ))}
          {/* block */}
          <rect x={blockPix - 24} y={110} width={48} height={40} rx={5} style={{ fill: "var(--chart-1)" }} />
          <text x={blockPix} y={135} textAnchor="middle" fontSize={12} style={{ fill: "var(--background)" }}>5 kg</text>
          {/* applied force (red, right) */}
          {fApp > 0.05 && (
            <g>
              <line x1={rightFace} y1={124} x2={tipPix} y2={124} stroke="var(--destructive)" strokeWidth={4} />
              <polygon points={`${tipPix},117 ${tipPix + 12},124 ${tipPix},131`} style={{ fill: "var(--destructive)" }} />
              <text x={(rightFace + tipPix) / 2} y={112} textAnchor="middle" fontSize={11} style={{ fill: "var(--destructive)" }}>F</text>
            </g>
          )}
          {/* friction force (green/primary, left) */}
          {frictionNow > 0.05 && (
            <g>
              <line x1={blockPix - 24} y1={140} x2={blockPix - 24 - frictionNow * PX_PER_N} y2={140} stroke="var(--chart-3)" strokeWidth={4} />
              <polygon points={`${blockPix - 24 - frictionNow * PX_PER_N},133 ${blockPix - 36 - frictionNow * PX_PER_N},140 ${blockPix - 24 - frictionNow * PX_PER_N},147`} style={{ fill: "var(--chart-3)" }} />
              <text x={blockPix - 24 - frictionNow * PX_PER_N / 2} y={160} textAnchor="middle" fontSize={11} style={{ fill: "var(--chart-3)" }}>f</text>
            </g>
          )}
          {/* draggable handle */}
          <circle {...drag} cx={tipPix} cy={124} r={11} style={{ fill: "var(--destructive)" }} opacity={0.28} cursor="grab" />
        </svg>
      </Workbench>

      <Prose heading="The rise-then-drop signature">
        <p>
          Plot the friction force against the applied force and the two regimes are unmistakable. While
          the block is stuck, friction rises along the line <TeX>{String.raw`f = F_\text{app}`}</TeX> —
          it matches you exactly, so the net force stays zero and nothing moves. At{" "}
          <TeX>{String.raw`F_\text{app} = \mu_s N`}</TeX> the static ceiling is hit; one nudge more and
          the block breaks free and friction <strong>drops</strong> to the lower kinetic value{" "}
          <TeX>{String.raw`\mu_k N`}</TeX>, where it stays.
        </p>
      </Prose>
      <Chart type="line" data={curve} x="F" xType="number" yAxis height={240}
        series={[{ key: "f", label: "friction force f (N)" }]} />

      <Prose heading="Where the numbers come from">
        <p>On the flat surface the vertical forces balance, which pins down the normal force and both friction limits:</p>
      </Prose>
      <Derivation title="Friction limits on a flat surface" steps={[
        { tex: String.raw`\sum F_y = 0 \;\Rightarrow\; N = mg`, note: "block doesn't accelerate vertically" },
        { tex: String.raw`f_s \le \mu_s N = \mu_s\, m g`, note: "static friction, up to its ceiling" },
        { tex: String.raw`f_k = \mu_k\, m g`, note: "kinetic friction while sliding (constant)" },
        { tex: String.raw`F_\text{break} = \mu_s\, m g`, note: "the applied force that just starts it moving" },
      ]} />

      <Callout title="The key idea">
        Static friction is a self-adjusting force capped at <TeX>{String.raw`\mu_s N`}</TeX>; kinetic
        friction is a fixed <TeX>{String.raw`\mu_k N`}</TeX>. Since <TeX>{String.raw`\mu_k<\mu_s`}</TeX>,
        the grip that must be beaten to start sliding is stronger than the drag once it's moving.
      </Callout>

      <Prose heading="Your turn">
        <p>
          A <TeX>{String.raw`5.0\ \text{kg}`}</TeX> block sits on a flat floor with{" "}
          <TeX>{String.raw`\mu_s = 0.50`}</TeX> (take <TeX>{String.raw`g = 9.8\ \text{m/s}^2`}</TeX>).
          What is the <em>minimum</em> horizontal force needed to start it sliding? Set μ_s = 0.50 on
          the panel and drag F up until the state flips to "slipping" to confirm.
        </p>
      </Prose>
      <NumericAnswer question="Minimum force to start the 5.0 kg block moving (μ_s = 0.50, g = 9.8):"
        answer={24.5} unit="N" tolerance={0.5} onCorrect={complete}
        hint="Break-away force = μ_s·m·g = 0.50 × 5.0 × 9.8. Drag F on the canvas to that value." />
    </Lesson>
  );
}
