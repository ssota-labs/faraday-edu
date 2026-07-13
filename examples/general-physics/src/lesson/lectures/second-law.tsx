// second-law — Newton's 2nd law: F = ma (compute).
// One lecture, two presentation views (SlideView + TextbookView) built from the
// SAME interactive parts:
//   1. <ForceLab>   — direct-manipulation model: DRAG the force-vector tip on the
//                     block (useSvgDrag); a = F/m drives live motion (useSimLoop).
//   2. <AccelChart> — a-vs-F line of slope 1/m, sampled from the real a = F/m.
//   3. <SecondLawDerivation> / <ForceMassCompare> — a = F/m derived + compared.
//   4. <SecondLawCheck> — NumericAnswer (12 N on 3.0 kg → 4 m/s²) wired to complete().
// Plan of record: .faraday/plan/newtonian-mechanics/nodes/second-law.md
import { useId, useMemo, useState } from "react";
import {
  Lecture,
  SlideDeck,
  TeX,
  Prose,
  Chart,
  ParamSlider,
  NumericAnswer,
  Derivation,
  Compare,
  Callout,
  Reveal,
  Readout,
  Workbench,
  Quiz,
} from "@faraday-academy/runtime/blocks";
import { useSimLoop, useSvgDrag, useAnimatedValue } from "../sim2d";
import { useNode } from "@faraday-academy/runtime/world";
import { Button } from "@faraday-academy/runtime/ui/button";
import { TextbookView } from "../textbook-view";

// ── model constants (viewBox space) ──────────────────────────────────────────
const VW = 360;
const VH = 220;
const CX = VW / 2;
const CY = VH / 2;
const MINX = 8;
const MAXX = VW - 8;
const MINY = 8;
const MAXY = VH - 8;
const FORCE_SCALE = 4.2; // px per newton (arrow length)
const VEL_SCALE = 6; // px per (m/s) (velocity arrow length)
const PX_PER_M = 7; // px per metre (motion on screen)
const REST = 0.9; // wall restitution — keeps the block on the table
const MAX_N = 26; // largest force the arrow can express

const clampMag = (fx: number, fy: number, max: number) => {
  const mag = Math.hypot(fx, fy);
  if (mag <= max) return { fx, fy };
  return { fx: (fx * max) / mag, fy: (fy * max) / mag };
};

const fmt = (n: number) => (Math.abs(n) < 10 ? n.toFixed(1) : n.toFixed(0));

