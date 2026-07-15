// Friction — static & kinetic (compute). One lecture, two presentation views
// (SlideView + TextbookView) built from the SAME interactive parts:
//   1. FrictionLab   — drag an applied-force handle; static friction matches the
//                      pull up to μ_s·N, then the block breaks free and kinetic
//                      friction μ_k·N (< μ_s·N) takes over and it accelerates.
//   2. FrictionGraph — the real model sampled: f rises on y=x to the peak μ_s·N,
//                      then DROPS to the μ_k·N plateau.
//   3. Derivation    — f_s ≤ μ_s N and f_k = μ_k N from N = mg on the flat.
//   4. Checks        — NumericAnswer (compute, wired to complete) + a spaced
//                      second-law Quiz.
// Physics truth: N = mg, f_s,max = μ_s m g, f_k = μ_k m g. With m = 5.0 kg,
// μ_s = 0.5, g = 9.8 → the block starts moving at μ_s m g = 24.5 N.
import { useRef, useState } from "react";
import {
  Lecture,
  SlideDeck,
  TeX,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  NumericAnswer,
  Derivation,
  Callout,
  Reveal,
  Readout,
  Quiz,
} from "@faraday-academy/kit/blocks";
import { useSimLoop, useSvgDrag, useAnimatedValue } from "../sim2d";
import { useNode } from "@faraday-academy/kit/world";
import { Button } from "@faraday-academy/kit/ui/button";
import { TextbookView } from "../textbook-view";

// ── Shared physics constants ────────────────────────────────────────────────
const MASS = 5.0; // kg
const G = 9.8; // m/s²
const NORMAL = MASS * G; // N = mg = 49 N on the flat

// ── SVG geometry (viewBox 0 0 600 300) ──────────────────────────────────────
const VB_W = 600;
const GROUND_Y = 214;
const BLOCK_W = 92;
const BLOCK_H = 64;
const BLOCK_TOP = GROUND_Y - BLOCK_H;
const BLOCK_MID = BLOCK_TOP + BLOCK_H / 2;
const START_X = 64;
const FORCE_SCALE = 2.4; // px per newton (arrow length)
const FAPP_MAX = 60; // N — top of the drag range
const MAX_X = 349; // block-left clamp so the pull arrow stays on-canvas
const POS_SCALE = 18; // px per metre (visualising the slide)

function maxStatic(muS: number) {
  return muS * NORMAL;
}
function kinetic(muK: number) {
  return muK * NORMAL;
}

