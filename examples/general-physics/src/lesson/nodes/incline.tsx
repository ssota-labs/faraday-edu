// Node: incline (JOIN — needs third-law + friction). Resolve gravity on a ramp,
// find the critical slip angle θ_c = arctan(μ_s). Drag the ramp; a live free-body
// diagram updates; the block releases past θ_c. Summative = a <Challenge> mission.
import { useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, Challenge, Quiz, TeX,
} from "@faraday-academy/runtime/blocks";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop, useSvgDrag } from "@faraday-academy/runtime/runtime";

const W = 560;
const H = 300;
const G = 9.8;
const MASS = 2; // kg
const PIVOT = { x: 70, y: 250 };
const RAMP_L = 380; // px
const NPX = 3.4; // px per newton (force-vector scale)

const rad = (deg: number) => (deg * Math.PI) / 180;

export default function Incline() {
  const { complete } = useNode();
  const [muS, setMuS] = useState(0.5);
  const [thetaDeg, setThetaDeg] = useState(12);
  const [d, setD] = useState(RAMP_L * 0.58); // block distance along ramp (px)
  const [vpx, setVpx] = useState(0);
  const st = useRef({ d: RAMP_L * 0.58, vpx: 0, theta: 12, muS: 0.5 });
  st.current = { d, vpx, theta: thetaDeg, muS };

  const theta = rad(thetaDeg);
  const muK = Math.max(0.05, muS - 0.15); // kinetic a touch below static
  const thetaC = Math.atan(muS); // radians
  const thetaCdeg = (thetaC * 180) / Math.PI;
  const sliding = thetaDeg > thetaCdeg + 0.05;

  const mg = MASS * G;
  const driving = mg * Math.sin(theta); // along-incline gravity component
  const normal = mg * Math.cos(theta); // normal force
  const maxStatic = muS * normal;
  const frictionMag = sliding ? muK * normal : Math.min(driving, maxStatic);

  useRafLoop((dt) => {
    const s = st.current;
    const th = rad(s.theta);
    const slip = s.theta > (Math.atan(s.muS) * 180) / Math.PI + 0.05;
    if (!slip) return;
    const mk = Math.max(0.05, s.muS - 0.15);
    const aMs2 = G * (Math.sin(th) - mk * Math.cos(th)); // net down-slope accel
    const nv = s.vpx + aMs2 * 8 * dt; // 8 px per metre, purely visual
    let nd = s.d - nv * dt;
    if (nd <= 26) { nd = 26; setVpx(0); return; }
    setVpx(nv);
    setD(nd);
  }, true);

  // Ramp geometry
  const t = { x: Math.cos(theta), y: -Math.sin(theta) }; // up-slope unit (screen coords)
  const n = { x: -Math.sin(theta), y: -Math.cos(theta) }; // outward normal
  const top = { x: PIVOT.x + t.x * RAMP_L, y: PIVOT.y + t.y * RAMP_L };
  const baseEnd = { x: PIVOT.x + RAMP_L * Math.cos(theta), y: PIVOT.y };
  const bc = { x: PIVOT.x + t.x * d + n.x * 15, y: PIVOT.y + t.y * d + n.y * 15 }; // block center (lifted off surface)

  // Draggable ramp handle (the top corner) → sets the angle.
  const drag = useSvgDrag((x, y) => {
    const ang = Math.atan2(PIVOT.y - y, x - PIVOT.x);
    const deg = Math.max(4, Math.min(55, (ang * 180) / Math.PI));
    setThetaDeg(Math.round(deg * 10) / 10);
  });

  // driving vs max-static across angle — crossing at θ_c.
  const forceCurve = useMemo(
    () => Array.from({ length: 46 }, (_, i) => {
      const dg = i; const r = rad(dg);
      return { theta: dg, drive: Number((mg * Math.sin(r)).toFixed(2)), grip: Number((muS * mg * Math.cos(r)).toFixed(2)) };
    }),
    [muS, mg],
  );

  const reset = () => { setMuS(0.5); setThetaDeg(12); setD(RAMP_L * 0.58); setVpx(0); };
  const arrow = (from: { x: number; y: number }, vx: number, vy: number, color: string, label: string) => {
    const tipX = from.x + vx; const tipY = from.y + vy;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len; const uy = vy / len;
    const px = -uy; const py = ux;
    return (
      <g key={label}>
        <line x1={from.x} y1={from.y} x2={tipX} y2={tipY} stroke={color} strokeWidth={3} />
        <polygon points={`${tipX},${tipY} ${tipX - ux * 11 + px * 6},${tipY - uy * 11 + py * 6} ${tipX - ux * 11 - px * 6},${tipY - uy * 11 - py * 6}`} style={{ fill: color }} />
        <text x={tipX + ux * 10} y={tipY + uy * 10} fontSize={12} style={{ fill: color }}>{label}</text>
      </g>
    );
  };

  return (
    <Lesson topic="Application: the incline" title="Forces on an incline — when does it slide?"
      lead="This is where the three laws meet. Gravity pulls straight down, but on a ramp only part of it drives the block down-slope while friction resists. Tilt the ramp far enough and grip loses to gravity. Remarkably, the tipping-point angle doesn't depend on the block's mass at all.">
      <Prose>
        <p>
          On a ramp inclined at angle <TeX>{String.raw`\theta`}</TeX>, the weight{" "}
          <TeX>{String.raw`mg`}</TeX> splits into two perpendicular pieces: a component{" "}
          <TeX>{String.raw`mg\sin\theta`}</TeX> pointing <em>down the slope</em> (the part that tries to
          slide the block) and a component <TeX>{String.raw`mg\cos\theta`}</TeX> pressing{" "}
          <em>into</em> the surface. The surface answers the second piece with a normal force{" "}
          <TeX>{String.raw`N = mg\cos\theta`}</TeX> (Newton's third law), and that normal force sets the
          friction ceiling <TeX>{String.raw`\mu_s N`}</TeX> that fights the first piece.
        </p>
        <p>Commit to a prediction before you tilt anything:</p>
      </Prose>

      <Quiz question="Two blocks — one 1 kg, one 10 kg — sit on the same ramp with the same μ_s. As you slowly tilt it up, which slides first?"
        options={[
          { label: "The heavy 10 kg block slides first — more weight to pull it", hint: "Tempting, but both the driving force and the friction grow with mass in the same proportion, so mass cancels out." },
          { label: "The light 1 kg block slides first — less friction to hold it", hint: "Friction scales with weight too. Lighter means less friction AND less driving force — they cancel." },
          { label: "They slide at exactly the same angle — mass cancels", correct: true, hint: "Right. Both mg sinθ and μ_s mg cosθ carry the same m, so the critical angle depends only on μ_s." },
        ]} />

      <Prose heading="Tilt it and watch the vectors">
        <p>
          Drag the top of the ramp to change <TeX>{String.raw`\theta`}</TeX>. Watch the three force
          arrows: the weight <span style={{ color: "var(--destructive)" }}>(down)</span> stays fixed, but
          as the ramp steepens the down-slope share grows while the normal force — and with it the
          friction ceiling <span style={{ color: "var(--chart-3)" }}>(up-slope)</span> — shrinks. When the
          down-slope pull finally exceeds what friction can supply, the block lets go.
        </p>
      </Prose>

      <Workbench
        title="Block on a ramp"
        panelTitle="Surface"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Readout label="θ" value={`${thetaDeg.toFixed(1)}°`} tone="primary" />
            <Readout label="drive mg sinθ" value={`${driving.toFixed(1)} N`} tone="destructive" />
            <Readout label="grip μₛN" value={`${maxStatic.toFixed(1)} N`} tone="default" />
            <Readout label="state" value={sliding ? "sliding" : "held"} tone={sliding ? "destructive" : "default"} />
          </div>
        }
        controls={
          <ControlGroup label="Coefficient">
            <ParamSlider label="Static μ_s" value={muS} min={0.15} max={0.9} step={0.05}
              onChange={(nn) => { setMuS(nn); setThetaDeg(12); setD(RAMP_L * 0.58); setVpx(0); }} format={(nn) => nn.toFixed(2)} />
            <p className="text-sm text-muted-foreground">
              Critical angle θ_c = arctan(μ_s) = <strong>{thetaCdeg.toFixed(1)}°</strong>. Drag the ramp's top corner to tilt.
            </p>
          </ControlGroup>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A block on an adjustable incline with a free-body diagram" width="100%">
          {/* base + critical-angle target band on the protractor */}
          <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x + RAMP_L} y2={PIVOT.y} stroke="var(--border)" strokeWidth={2} strokeDasharray="4 4" />
          <path
            d={`M ${PIVOT.x + 120} ${PIVOT.y} A 120 120 0 0 0 ${PIVOT.x + 120 * Math.cos(thetaC + rad(2))} ${PIVOT.y - 120 * Math.sin(thetaC + rad(2))}`}
            fill="none" stroke="var(--chart-4)" strokeWidth={0}
          />
          {/* target band = critical angle ± 1.5° */}
          {[thetaCdeg].map((tc) => {
            const a1 = rad(tc - 1.5); const a2 = rad(tc + 1.5); const R = 132;
            return (
              <path key="band"
                d={`M ${PIVOT.x + R * Math.cos(a1)} ${PIVOT.y - R * Math.sin(a1)} A ${R} ${R} 0 0 0 ${PIVOT.x + R * Math.cos(a2)} ${PIVOT.y - R * Math.sin(a2)}`}
                fill="none" stroke="var(--chart-4)" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            );
          })}
          <text x={PIVOT.x + 150} y={PIVOT.y - 150 * Math.sin(thetaC)} fontSize={11} style={{ fill: "var(--chart-4)" }}>θ_c target</text>

          {/* ramp wedge */}
          <polygon points={`${PIVOT.x},${PIVOT.y} ${top.x},${top.y} ${baseEnd.x},${PIVOT.y}`} style={{ fill: "var(--muted)" }} opacity={0.55} />
          <line x1={PIVOT.x} y1={PIVOT.y} x2={top.x} y2={top.y} stroke="var(--foreground)" strokeWidth={3} />

          {/* block (rotated square on the surface) */}
          <g transform={`translate(${bc.x}, ${bc.y}) rotate(${-thetaDeg})`}>
            <rect x={-16} y={-16} width={32} height={32} rx={4} style={{ fill: "var(--chart-1)" }} />
          </g>

          {/* force vectors from block center */}
          {arrow(bc, 0, mg * NPX, "var(--destructive)", "mg")}
          {arrow(bc, n.x * normal * NPX, n.y * normal * NPX, "var(--chart-2)", "N")}
          {frictionMag > 0.05 && arrow(bc, t.x * frictionMag * NPX, t.y * frictionMag * NPX, "var(--chart-3)", "f")}

          {/* draggable ramp handle */}
          <circle {...drag} cx={top.x} cy={top.y} r={12} style={{ fill: "var(--primary)" }} opacity={0.32} cursor="grab" />
        </svg>
      </Workbench>

      <Prose heading="The crossing point">
        <p>
          Plotting the down-slope drive <TeX>{String.raw`mg\sin\theta`}</TeX> against the friction ceiling{" "}
          <TeX>{String.raw`\mu_s\, mg\cos\theta`}</TeX> shows the whole story on one graph. The drive rises
          with angle; the grip falls. They cross at one angle — to the left the block is held, to the right
          it slides. That crossing is the critical angle.
        </p>
      </Prose>
      <Chart type="line" data={forceCurve} x="theta" xType="number" yAxis height={260} legend
        series={[{ key: "drive", label: "drive mg sinθ (N)" }, { key: "grip", label: "grip μ_s mg cosθ (N)" }]} />

      <Prose heading="Deriving the critical angle">
        <p>
          At the instant of slipping the down-slope pull exactly equals the maximum static friction. Setting
          them equal, the mass and <TeX>{String.raw`g`}</TeX> cancel and the whole result collapses to a
          single elegant statement about <TeX>{String.raw`\mu_s`}</TeX> alone:
        </p>
      </Prose>
      <Derivation title="The critical slip angle" steps={[
        { tex: String.raw`mg\sin\theta_c = f_{s,\max} = \mu_s N`, note: "at slipping: drive = max static friction" },
        { tex: String.raw`N = mg\cos\theta_c`, note: "normal force balances the into-surface weight component" },
        { tex: String.raw`mg\sin\theta_c = \mu_s\, mg\cos\theta_c`, note: "substitute N" },
        { tex: String.raw`\tan\theta_c = \mu_s`, note: "divide by mg cosθ — the mass cancels!" },
        { tex: String.raw`\theta_c = \arctan(\mu_s)`, note: "the critical angle depends only on μ_s" },
      ]} />

      <Callout title="The key idea">
        A block slides once <TeX>{String.raw`\tan\theta > \mu_s`}</TeX>, i.e. past{" "}
        <TeX>{String.raw`\theta_c = \arctan(\mu_s)`}</TeX>. The tipping angle is set entirely by the
        surfaces, not the block's weight — a beautiful consequence of every force scaling with{" "}
        <TeX>{String.raw`m`}</TeX>.
      </Callout>

      <Prose heading="Mission: find the tipping point">
        <p>
          Now do it. Change <TeX>{String.raw`\mu_s`}</TeX> if you like, then tilt the ramp so it sits right
          at the critical angle — the highlighted arc marks the target band <TeX>{String.raw`\theta_c \pm 1.5°`}</TeX>.
          The block releasing is your confirmation.
        </p>
      </Prose>
      <Challenge
        title="Mission — critical angle"
        goal={<span>Tilt the ramp to within 1.5° of the critical slip angle <TeX>{String.raw`\theta_c=\arctan(\mu_s)`}</TeX> (the highlighted arc).</span>}
        done={Math.abs(thetaDeg - thetaCdeg) <= 1.5}
        hint="θ_c = arctan(μ_s). For μ_s = 0.5 that's about 26.6°. Read θ_c off the panel and match it with the ramp."
        onDone={complete}
      >
        <div className="text-sm text-muted-foreground">
          Current ramp angle: <span className="font-mono text-primary">{thetaDeg.toFixed(1)}°</span> · target θ_c ={" "}
          <span className="font-mono">{thetaCdeg.toFixed(1)}°</span>. Drag the ramp in the workbench above.
        </div>
      </Challenge>

      <Prose>
        <p className="text-sm text-muted-foreground">
          Spaced recall from the friction node: on a <em>flat</em> surface (θ = 0) the break-away force for a
          5 kg block with μ_s = 0.5 is <TeX>{String.raw`\mu_s mg = 24.5\ \text{N}`}</TeX> — the ramp result is
          the same physics with gravity doing the pulling.
        </p>
      </Prose>
      <Quiz question="You roughen the ramp so μ_s increases. What happens to the critical angle?"
        options={[
          { label: "It increases — more grip means you can tilt further before it slides", correct: true, hint: "Right: θ_c = arctan(μ_s) grows with μ_s." },
          { label: "It decreases — more friction makes it slide sooner", hint: "More friction holds the block longer, so you can tilt FURTHER, not less." },
          { label: "It doesn't change — angle never depends on friction", hint: "θ_c = arctan(μ_s) depends only on μ_s, so more friction means a larger critical angle." },
        ]} />
    </Lesson>
  );
}