// ─────────────────────────────────────────────────────────────────────────────
// 1. ForceLab — the centrepiece. Grab the arrow tip, aim the force, release.
// ─────────────────────────────────────────────────────────────────────────────
function ForceLab() {
  const headId = useId().replace(/:/g, "");
  const [sim, setSim] = useState({ x: CX, y: CY, vx: 0, vy: 0 });
  const [force, setForce] = useState({ fx: 12, fy: 0 });
  const [mass, setMass] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [hoverTip, setHoverTip] = useState(false);
  const [dragging, setDragging] = useState(false);

  // block half-size grows with mass — eased so a mass change never teleports
  const hs = useAnimatedValue(13 + mass * 1.6);

  const nMag = Math.hypot(force.fx, force.fy);
  const accel = nMag / mass; // m/s^2 — the reported truth: a = |F| / m
  const speed = Math.hypot(sim.vx, sim.vy);

  // live dynamics: a = F/m, integrate velocity then position, bounce off walls
  useSimLoop(
    (dt) => {
      setSim((s) => {
        if (resetting) {
          const k = Math.min(1, dt * 6);
          const nx = s.x + (CX - s.x) * k;
          const ny = s.y + (CY - s.y) * k;
          const nvx = s.vx * (1 - k);
          const nvy = s.vy * (1 - k);
          if (Math.hypot(CX - nx, CY - ny) < 0.4 && Math.hypot(nvx, nvy) < 0.03) {
            setResetting(false);
            return { x: CX, y: CY, vx: 0, vy: 0 };
          }
          return { x: nx, y: ny, vx: nvx, vy: nvy };
        }
        const ax = force.fx / mass;
        const ay = force.fy / mass;
        let vx = s.vx + ax * dt;
        let vy = s.vy + ay * dt;
        let x = s.x + vx * dt * PX_PER_M;
        let y = s.y + vy * dt * PX_PER_M;
        if (x < MINX + hs) {
          x = MINX + hs;
          vx = -vx * REST;
        }
        if (x > MAXX - hs) {
          x = MAXX - hs;
          vx = -vx * REST;
        }
        if (y < MINY + hs) {
          y = MINY + hs;
          vy = -vy * REST;
        }
        if (y > MAXY - hs) {
          y = MAXY - hs;
          vy = -vy * REST;
        }
        return { x, y, vx, vy };
      });
    },
    playing || resetting,
  );

  // drag the force-vector TIP (viewBox coords) — grabbing pauses so you can aim
  const drag = useSvgDrag((px, py, phase) => {
    if (phase === "start") {
      setDragging(true);
      setPlaying(false);
      setResetting(false);
    }
    if (phase === "end") setDragging(false);
    setForce(clampMag((px - sim.x) / FORCE_SCALE, (py - sim.y) / FORCE_SCALE, MAX_N));
  });

  const play = () => {
    setResetting(false);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setResetting(true);
  };

  const tipX = sim.x + force.fx * FORCE_SCALE;
  const tipY = sim.y + force.fy * FORCE_SCALE;
  const velX = sim.x + sim.vx * VEL_SCALE;
  const velY = sim.y + sim.vy * VEL_SCALE;
  const tipR = dragging ? 12 : hoverTip ? 11 : 8;

  const hud = (
    <>
      <Readout label="F" value={`${fmt(nMag)} N`} tone="primary" />
      <Readout label="m" value={`${fmt(mass)} kg`} />
      <Readout label="a" value={`${fmt(accel)} m/s²`} tone="primary" />
      <Button size="sm" variant={playing ? "secondary" : "default"} onClick={play}>
        {playing ? "Pause" : "Play"}
      </Button>
      <Button size="sm" variant="outline" onClick={reset}>
        Reset
      </Button>
    </>
  );

  const controls = (
    <div className="flex flex-col gap-4 py-4">
      <ParamSlider
        label="Mass m"
        value={mass}
        min={1}
        max={10}
        step={0.5}
        onChange={setMass}
        format={(v) => `${fmt(v)} kg`}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        The block grows with its mass. Same force, more mass → the arrow is the same length but the
        block accelerates less: <TeX>{String.raw`a = F/m`}</TeX>.
      </p>
    </div>
  );

  return (
    <Workbench title="Force lab — drag the arrow, then Play" panelTitle="Mass" hud={hud} controls={controls}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full touch-none select-none" role="img" aria-label="A block on a frictionless table with a draggable force arrow">
        <defs>
          <marker id={`${headId}-f`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--primary)" />
          </marker>
          <marker id={`${headId}-v`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--chart-2)" />
          </marker>
        </defs>

        {/* frictionless table + faint grid */}
        <rect x={MINX} y={MINY} width={MAXX - MINX} height={MAXY - MINY} rx={10} fill="var(--muted)" opacity={0.35} />
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={`gx${i}`} x1={MINX + (i * (MAXX - MINX)) / 6} y1={MINY} x2={MINX + (i * (MAXX - MINX)) / 6} y2={MAXY} stroke="var(--border)" strokeWidth={1} opacity={0.5} />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={`gy${i}`} x1={MINX} y1={MINY + (i * (MAXY - MINY)) / 4} x2={MAXX} y2={MINY + (i * (MAXY - MINY)) / 4} stroke="var(--border)" strokeWidth={1} opacity={0.5} />
        ))}

        {/* velocity arrow (what the block is doing) */}
        {speed > 0.15 ? (
          <line x1={sim.x} y1={sim.y} x2={velX} y2={velY} stroke="var(--chart-2)" strokeWidth={2.5} markerEnd={`url(#${headId}-v)`} opacity={0.85} />
        ) : null}

        {/* the block */}
        <rect x={sim.x - hs} y={sim.y - hs} width={hs * 2} height={hs * 2} rx={5} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />

        {/* the force arrow (what you control) */}
        {nMag > 0.2 ? (
          <line x1={sim.x} y1={sim.y} x2={tipX} y2={tipY} stroke="var(--primary)" strokeWidth={3.5} markerEnd={`url(#${headId}-f)`} />
        ) : null}

        {/* the draggable tip handle (visual) */}
        <circle
          cx={tipX}
          cy={tipY}
          r={tipR}
          fill="var(--primary)"
          stroke="var(--background)"
          strokeWidth={2}
          style={{ pointerEvents: "none", transition: "r 120ms ease" }}
        />
        {/* bigger invisible hit target on top — carries the grab + hover affordance */}
        <circle
          cx={tipX}
          cy={tipY}
          r={18}
          fill="transparent"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerEnter={() => setHoverTip(true)}
          onPointerLeave={() => setHoverTip(false)}
          {...drag}
        />

        {/* on-canvas hint */}
        {!playing && !dragging ? (
          <text x={CX} y={MAXY - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
            Drag the arrow tip to aim the force · press Play to release the block
          </text>
        ) : null}
      </svg>
    </Workbench>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AccelChart — the quantitative claim: a vs F is a straight line, slope 1/m.
// ─────────────────────────────────────────────────────────────────────────────
function AccelChart() {
  const [mass, setMass] = useState(3);
  const data = useMemo(
    () => Array.from({ length: 13 }, (_, i) => ({ F: i * 2, a: (i * 2) / mass })),
    [mass],
  );
  return (
    <div className="flex flex-col gap-4">
      <Workbench title="Acceleration vs net force" panelTitle="Mass" controls={
        <div className="flex flex-col gap-4 py-4">
          <ParamSlider label="Mass m" value={mass} min={1} max={10} step={0.5} onChange={setMass} format={(v) => `${fmt(v)} kg`} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Every point is <TeX>{String.raw`a = F/m`}</TeX>. Increase the mass and the whole line tips
            flatter — a smaller slope <TeX>{String.raw`1/m`}</TeX>.
          </p>
        </div>
      }>
        <div className="px-1 pt-2">
          <Chart
            type="line"
            data={data}
            x="F"
            xType="number"
            yAxis
            series={[{ key: "a", label: "a = F / m", color: "var(--chart-1)" }]}
            height={240}
          />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            horizontal: net force <TeX>{String.raw`F`}</TeX> (N) · vertical: acceleration{" "}
            <TeX>{String.raw`a`}</TeX> (m/s²)
          </p>
        </div>
      </Workbench>
      <Callout title="Read the slope">
        The graph is a straight line through the origin with slope{" "}
        <TeX>{String.raw`\tfrac{1}{m}`}</TeX>. Double the force and you double the acceleration
        (<TeX>{String.raw`a \propto F`}</TeX>); double the mass and you halve it
        (<TeX>{String.raw`a \propto 1/m`}</TeX>).
      </Callout>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Derivation + Compare — a = F/m derived, then the two knobs contrasted.
// ─────────────────────────────────────────────────────────────────────────────
function SecondLawDerivation() {
  return (
    <Derivation
      title="From ΣF = ma to a = F/m"
      steps={[
        { tex: String.raw`\sum F = m\,a`, note: "Newton's second law: net force equals mass times acceleration" },
        { tex: String.raw`\frac{\sum F}{m} = \frac{m\,a}{m}`, note: "divide both sides by the mass m" },
        { tex: String.raw`\frac{\sum F}{m} = a`, note: "the m cancels on the right" },
        { tex: String.raw`a = \dfrac{F}{m}`, note: "with a single net force F, acceleration is F over m" },
      ]}
    />
  );
}

function ForceMassCompare() {
  return (
    <Compare
      items={[
        {
          value: "fixed-F",
          label: "Fix F, vary m",
          content: (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-foreground/90">
                Hold the net force at <TeX>{String.raw`F = 12\ \text{N}`}</TeX>. Acceleration falls
                as mass rises — it is inversely proportional to <TeX>{String.raw`m`}</TeX>:
              </p>
              <TeX block>{String.raw`m=2\text{ kg}\Rightarrow a=6,\quad m=3\Rightarrow a=4,\quad m=6\Rightarrow a=2\ \text{m/s}^2`}</TeX>
              <p className="text-sm text-muted-foreground">Twice the mass, half the acceleration.</p>
            </div>
          ),
        },
        {
          value: "fixed-m",
          label: "Fix m, vary F",
          content: (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-foreground/90">
                Hold the mass at <TeX>{String.raw`m = 3\ \text{kg}`}</TeX>. Acceleration climbs in
                step with the force — it is directly proportional to <TeX>{String.raw`F`}</TeX>:
              </p>
              <TeX block>{String.raw`F=6\text{ N}\Rightarrow a=2,\quad F=12\Rightarrow a=4,\quad F=24\Rightarrow a=8\ \text{m/s}^2`}</TeX>
              <p className="text-sm text-muted-foreground">Twice the force, twice the acceleration.</p>
            </div>
          ),
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Checks — closing NumericAnswer (compute) + spaced first-law recall (Quiz).
// ─────────────────────────────────────────────────────────────────────────────
function SecondLawCheck({ onComplete }: { onComplete: () => void }) {
  return (
    <NumericAnswer
      question="A net force of 12 N acts on a 3.0 kg cart on a frictionless track. What is its acceleration?"
      answer={4}
      unit="m/s²"
      tolerance={0.1}
      hint="Use a = F/m from the derivation: divide the 12 N net force by the 3.0 kg mass."
      onCorrect={onComplete}
    />
  );
}

function FirstLawRecall() {
  return (
    <Quiz
      question="Spaced recall (1st law): a puck glides at a steady 4 m/s across frictionless ice. What is the NET force on it?"
      options={[
        {
          label: "Zero — constant velocity means the forces are balanced.",
          correct: true,
          hint: "Right. Constant velocity ⇒ a = 0 ⇒ ΣF = 0. Motion needs no net force to continue.",
        },
        {
          label: "A steady forward force keeps it moving.",
          hint: "That is the impetus misconception. A net force would change the velocity — but the puck's speed is constant.",
        },
        {
          label: "A force equal to its weight, pointing forward.",
          hint: "Weight is vertical and cancels with the ice's support force. Neither points along the motion.",
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The lecture — one build, two views over the SAME parts.
// ─────────────────────────────────────────────────────────────────────────────
export default function SecondLaw() {
  const { complete } = useNode();

  // ── Textbook view: a full chapter, prose between every interactive ──────────
  const textbook = (
    <TextbookView
      notesKey="second-law"
      pages={[
        {
          id: "hook",
          title: "What a force actually does",
          content: (
            <Prose>
              <p>
                The first law told us that an object with <strong>no net force</strong> keeps doing
                exactly what it was doing — resting or coasting in a straight line at constant speed.
                That leaves the real question of dynamics unanswered: when the forces{" "}
                <em>don't</em> balance, what happens, and how much? A gentle push on a shopping trolley
                nudges it forward slowly; the same push on a toy car sends it shooting off. Same push,
                very different response. Newton's second law is the exact rule that connects the three
                quantities in that sentence — the net force, the mass, and the resulting acceleration.
              </p>
              <p>
                The key word is <strong>acceleration</strong>, not speed. A force does not set how fast
                something moves; it sets how quickly the motion <em>changes</em>. Below you will grab a
                force and feel this directly: the arrow you drag is the cause, and the block's changing
                velocity is the effect.
              </p>
            </Prose>
          ),
        },
        {
          id: "lab",
          title: "Grab the force",
          content: (
            <div className="flex flex-col gap-5">
              <Prose>
                <p>
                  Drag the tip of the primary arrow to aim a net force on the block, then press{" "}
                  <strong>Play</strong> to release it. Watch two things. First, the block accelerates
                  in the <em>direction of the force</em> — the green velocity arrow grows along the
                  force, not wherever the block happens to be heading. Second, the block keeps speeding
                  up as long as the force acts: a steady force gives a steady acceleration, so the
                  velocity climbs without limit until a wall turns it around.
                </p>
                <p>
                  Now slide the mass up and re-run it. The force arrow can be exactly as long as before,
                  yet a heavier block is more sluggish — it gains speed more slowly. That reluctance to
                  be accelerated is what mass <em>is</em>. The live read-out reports{" "}
                  <TeX>{String.raw`a = F/m`}</TeX> as you go.
                </p>
              </Prose>
              <ForceLab />
              <Prose>
                <p>
                  Notice the moment you point the force <em>against</em> the block's motion: it slows,
                  stops, and reverses — a decelerating car under braking, or a ball tossed upward. The
                  force never had to point along the velocity. This is the crucial break from everyday
                  intuition: <strong>force sets acceleration, and acceleration is a change in velocity</strong>,
                  which may speed the object up, slow it down, or bend its path.
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "graph",
          title: "How acceleration scales",
          content: (
            <div className="flex flex-col gap-5">
              <Prose>
                <p>
                  The lab gives a feel; a graph pins down the exact proportions. Holding the mass fixed
                  and sampling the model at many force values traces out acceleration versus net force.
                  The claim to test is strong and specific: it should be a straight line through the
                  origin. If it is, then <TeX>{String.raw`a`}</TeX> and <TeX>{String.raw`F`}</TeX> are
                  strictly proportional.
                </p>
              </Prose>
              <AccelChart />
              <Prose>
                <p>
                  It is a line, and its slope is <TeX>{String.raw`1/m`}</TeX>. Read that carefully: the
                  line's height at any force is the acceleration, so a shallower line (larger mass) means
                  less acceleration for the same force. Two independent proportionalities live in one
                  graph — <TeX>{String.raw`a \propto F`}</TeX> along the line, and{" "}
                  <TeX>{String.raw`a \propto 1/m`}</TeX> in how steep the line is.
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "derive",
          title: "Where a = F/m comes from",
          content: (
            <div className="flex flex-col gap-5">
              <Prose>
                <p>
                  Both proportionalities are captured by a single equation. Newton's second law is
                  usually stated as <TeX>{String.raw`\sum F = m\,a`}</TeX> — the net force equals mass
                  times acceleration. To predict the motion the lab just showed, we want acceleration
                  by itself. Step through the algebra:
                </p>
              </Prose>
              <SecondLawDerivation />
              <Prose>
                <p>
                  The last line, <TeX>{String.raw`a = F/m`}</TeX>, is exactly what the read-out
                  computed and what the graph plotted. It also makes the two behaviours obvious at a
                  glance: <TeX>{String.raw`F`}</TeX> sits on top (more force, more acceleration) and{" "}
                  <TeX>{String.raw`m`}</TeX> sits underneath (more mass, less acceleration). The tab
                  panel below isolates each knob so you can see them one at a time.
                </p>
              </Prose>
              <ForceMassCompare />
              <Reveal label="Why mass, not weight?">
                <p>
                  The <TeX>{String.raw`m`}</TeX> in <TeX>{String.raw`a = F/m`}</TeX> is{" "}
                  <em>inertial mass</em> — the resistance to being accelerated — and it is the same
                  number whether you push the block on Earth, on the Moon, or in deep space. Weight is
                  a force (<TeX>{String.raw`W = mg`}</TeX>) that changes with gravity; the mass in the
                  second law does not. On the frictionless table above there is no weight along the
                  motion at all, yet <TeX>{String.raw`a = F/m`}</TeX> still governs everything.
                </p>
              </Reveal>
            </div>
          ),
        },
        {
          id: "check",
          title: "Compute it",
          content: (
            <div className="flex flex-col gap-5">
              <Prose>
                <p>
                  You have felt it, graphed it, and derived it. Now use it. Take a specific case and
                  compute the acceleration directly from <TeX>{String.raw`a = F/m`}</TeX> — the whole
                  point of the law is that it turns a known force and mass into a predicted motion.
                </p>
              </Prose>
              <SecondLawCheck onComplete={complete} />
              <Prose>
                <p>
                  One last consolidation, reaching back to the first law so the two do not blur
                  together: the second law is what happens when the net force is <em>not</em> zero.
                </p>
              </Prose>
              <FirstLawRecall />
              <Callout title="The takeaway">
                A net force produces an acceleration in its own direction, equal to{" "}
                <TeX>{String.raw`a = F/m`}</TeX>: bigger force accelerates more, bigger mass accelerates
                less. Motion continues on its own (first law); a net force <em>changes</em> it.
              </Callout>
            </div>
          ),
        },
      ]}
    />
  );

  // ── Slide view: one beat per slide, landscape splits where they help ────────
  const slides = (
    <SlideDeck
      slides={[
        {
          id: "title",
          title: "The question",
          content: (
            <div className="flex h-full flex-col justify-center gap-4">
              <h2 className="text-3xl font-semibold tracking-tight">Same push, different result</h2>
              <Prose>
                <p className="text-lg">
                  A nudge sends a toy car flying but barely moves a loaded trolley. Newton's second law
                  is the exact rule linking the <strong>net force</strong>, the <strong>mass</strong>,
                  and the <strong>acceleration</strong> that results.
                </p>
                <p>
                  A force does not set how fast something moves — it sets how fast the motion{" "}
                  <em>changes</em>. Let's grab one and feel it.
                </p>
              </Prose>
            </div>
          ),
        },
        {
          id: "lab",
          title: "Drag the force",
          content: (
            <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
              <ForceLab />
              <div className="flex flex-col justify-center">
                <Prose>
                  <p>
                    Drag the arrow tip to aim a net force, then <strong>Play</strong>. The block
                    accelerates <em>along the force</em> and keeps gaining speed while it acts.
                  </p>
                  <p>
                    Raise the mass: the same arrow now produces less acceleration. That sluggishness is
                    exactly what <TeX>{String.raw`a = F/m`}</TeX> predicts.
                  </p>
                </Prose>
              </div>
            </div>
          ),
        },
        {
          id: "graph",
          title: "a vs F",
          content: (
            <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
              <AccelChart />
              <div className="flex flex-col justify-center">
                <Prose>
                  <p>
                    Sampling the model at a fixed mass gives a straight line through the origin: so{" "}
                    <TeX>{String.raw`a \propto F`}</TeX>.
                  </p>
                  <p>
                    Its slope is <TeX>{String.raw`1/m`}</TeX> — heavier mass, flatter line, less
                    acceleration per newton.
                  </p>
                </Prose>
              </div>
            </div>
          ),
        },
        {
          id: "derive",
          title: "a = F/m",
          content: (
            <div className="flex h-full flex-col justify-center gap-4">
              <Prose>
                <p className="text-lg">
                  Start from Newton's second law and solve for the acceleration:
                </p>
              </Prose>
              <SecondLawDerivation />
              <ForceMassCompare />
            </div>
          ),
        },
        {
          id: "check",
          title: "Compute it",
          content: (
            <div className="flex h-full flex-col justify-center gap-4">
              <Prose>
                <p className="text-lg">
                  A net force of 12 N acts on a 3.0 kg cart. Use <TeX>{String.raw`a = F/m`}</TeX>.
                </p>
              </Prose>
              <SecondLawCheck onComplete={complete} />
              <Callout title="The takeaway">
                <TeX>{String.raw`a = F/m`}</TeX>: bigger force accelerates more, bigger mass accelerates
                less — in the direction of the net force.
              </Callout>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <Lecture
      title="2nd Law · F = ma"
      lead="Drag a force onto a block and feel it accelerate — then derive a = F/m and compute with it. Slides for class, textbook for self-study."
      defaultView="textbook"
      views={[
        { id: "textbook", label: "Textbook", content: textbook },
        { id: "slide", label: "Slides", content: slides },
      ]}
    />
  );
}