// ── A single SVG force vector with a solid arrowhead (no <marker> id clashes) ─
function Vec(props: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const { x1, y1, x2, y2, color, width = 4 } = props;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1.5) return null; // hide a zero-length force
  const ux = dx / len;
  const uy = dy / len;
  const head = 13;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const px = -uy;
  const py = ux;
  const w = 6.5;
  return (
    <g stroke={color} fill={color}>
      <line x1={x1} y1={y1} x2={bx} y2={by} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px * w},${by + py * w} ${bx - px * w},${by - py * w}`} stroke="none" />
    </g>
  );
}

// ── 1. FrictionLab — the direct-manipulation model (drag the pull handle) ─────
function FrictionLab() {
  const [muS, setMuS] = useState(0.5);
  const [muK, setMuK] = useState(0.3);
  const [fApp, setFApp] = useState(0);
  const [pos, setPos] = useState(START_X); // block-left x, integrated while slipping
  const [moving, setMoving] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [homing, setHoming] = useState(false);
  const phys = useRef({ x: START_X, v: 0, moving: false });

  const fsMax = maxStatic(muS);
  const fk = kinetic(muK);
  // Displayed friction: static exactly matches the pull (up to the cap); once
  // sliding it is the constant kinetic value. Ease it so the break-away DROP is
  // a legible transition, not a snap.
  const fTarget = moving ? fk : Math.min(fApp, fsMax);
  const fEased = useAnimatedValue(fTarget, { duration: 0.25 });

  useSimLoop(
    (dt) => {
      const p = phys.current;
      if (homing) {
        const nx = p.x + (START_X - p.x) * Math.min(1, dt * 7);
        p.x = Math.abs(nx - START_X) < 0.4 ? START_X : nx;
        p.v = 0;
        if (p.x === START_X) setHoming(false);
        setPos(p.x);
        return;
      }
      if (!p.moving) return;
      p.v = Math.max(0, p.v + ((fApp - fk) / MASS) * dt);
      p.x = p.x + p.v * POS_SCALE * dt;
      if (p.x >= MAX_X) {
        p.x = MAX_X;
        p.v = 0;
      }
      if (p.v === 0 && fApp <= fsMax) {
        p.moving = false;
        setMoving(false);
      }
      setPos(p.x);
    },
    playing,
  );

  // Drag the pull handle → set F_app; crossing μ_s·N breaks the block free.
  const drag = useSvgDrag((mx, _my, _phase) => {
    const base = phys.current.x + BLOCK_W;
    const f = Math.max(0, Math.min(FAPP_MAX, (mx - base) / FORCE_SCALE));
    setFApp(f);
    if (f > maxStatic(muS) && !phys.current.moving) {
      phys.current.moving = true;
      setMoving(true);
      setPlaying(true);
    }
  });

  function onMuS(v: number) {
    setMuS(v);
    if (muK > v - 0.03) setMuK(Math.max(0.02, Math.round((v - 0.05) * 100) / 100));
  }
  function onMuK(v: number) {
    setMuK(Math.min(v, Math.round((muS - 0.03) * 100) / 100));
  }
  function reset() {
    phys.current.moving = false;
    phys.current.v = 0;
    setMoving(false);
    setFApp(0);
    setHoming(true);
    setPlaying(true);
  }

  const x = pos;
  const pullTipX = x + BLOCK_W + fApp * FORCE_SCALE;
  const fricTipX = x - fEased * FORCE_SCALE;
  const state = moving ? "Slipping" : fApp > 0 ? "Stuck" : "At rest";

  const hud = (
    <>
      <Readout label="F app" value={`${fApp.toFixed(1)} N`} tone="primary" />
      <Readout label="Friction f" value={`${fTarget.toFixed(1)} N`} tone={moving ? "destructive" : "default"} />
      <Readout label="State" value={state} tone={moving ? "destructive" : "default"} />
      <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>
        {playing ? "Pause" : "Play"}
      </Button>
      <Button size="sm" variant="outline" onClick={reset}>
        Reset
      </Button>
    </>
  );

  const controls = (
    <ControlGroup label="Surface roughness" onReset={() => { setMuS(0.5); setMuK(0.3); }}>
      <ParamSlider
        label="μ_s (static)"
        value={muS}
        min={0.1}
        max={0.9}
        step={0.05}
        onChange={onMuS}
        format={(v) => v.toFixed(2)}
      />
      <ParamSlider
        label="μ_k (kinetic)"
        value={muK}
        min={0.05}
        max={0.85}
        step={0.05}
        onChange={onMuK}
        format={(v) => v.toFixed(2)}
      />
    </ControlGroup>
  );

  return (
    <Workbench title="Drag the pull arrow →" panelTitle="Coefficients" hud={hud} controls={controls}>
      <svg viewBox={`0 0 ${VB_W} 300`} className="w-full select-none" role="img" aria-label="Block on a surface with an applied-force handle">
        {/* ground + surface hatching */}
        <line x1={0} y1={GROUND_Y} x2={VB_W} y2={GROUND_Y} stroke="var(--border)" strokeWidth={3} />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1={8 + i * 25}
            y1={GROUND_Y}
            x2={-6 + i * 25}
            y2={GROUND_Y + 14}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            opacity={0.5}
          />
        ))}

        {/* the block */}
        <rect
          x={x}
          y={BLOCK_TOP}
          width={BLOCK_W}
          height={BLOCK_H}
          rx={7}
          fill="var(--muted)"
          stroke={moving ? "var(--destructive)" : "var(--border)"}
          strokeWidth={moving ? 3 : 2}
        />
        <text x={x + BLOCK_W / 2} y={BLOCK_MID + 5} textAnchor="middle" fontSize={15} fill="var(--muted-foreground)">
          {MASS.toFixed(1)} kg
        </text>

        {/* weight (mg, down) and normal (N, up) — the vertical balance */}
        <Vec x1={x + BLOCK_W / 2} y1={BLOCK_MID} x2={x + BLOCK_W / 2} y2={BLOCK_MID + 46} color="var(--muted-foreground)" width={3} />
        <text x={x + BLOCK_W / 2 + 8} y={BLOCK_MID + 44} fontSize={13} fill="var(--muted-foreground)">mg</text>
        <Vec x1={x + BLOCK_W / 2} y1={BLOCK_TOP} x2={x + BLOCK_W / 2} y2={BLOCK_TOP - 46} color="var(--muted-foreground)" width={3} />
        <text x={x + BLOCK_W / 2 + 8} y={BLOCK_TOP - 34} fontSize={13} fill="var(--muted-foreground)">N</text>

        {/* friction (opposes the pull; shrinks at break-away) */}
        <Vec x1={x} y1={GROUND_Y - 8} x2={fricTipX} y2={GROUND_Y - 8} color="var(--chart-1)" width={5} />
        <text x={x - 8} y={GROUND_Y - 16} textAnchor="end" fontSize={13} fill="var(--chart-1)">f</text>

        {/* applied force (drag the handle at the tip) */}
        <Vec x1={x + BLOCK_W} y1={BLOCK_MID} x2={pullTipX} y2={BLOCK_MID} color="var(--primary)" width={5} />
        <text x={x + BLOCK_W + 6} y={BLOCK_MID - 12} fontSize={13} fill="var(--primary)">F</text>
        {/* grabbable handle */}
        <circle {...drag} cx={pullTipX} cy={BLOCK_MID} r={12} fill="var(--primary)" stroke="var(--background)" strokeWidth={2.5} style={{ cursor: "grab" }} />
        <circle {...drag} cx={pullTipX} cy={BLOCK_MID} r={22} fill="transparent" style={{ cursor: "grab" }} />
        {fApp < 1 ? (
          <text x={x + BLOCK_W + 34} y={BLOCK_MID + 5} fontSize={13} fill="var(--muted-foreground)">drag me →</text>
        ) : null}

        {/* the break-away threshold marker on the surface */}
        <text x={VB_W - 12} y={24} textAnchor="end" fontSize={12} fill="var(--muted-foreground)">
          break-away at μ_s·N = {fsMax.toFixed(1)} N
        </text>
      </svg>
    </Workbench>
  );
}

// ── 2. FrictionGraph — f vs F_app, sampled from the real model ────────────────
function FrictionGraph() {
  const [muS, setMuS] = useState(0.5);
  const [muK, setMuK] = useState(0.3);
  const [fApp, setFApp] = useState(18);

  const fsMax = maxStatic(muS);
  const fk = kinetic(muK);
  const cur = Math.round(fApp * 100) / 100;
  const curFric = cur <= fsMax + 1e-6 ? cur : fk;

  const xs = new Set<number>();
  for (let s = 0; s <= FAPP_MAX; s += 2) xs.add(s);
  xs.add(Math.round(fsMax * 100) / 100);
  xs.add(Math.round(Math.min(FAPP_MAX, fsMax + 0.02) * 100) / 100);
  xs.add(cur);
  const data = [...xs]
    .filter((v) => v >= 0 && v <= FAPP_MAX)
    .sort((a, b) => a - b)
    .map((v) => {
      const fr = v <= fsMax + 1e-6 ? v : fk;
      return {
        fapp: v,
        friction: Math.round(fr * 100) / 100,
        marker: Math.abs(v - cur) < 1e-6 ? Math.round(fr * 100) / 100 : null,
      };
    });

  function onMuS(v: number) {
    setMuS(v);
    if (muK > v - 0.03) setMuK(Math.max(0.02, Math.round((v - 0.05) * 100) / 100));
  }
  function onMuK(v: number) {
    setMuK(Math.min(v, Math.round((muS - 0.03) * 100) / 100));
  }

  const hud = (
    <>
      <Readout label="Peak μ_s·N" value={`${fsMax.toFixed(1)} N`} tone="primary" />
      <Readout label="Plateau μ_k·N" value={`${fk.toFixed(1)} N`} tone="destructive" />
      <Readout label="f at F app" value={`${curFric.toFixed(1)} N`} />
    </>
  );

  const controls = (
    <ControlGroup label="Sweep the model" onReset={() => { setMuS(0.5); setMuK(0.3); setFApp(18); }}>
      <ParamSlider label="μ_s (static)" value={muS} min={0.1} max={0.9} step={0.05} onChange={onMuS} format={(v) => v.toFixed(2)} />
      <ParamSlider label="μ_k (kinetic)" value={muK} min={0.05} max={0.85} step={0.05} onChange={onMuK} format={(v) => v.toFixed(2)} />
      <ParamSlider label="F_app" value={fApp} min={0} max={FAPP_MAX} step={0.5} onChange={setFApp} format={(v) => `${v.toFixed(1)} N`} />
    </ControlGroup>
  );

  return (
    <Workbench title="Friction force vs applied force" panelTitle="Model" hud={hud} controls={controls}>
      <Chart
        type="line"
        data={data}
        x="fapp"
        xType="number"
        yAxis
        legend
        height={280}
        series={[
          { key: "friction", label: "friction f (N)", color: "var(--chart-1)" },
          { key: "marker", label: "your F_app", color: "var(--chart-2)" },
        ]}
      />
    </Workbench>
  );
}

// ── 3. Derivation — f_s ≤ μ_s N and f_k = μ_k N from N = mg ────────────────────
function FrictionDerivation() {
  return (
    <Derivation
      title="From the free body to the friction laws"
      steps={[
        { tex: String.raw`\sum F_y = N - mg = 0`, note: "vertical balance: the block neither sinks nor lifts" },
        { tex: String.raw`N = mg`, note: "normal force on a horizontal surface" },
        { tex: String.raw`f_s = F_{\text{app}}`, note: "at rest, static friction exactly matches the pull" },
        { tex: String.raw`f_s \le f_{s,\max} = \mu_s N = \mu_s\, m g`, note: "…but only up to the static cap" },
        { tex: String.raw`f_k = \mu_k N = \mu_k\, m g \quad (\mu_k < \mu_s)`, note: "once sliding, friction is constant and smaller" },
      ]}
    />
  );
}

// ── 4. Checks ─────────────────────────────────────────────────────────────────
function StartCheck({ onComplete }: { onComplete: () => void }) {
  return (
    <NumericAnswer
      question="A 5.0 kg block sits on a flat surface with μ_s = 0.5 (take g = 9.8 m/s²). What is the minimum horizontal force needed to start it moving?"
      answer={24.5}
      unit="N"
      hint="It must exceed the static cap. Compute μ_s · m · g and read the peak of the f-vs-F_app graph."
      onCorrect={onComplete}
    />
  );
}

function SecondLawQuiz() {
  return (
    <Quiz
      question="Spaced recall — once the block is sliding, the net force on it is 15 N. For m = 5.0 kg, what is its acceleration?"
      options={[
        { label: "3.0 m/s²", correct: true, hint: "Yes — Newton's second law: a = F_net / m = 15 / 5." },
        { label: "75 m/s²", hint: "That multiplies instead of dividing. a = F_net / m, not F_net · m." },
        { label: "0.33 m/s²", hint: "That inverts the ratio. a = F_net / m = 15 / 5." },
        { label: "9.8 m/s²", hint: "That's g. Here the horizontal net force sets the acceleration, not gravity." },
      ]}
    />
  );
}

// ── The lecture: two views composed from the parts above ─────────────────────
export default function FrictionLecture() {
  const { complete } = useNode();

  // ---- TextbookView: full chapter, prose before/after each interactive ----
  const textbook = (
    <TextbookView
      notesKey="friction"
      pages={[
        {
          id: "intro",
          title: "Why a heavy box is hard to start but easy to keep going",
          content: (
            <div className="flex flex-col gap-4">
              <Prose>
                <p>
                  Push a heavy box across the floor and you meet a strange resistance. At first the box refuses to
                  budge no matter how gently you lean into it — the harder you push, the harder something pushes back,
                  and nothing moves. Then, at some threshold, it suddenly gives and slides, and — surprisingly — it
                  now takes <strong>less</strong> force to keep it gliding than it took to break it loose. That whole
                  story is friction, and it splits cleanly into two regimes: <strong>static</strong> friction while
                  the surfaces are locked together, and <strong>kinetic</strong> friction once they slide.
                </p>
                <p>
                  Both regimes are anchored by the same quantity: the <strong>normal force</strong>{" "}
                  <TeX>{String.raw`N`}</TeX>, the perpendicular push the surface gives back. On a flat floor the block
                  neither sinks nor lifts, so the vertical forces balance and{" "}
                  <TeX>{String.raw`N = mg`}</TeX>. Friction scales with how hard the surfaces are pressed together,
                  which is exactly <TeX>{String.raw`N`}</TeX>.
                </p>
              </Prose>
              <Callout title="The one idea">
                Static friction <em>adjusts</em> to match your pull, but only up to a ceiling{" "}
                <TeX>{String.raw`f_{s,\max} = \mu_s N`}</TeX>. Past that ceiling the block breaks free and kinetic
                friction takes over at the smaller, constant value <TeX>{String.raw`f_k = \mu_k N`}</TeX>.
              </Callout>
            </div>
          ),
        },
        {
          id: "model",
          title: "Feel it: pull until it breaks free",
          content: (
            <div className="flex flex-col gap-4">
              <Prose>
                <p>
                  Grab the blue handle at the tip of the applied-force arrow and drag it to the right to increase{" "}
                  <TeX>{String.raw`F_{\text{app}}`}</TeX>. Watch the red friction arrow underneath: while the block is
                  stuck it grows to <em>exactly</em> match your pull, so the two cancel and the block stays put. This
                  is the key move — static friction is not a fixed number, it is whatever it needs to be to keep the
                  block in place, right up to its limit.
                </p>
              </Prose>
              <FrictionLab />
              <Prose>
                <p>
                  Keep pulling. The instant <TeX>{String.raw`F_{\text{app}}`}</TeX> exceeds the static cap{" "}
                  <TeX>{String.raw`\mu_s N`}</TeX>, the block breaks free. Two things change at once: the friction
                  arrow <strong>drops</strong> to the smaller kinetic value <TeX>{String.raw`\mu_k N`}</TeX>, and
                  because the pull now beats friction, there is a net force — so the block accelerates and slides. Try
                  the coefficient sliders: raising <TeX>{String.raw`\mu_s`}</TeX> pushes the break-away point higher,
                  while <TeX>{String.raw`\mu_k`}</TeX> sets how much friction remains once it is gliding. Notice you
                  can never quite make the block move smoothly at the threshold — there is always that little jump.
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "graph",
          title: "The peak-and-plateau graph",
          content: (
            <div className="flex flex-col gap-4">
              <Prose>
                <p>
                  Everything you just felt lives in one graph: friction force <TeX>{String.raw`f`}</TeX> against the
                  applied force <TeX>{String.raw`F_{\text{app}}`}</TeX>. Below is that relationship sampled straight
                  from the model. Move the <TeX>{String.raw`F_{\text{app}}`}</TeX> slider to walk the coloured dot
                  along the curve and read off the friction at each point.
                </p>
              </Prose>
              <FrictionGraph />
              <Prose>
                <p>
                  The curve has two parts. While stuck, friction tracks the pull along the line{" "}
                  <TeX>{String.raw`f = F_{\text{app}}`}</TeX> — a 45° rise, because static friction matches whatever
                  you apply. It climbs until it reaches the <strong>peak</strong>{" "}
                  <TeX>{String.raw`f_{s,\max} = \mu_s N`}</TeX>. One step past the peak the block lets go and friction
                  falls off a cliff down to the flat <strong>plateau</strong> <TeX>{String.raw`f_k = \mu_k N`}</TeX>,
                  where it stays no matter how much harder you pull. That vertical drop is the mathematical picture of
                  &ldquo;hard to start, easier to keep going.&rdquo;
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "derive",
          title: "Where the two laws come from",
          content: (
            <div className="flex flex-col gap-4">
              <Prose>
                <p>
                  Both results follow from one free-body diagram. Vertically nothing moves, so the surface push
                  balances the weight; horizontally, static friction is a matched reaction until it saturates. Step
                  through the derivation — each line names the move, and the last two lines are the results we use for
                  everything else.
                </p>
              </Prose>
              <FrictionDerivation />
              <Prose>
                <p>So the maximum static friction and the constant sliding friction are, respectively,</p>
              </Prose>
              <TeX block>{String.raw`f_{s,\max} = \mu_s\, m g \qquad\text{and}\qquad f_k = \mu_k\, m g.`}</TeX>
              <Prose>
                <p>
                  Because <TeX>{String.raw`\mu_k < \mu_s`}</TeX> for ordinary surfaces, the plateau always sits below
                  the peak — which is why the block lurches forward the moment it breaks free.
                </p>
              </Prose>
              <Reveal label="Why is μ_k smaller than μ_s?">
                <p>
                  At rest, microscopic contact points have time to settle and weakly bond, so it takes extra force to
                  shear them all at once. Once sliding, the surfaces skate over those contacts before they can fully
                  re-form, so less force is needed to maintain motion. The coefficients are measured constants for a
                  given pair of materials — we take their values as given rather than deriving them from first
                  principles here.
                </p>
              </Reveal>
            </div>
          ),
        },
        {
          id: "check",
          title: "Check yourself",
          content: (
            <div className="flex flex-col gap-4">
              <Prose>
                <p>
                  Put the peak to work. To <em>start</em> a block moving you must beat the static cap, so the minimum
                  force is exactly <TeX>{String.raw`\mu_s\, m g`}</TeX>. Compute it for the numbers below, then confirm
                  it against the peak of the graph.
                </p>
              </Prose>
              <StartCheck onComplete={complete} />
              <Prose>
                <p>
                  And once it <em>is</em> sliding, the leftover net force sets the acceleration through Newton&rsquo;s
                  second law — the tool from the previous lesson. One more to keep it fresh:
                </p>
              </Prose>
              <SecondLawQuiz />
            </div>
          ),
        },
      ]}
    />
  );

  // ---- SlideView: one beat per screen ----
  const slides = (
    <SlideDeck
      slides={[
        {
          id: "hook",
          title: "Break-away",
          content: (
            <div className="flex h-full flex-col justify-center gap-5">
              <Prose heading="Hard to start, easy to keep going">
                <p>
                  Static friction rises to match your pull — up to a ceiling. Beat the ceiling and the block breaks
                  free, friction <strong>drops</strong>, and it slides. Two regimes, one normal force{" "}
                  <TeX>{String.raw`N = mg`}</TeX>.
                </p>
              </Prose>
              <Callout title="Watch for">
                While stuck, <TeX>{String.raw`f_s = F_{\text{app}}`}</TeX>. At the cap{" "}
                <TeX>{String.raw`\mu_s N`}</TeX> it lets go and switches to <TeX>{String.raw`f_k = \mu_k N`}</TeX>.
              </Callout>
            </div>
          ),
        },
        {
          id: "lab",
          title: "Drag to break it free",
          content: (
            <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
              <FrictionLab />
              <div className="flex flex-col justify-center">
                <Prose>
                  <p>
                    Drag the blue handle to grow <TeX>{String.raw`F_{\text{app}}`}</TeX>. The red friction arrow
                    matches you exactly until <TeX>{String.raw`F_{\text{app}} > \mu_s N`}</TeX> — then it drops to{" "}
                    <TeX>{String.raw`\mu_k N`}</TeX> and the block accelerates. Pause mid-slide; change the
                    coefficients and feel the threshold move.
                  </p>
                </Prose>
              </div>
            </div>
          ),
        },
        {
          id: "graph",
          title: "Peak, then plateau",
          content: (
            <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
              <FrictionGraph />
              <div className="flex flex-col justify-center">
                <Prose>
                  <p>
                    Friction rises along <TeX>{String.raw`f = F_{\text{app}}`}</TeX> to the peak{" "}
                    <TeX>{String.raw`\mu_s N`}</TeX>, then falls to the flat plateau <TeX>{String.raw`\mu_k N`}</TeX>.
                    Slide <TeX>{String.raw`F_{\text{app}}`}</TeX> to walk the dot along the real model.
                  </p>
                </Prose>
              </div>
            </div>
          ),
        },
        {
          id: "derive",
          title: "The two laws",
          content: (
            <div className="flex h-full flex-col justify-center gap-4">
              <FrictionDerivation />
              <Prose>
                <p>
                  From <TeX>{String.raw`N = mg`}</TeX>: the static cap is{" "}
                  <TeX>{String.raw`f_{s,\max} = \mu_s m g`}</TeX> and the sliding value is{" "}
                  <TeX>{String.raw`f_k = \mu_k m g`}</TeX>, with <TeX>{String.raw`\mu_k < \mu_s`}</TeX>.
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "check",
          title: "Your turn",
          content: (
            <div className="flex h-full flex-col justify-center gap-4">
              <StartCheck onComplete={complete} />
              <SecondLawQuiz />
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <Lecture
      title="Friction"
      lead="Static friction matches your pull up to a ceiling; break the ceiling and kinetic friction takes over. Slides for class, textbook for self-study."
      defaultView="textbook"
      views={[
        { id: "slide", label: "Slides", content: slides },
        { id: "textbook", label: "Textbook", content: textbook },
      ]}
    />
  );
}
