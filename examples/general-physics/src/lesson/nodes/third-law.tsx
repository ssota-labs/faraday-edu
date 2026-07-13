// Node: third-law — action & reaction. Two carts push off with equal & opposite
// forces; unequal masses recoil at unequal speeds (ties back to a = F/m).
import { useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, Quiz, TeX,
} from "@faraday-academy/runtime/blocks";
import { Button } from "@faraday-academy/runtime/ui/button";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop } from "@faraday-academy/runtime/runtime";

const W = 560;
const H = 200;
const M_A = 2; // kg — left cart, fixed
const IMPULSE = 12; // N·s delivered equally & oppositely
const SPAN_M = 30; // metres across the track
const toPix = (m: number) => 40 + ((m + SPAN_M / 2) / SPAN_M) * (W - 80);

export default function ThirdLaw() {
  const { complete } = useNode();
  const [mB, setMB] = useState(4); // kg — right cart, adjustable
  const [xA, setXA] = useState(-1.4);
  const [xB, setXB] = useState(1.4);
  const [vA, setVA] = useState(0);
  const [vB, setVB] = useState(0);
  const [pushed, setPushed] = useState(false);
  const st = useRef({ xA: -1.4, xB: 1.4, vA: 0, vB: 0 });
  st.current = { xA, xB, vA, vB };

  useRafLoop((dt) => {
    const s = st.current;
    if (s.vA === 0 && s.vB === 0) return;
    const nxA = s.xA + s.vA * dt;
    const nxB = s.xB + s.vB * dt;
    if (nxA <= -SPAN_M / 2 || nxB >= SPAN_M / 2) { setVA(0); setVB(0); return; }
    setXA(nxA);
    setXB(nxB);
  }, true);

  const push = () => {
    setVA(-IMPULSE / M_A);
    setVB(IMPULSE / mB);
    setPushed(true);
  };
  const reset = () => { setXA(-1.4); setXB(1.4); setVA(0); setVB(0); setPushed(false); };

  const pTotal = M_A * vA + mB * vB; // ≈ 0 always

  // Recoil speed of cart B vs its mass (fixed impulse) — the ∝1/m curve.
  const recoil = useMemo(
    () => Array.from({ length: 11 }, (_, i) => {
      const m = 1 + i * 0.5;
      return { m, v: Number((IMPULSE / m).toFixed(2)) };
    }),
    [],
  );

  const aPix = toPix(xA);
  const bPix = toPix(xB);

  return (
    <Lesson topic="Newton's 3rd law" title="Action & reaction: forces come in pairs"
      lead="You cannot touch without being touched. Every force is one half of a pair: if A pushes B, then B pushes back on A with a force equal in size and opposite in direction — always, regardless of how big or small either body is.">
      <Prose>
        <p>
          Newton's third law: <em>for every force there is an equal and opposite force on the other
          body.</em> Written out, <TeX>{String.raw`\vec F_{A\to B} = -\,\vec F_{B\to A}`}</TeX>. The two
          crucial words are "other body" — the pair forces never act on the same object, so they can
          never cancel each other. One acts on B, its partner acts on A.
        </p>
        <p>
          Predict first. This is the single most counter-intuitive consequence of the law:
        </p>
      </Prose>

      <Quiz question="A fast-moving truck collides head-on with a small parked car. During the collision, which vehicle exerts the larger force on the other?"
        options={[
          { label: "The truck exerts a larger force on the car", hint: "The most common misconception. By the third law the two forces are exactly equal in magnitude — mass doesn't change that." },
          { label: "They exert exactly equal and opposite forces on each other", correct: true, hint: "Correct — that's the third law. The car is damaged more because a = F/m: equal force, far smaller mass." },
          { label: "The forces cancel, so neither feels a force", hint: "The pair forces act on DIFFERENT bodies, so they can't cancel — each car feels its own member of the pair." },
        ]} />

      <Prose heading="Equal forces, unequal outcomes">
        <p>
          Push the two carts apart. At the instant of the push each feels the <em>same</em> force for the
          same time — an equal and opposite impulse. But acceleration is <TeX>{String.raw`a = F/m`}</TeX>{" "}
          (the last node), so the lighter cart flies off faster. Make the right cart much heavier and it
          barely budges while the light one shoots away — same force, different mass, different speed.
        </p>
      </Prose>

      <Workbench
        title="Two carts push off"
        panelTitle="Right cart mass"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Button size="sm" onClick={push} disabled={pushed && (vA !== 0 || vB !== 0)}>Push off ⇄</Button>
            <Readout label="vₐ (m=2 kg)" value={`${vA.toFixed(1)} m/s`} tone="destructive" />
            <Readout label={`v_b (m=${mB} kg)`} value={`${vB.toFixed(1)} m/s`} tone="primary" />
            <Readout label="total momentum" value={`${pTotal.toFixed(1)} kg·m/s`} />
          </div>
        }
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="Right cart mass m_b" value={mB} min={1} max={6} step={0.5}
              onChange={(n) => { setMB(n); reset(); }} format={(n) => `${n} kg`} />
            <p className="text-sm text-muted-foreground">Left cart is fixed at 2 kg. The push delivers the same impulse to each.</p>
          </ControlGroup>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Two carts pushing off each other" width="100%">
          <line x1={24} y1={140} x2={W - 24} y2={140} stroke="var(--border)" strokeWidth={3} />
          {/* equal-and-opposite force arrows at rest, before the push */}
          {!pushed && (
            <g>
              <line x1={aPix + 26} y1={112} x2={aPix - 6} y2={112} stroke="var(--destructive)" strokeWidth={3} />
              <polygon points={`${aPix - 6},106 ${aPix - 18},112 ${aPix - 6},118`} style={{ fill: "var(--destructive)" }} />
              <line x1={bPix - 26} y1={112} x2={bPix + 6} y2={112} stroke="var(--chart-1)" strokeWidth={3} />
              <polygon points={`${bPix + 6},106 ${bPix + 18},112 ${bPix + 6},118`} style={{ fill: "var(--chart-1)" }} />
              <text x={(aPix + bPix) / 2} y={98} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>equal &amp; opposite</text>
            </g>
          )}
          {/* cart A (left, 2 kg) */}
          <rect x={aPix - 22} y={116} width={44} height={24} rx={4} style={{ fill: "var(--destructive)" }} />
          <text x={aPix} y={133} textAnchor="middle" fontSize={11} style={{ fill: "var(--background)" }}>2</text>
          {/* cart B (right, mB) — width scales a little with mass */}
          <rect x={bPix - (16 + mB * 2)} y={112} width={2 * (16 + mB * 2)} height={28} rx={4} style={{ fill: "var(--chart-1)" }} />
          <text x={bPix} y={131} textAnchor="middle" fontSize={11} style={{ fill: "var(--background)" }}>{mB}</text>
        </svg>
      </Workbench>

      <Prose heading="The momentum bookkeeping">
        <p>
          Because the forces are equal and opposite and act for the same time, the impulses are equal and
          opposite. Newton's third law therefore forces the two momentum changes to cancel — the total
          momentum stays zero, which is why the total-momentum readout never leaves 0. This is where
          conservation of momentum is born.
        </p>
      </Prose>
      <Derivation title="Equal impulses ⇒ opposite momenta" steps={[
        { tex: String.raw`\vec F_{A\to B} = -\,\vec F_{B\to A}`, note: "Newton's third law" },
        { tex: String.raw`\vec F_{A\to B}\,\Delta t = -\,\vec F_{B\to A}\,\Delta t`, note: "same contact time Δt ⇒ equal, opposite impulses" },
        { tex: String.raw`m_B \vec v_B = -\,m_A \vec v_A`, note: "impulse = change in momentum (from rest)" },
        { tex: String.raw`m_A v_A + m_B v_B = 0`, note: "total momentum stays zero" },
      ]} />

      <Prose heading="Why the light cart wins the race">
        <p>
          Solving <TeX>{String.raw`m_B v_B = -m_A v_A`}</TeX> for the recoil speed gives{" "}
          <TeX>{String.raw`v_B = \tfrac{m_A}{m_B}\,|v_A|`}</TeX>: for a fixed impulse the recoil speed is
          inversely proportional to mass — the same <TeX>{String.raw`\propto 1/m`}</TeX> shape from the
          second law, now driven by a force the cart itself created a partner to.
        </p>
      </Prose>
      <Chart type="line" data={recoil} x="m" xType="number" yAxis height={240}
        series={[{ key: "v", label: "recoil speed of cart B (m/s)" }]} />

      <Callout title="The key idea">
        Action–reaction forces are equal in magnitude, opposite in direction, and act on{" "}
        <em>different</em> bodies — so they never cancel. Unequal accelerations come entirely from
        unequal masses via <TeX>{String.raw`a = F/m`}</TeX>.
      </Callout>

      <Quiz question="You push against a heavy wall with 50 N. What force does the wall exert on you?"
        onCorrect={complete}
        options={[
          { label: "50 N, back toward you", correct: true, hint: "Right — the wall pushes back with an equal and opposite 50 N. That reaction is what your hand feels." },
          { label: "0 N — the wall is passive and just sits there", hint: "A wall is not passive: it must push back exactly 50 N, or your hand would accelerate straight through it." },
          { label: "More than 50 N, because the wall is much heavier", hint: "Mass never changes the size of a third-law pair. The forces are equal regardless of mass." },
        ]} />
      <Prose>
        <p className="text-sm text-muted-foreground">
          Recall check from the last node: if that 50 N acted as the <em>net</em> force on your 60 kg
          body, your acceleration would be <TeX>{String.raw`a = F/m = 50/60 \approx 0.83\ \text{m/s}^2`}</TeX>.
        </p>
      </Prose>
    </Lesson>
  );
}
