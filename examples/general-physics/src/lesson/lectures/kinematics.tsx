// Lecture: Motion — position, velocity, acceleration (constant-acceleration
// kinematics / SUVAT). ONE self-contained file offering two presentation views
// (SlideDeck + TextbookView) that SHARE the same interactive components.
//
// The three interactives are authored once as local components and composed into
// both views:
//   1. <CarLab/>       — a car on a track driven by a real rAF simulation of
//                        x(t) = v0 t + ½ a t², with a fading trail + live HUD.
//   2. <MotionGraphs/> — a <Chart> of x(t) and v(t) sampled from the SAME model.
//   3. DERIV_STEPS     — a <Derivation> ending at x = x0 + v0 t + ½ a t².
//   4. <KinematicsCheck/> — a <NumericAnswer> wired to node completion.
import { useMemo, useRef, useState } from "react";
import {
  Lecture,
  SlideDeck,
  TeX,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  Derivation,
  Reveal,
  Callout,
  Readout,
  NumericAnswer,
  type DerivationStep,
} from "@faraday-academy/runtime/blocks";
import { useRafLoop, useAnimatedValue } from "@faraday-academy/runtime/runtime";
import { useNode } from "@faraday-academy/runtime/world";
import { Button } from "@faraday-academy/runtime/ui/button";
import { TextbookView } from "../textbook-view";

// ── The true model — constant-acceleration kinematics (x0 = 0) ───────────────
const TRACK_M = 80; // metres of visible track
const TMAX = 10; // hard cap on run length (s)

const posAt = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
const velAt = (v0: number, a: number, t: number) => v0 + a * t;

/** When the run ends: the earliest of (reaches the 80 m mark), (a decelerating
 *  car comes to rest, v = 0), or the TMAX cap. Keeps the sim, the readouts and
 *  the graphs all describing the SAME stretch of motion. */
function endTime(v0: number, a: number): number {
  let tEnd = TMAX;
  if (Math.abs(a) < 1e-9) {
    if (v0 > 1e-9) tEnd = Math.min(tEnd, TRACK_M / v0);
  } else {
    const disc = v0 * v0 + 2 * a * TRACK_M;
    if (disc >= 0) {
      const roots = [(-v0 + Math.sqrt(disc)) / a, (-v0 - Math.sqrt(disc)) / a].filter((r) => r > 1e-6);
      if (roots.length) tEnd = Math.min(tEnd, Math.min(...roots));
    }
  }
  if (a < 0 && v0 > 0) tEnd = Math.min(tEnd, v0 / Math.abs(a)); // stops at rest
  if (a < 0 && v0 <= 0) return 0.001;
  return Math.max(0.001, tEnd);
}

// ── Interactive 1: the car on a track ────────────────────────────────────────
const W = 640;
const H = 200;
const PAD = 48;
const GROUND = 150;
const pxOf = (m: number) => PAD + (Math.min(Math.max(m, 0), TRACK_M) / TRACK_M) * (W - 2 * PAD);

function CarLab() {
  const [v0, setV0] = useState(8);
  const [a, setA] = useState(3);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [trail, setTrail] = useState<number[]>([]);
  const tRef = useRef(0);

  const tEnd = endTime(v0, a);
  const x = posAt(v0, a, Math.min(t, tEnd));
  const v = velAt(v0, a, Math.min(t, tEnd));
  const atEnd = t >= tEnd - 1e-3;

  // Render the car from an eased value so a reset (or a new launch setting)
  // glides the car home instead of teleporting it.
  const carPx = useAnimatedValue(pxOf(x), { stiffness: 120 });

  useRafLoop((dt) => {
    const nt = tRef.current + dt;
    if (nt >= tEnd) {
      tRef.current = tEnd;
      setT(tEnd);
      setPlaying(false);
      return;
    }
    tRef.current = nt;
    setT(nt);
    const here = posAt(v0, a, nt);
    setTrail((tr) => (tr.length && Math.abs(tr[tr.length - 1] - here) < 1.2 ? tr : [...tr, here].slice(-28)));
  }, playing);

  function resetRun() {
    tRef.current = 0;
    setT(0);
    setTrail([]);
    setPlaying(false);
  }
  function onV0(n: number) {
    setV0(n);
    resetRun();
  }
  function onA(n: number) {
    setA(n);
    resetRun();
  }
  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (atEnd) {
      tRef.current = 0;
      setT(0);
      setTrail([]);
    }
    setPlaying(true);
  }

  return (
    <Workbench
      title="Straight-line motion"
      panelTitle="Launch conditions"
      onReset={resetRun}
      hud={
        <>
          <Readout label="t" value={`${t.toFixed(1)} s`} />
          <Readout label="x" value={`${x.toFixed(1)} m`} tone="primary" />
          <Readout label="v" value={`${v.toFixed(1)} m/s`} />
          <Button size="sm" onClick={togglePlay}>
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </Button>
        </>
      }
      controls={
        <ControlGroup label="Set it up, then Play">
          <ParamSlider
            label="Initial velocity v₀"
            value={v0}
            min={0}
            max={20}
            step={0.5}
            onChange={onV0}
            format={(n) => `${n.toFixed(1)} m/s`}
          />
          <ParamSlider
            label="Acceleration a"
            value={a}
            min={-2}
            max={6}
            step={0.5}
            onChange={onA}
            format={(n) => `${n.toFixed(1)} m/s²`}
          />
        </ControlGroup>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A car moving along a straight track">
        {/* ground */}
        <line x1={PAD} y1={GROUND} x2={W - PAD} y2={GROUND} stroke="var(--border)" strokeWidth={2} />
        {/* distance ticks */}
        {[0, 20, 40, 60, 80].map((m) => (
          <g key={m}>
            <line x1={pxOf(m)} y1={GROUND} x2={pxOf(m)} y2={GROUND + 8} stroke="var(--border)" strokeWidth={1.5} />
            <text x={pxOf(m)} y={GROUND + 22} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>
              {m} m
            </text>
          </g>
        ))}
        {/* start + finish markers */}
        <line x1={pxOf(0)} y1={60} x2={pxOf(0)} y2={GROUND} stroke="var(--muted-foreground)" strokeWidth={1} strokeDasharray="3 5" />
        <line x1={pxOf(TRACK_M)} y1={60} x2={pxOf(TRACK_M)} y2={GROUND} stroke="var(--muted-foreground)" strokeWidth={1} strokeDasharray="3 5" />

        {/* fading trail of past positions */}
        {trail.map((m, i) => (
          <circle key={i} cx={pxOf(m)} cy={GROUND - 12} r={3} style={{ fill: "var(--primary)", opacity: ((i + 1) / trail.length) * 0.5 }} />
        ))}

        {/* the car */}
        <g transform={`translate(${carPx}, 0)`}>
          <circle cx={-13} cy={GROUND} r={9} style={{ fill: "var(--muted-foreground)" }} />
          <circle cx={13} cy={GROUND} r={9} style={{ fill: "var(--muted-foreground)" }} />
          <rect x={-24} y={GROUND - 24} width={48} height={18} rx={5} style={{ fill: "var(--primary)" }} />
          <rect x={-11} y={GROUND - 36} width={24} height={14} rx={4} style={{ fill: "var(--primary)", opacity: 0.82 }} />
          <circle cx={22} cy={GROUND - 15} r={3} style={{ fill: "var(--chart-4)" }} />
        </g>
      </svg>
    </Workbench>
  );
}

// ── Interactive 2: the graphs, sampled from the SAME model ───────────────────
type Row = { t: number; x: number; v: number };

function MotionGraphs() {
  const [v0, setV0] = useState(8);
  const [a, setA] = useState(3);
  const tEnd = endTime(v0, a);

  const data = useMemo<Row[]>(() => {
    const N = 40;
    return Array.from({ length: N + 1 }, (_, i) => {
      const tt = (tEnd * i) / N;
      return {
        t: Number(tt.toFixed(3)),
        x: Number(posAt(v0, a, tt).toFixed(2)),
        v: Number(velAt(v0, a, tt).toFixed(2)),
      };
    });
  }, [v0, a, tEnd]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <ParamSlider label="Initial velocity v₀" value={v0} min={0} max={20} step={0.5} onChange={setV0} format={(n) => `${n.toFixed(1)} m/s`} />
        <ParamSlider label="Acceleration a" value={a} min={-2} max={6} step={0.5} onChange={setA} format={(n) => `${n.toFixed(1)} m/s²`} />
      </div>
      <Chart
        type="line"
        data={data}
        x="t"
        xType="number"
        yAxis
        legend
        height={260}
        series={[
          { key: "x", label: "position x (m)", color: "var(--primary)" },
          { key: "v", label: "velocity v (m/s)", color: "var(--chart-2)" },
        ]}
      />
    </div>
  );
}

// ── Interactive 3: the derivation ────────────────────────────────────────────
const DERIV_STEPS: DerivationStep[] = [
  { tex: String.raw`v = v_0 + a\,t`, note: "constant a means velocity climbs linearly from v₀" },
  { tex: String.raw`\bar v = \tfrac12\,(v_0 + v)`, note: "a straight v–t line: the average is the midpoint" },
  { tex: String.raw`\Delta x = \bar v\,t`, note: "displacement = average velocity × time" },
  { tex: String.raw`\Delta x = \tfrac12\,\bigl(v_0 + (v_0 + a t)\bigr)\,t`, note: "substitute v = v₀ + a t" },
  { tex: String.raw`\Delta x = v_0 t + \tfrac12 a t^2`, note: "expand and collect terms" },
  { tex: String.raw`x = x_0 + v_0 t + \tfrac12 a t^2`, note: "add the starting position x₀" },
];

// ── Closing check: compute → NumericAnswer, wired to completion ───────────────
function KinematicsCheck() {
  const { complete } = useNode();
  return (
    <NumericAnswer
      question="A car starts from rest and accelerates at a constant 3.0 m/s². How far does it travel in the first 5.0 s?"
      answer={37.5}
      unit="m"
      hint="From rest v₀ = 0, so the last derivation line collapses to Δx = ½ a t². Put a = 3.0 and t = 5.0 into it — or set the car's v₀ to 0 and a to 3 and let it run."
      onCorrect={complete}
    />
  );
}

// ── Textbook view — the full chapter ─────────────────────────────────────────
function textbookPages() {
  return [
    {
      id: "motivation",
      title: "Motion in a straight line",
      content: (
        <Prose>
          <p>
            Describing how something moves comes down to three linked quantities. <strong>Position</strong>{" "}
            <TeX>{String.raw`x`}</TeX> says where the object is. <strong>Velocity</strong>{" "}
            <TeX>{String.raw`v`}</TeX> says how fast that position is changing — it is the slope of{" "}
            <TeX>{String.raw`x`}</TeX> against time. <strong>Acceleration</strong> <TeX>{String.raw`a`}</TeX> says how
            fast the velocity is changing — the slope of <TeX>{String.raw`v`}</TeX> against time.
          </p>
          <p>
            One case covers an enormous amount of everyday physics: motion where the acceleration is{" "}
            <em>constant</em>. A car pressing a steady pedal, a ball dropped near the ground, a train braking evenly —
            all obey the same small family of equations. In this lecture we build that motion, watch it, graph it, and
            then <em>derive</em> the equation that predicts position at any time.
          </p>
        </Prose>
      ),
    },
    {
      id: "model",
      title: "A car on a track",
      content: (
        <div className="flex flex-col gap-4">
          <Prose>
            <p>
              Below is a car on an 80-metre track. You choose its starting velocity <TeX>{String.raw`v_0`}</TeX> and its
              constant acceleration <TeX>{String.raw`a`}</TeX>, then press <strong>Play</strong>. The simulation advances
              real time and places the car at <TeX>{String.raw`x = v_0 t + \tfrac12 a t^2`}</TeX> every frame — this is
              not an animation loop faked to look right, it is the actual equation being evaluated. The chips read out
              the live time, position, and velocity; the faint dots are where the car has been.
            </p>
            <p>Try to predict before you release it: with more acceleration, does the gap between trail dots grow or stay even?</p>
          </Prose>

          <CarLab />

          <Prose>
            <p>
              Two things are worth noticing. First, when acceleration is zero the trail dots are evenly spaced — equal
              distance in equal time, which is exactly what constant velocity means. Turn acceleration up and the dots
              spread out: the car covers more ground in each successive second. Second, the velocity chip keeps rising
              even after you stop touching anything, because acceleration is a <em>rate of change of velocity</em>, not a
              speed you set once. If you dial in a negative <TeX>{String.raw`a`}</TeX>, the car decelerates and stops when
              its velocity reaches zero.
            </p>
          </Prose>
        </div>
      ),
    },
    {
      id: "graphs",
      title: "Reading the motion as graphs",
      content: (
        <div className="flex flex-col gap-4">
          <Prose>
            <p>
              The same motion tells a clearer story as two curves against time, sampled directly from the model you just
              drove. Watch their <em>shapes</em> as you change the sliders.
            </p>
          </Prose>

          <MotionGraphs />

          <Prose>
            <p>
              Velocity, <TeX>{String.raw`v = v_0 + a t`}</TeX>, plots as a straight line: its height starts at{" "}
              <TeX>{String.raw`v_0`}</TeX> and its slope is the acceleration <TeX>{String.raw`a`}</TeX>. Position is a{" "}
              <em>parabola</em> — it curves upward because the car keeps gaining speed, so each second adds more distance
              than the last. That curvature is the visual signature of acceleration. If you flatten <TeX>{String.raw`a`}</TeX>{" "}
              to zero, the velocity line goes horizontal and the position parabola straightens into a plain ramp.
            </p>
          </Prose>

          <Callout title="The one idea to keep">
            Position is the running total of velocity, and velocity is the running total of acceleration. Constant
            acceleration therefore forces velocity to be linear and position to be quadratic in time.
          </Callout>
        </div>
      ),
    },
    {
      id: "derivation",
      title: "Deriving the position equation",
      content: (
        <div className="flex flex-col gap-4">
          <Prose>
            <p>
              Where does the parabola come from? We can build it from the velocity line alone. Because <TeX>{String.raw`v`}</TeX>{" "}
              rises in a straight line, its <em>average</em> over the trip is simply the midpoint of its start and end
              values — and displacement is average velocity multiplied by time. Follow each step:
            </p>
          </Prose>

          <Derivation title="From v = v₀ + a t to the position law" steps={DERIV_STEPS} />

          <Reveal label="Bonus: eliminate time to get v² = v₀² + 2aΔx">
            <p className="mb-2">
              Sometimes you know the distance but not the elapsed time. Take <TeX>{String.raw`v = v_0 + a t`}</TeX>, solve
              for <TeX>{String.raw`t = (v - v_0)/a`}</TeX>, and substitute it into{" "}
              <TeX>{String.raw`\Delta x = \tfrac12 (v_0 + v)\,t`}</TeX>:
            </p>
            <TeX block>{String.raw`\Delta x = \tfrac12 (v_0 + v)\cdot\frac{v - v_0}{a} = \frac{v^2 - v_0^2}{2a}`}</TeX>
            <p className="mt-2">Rearranging gives the time-free companion equation:</p>
            <TeX block>{String.raw`v^2 = v_0^2 + 2a\,\Delta x`}</TeX>
          </Reveal>

          <Prose>
            <p>
              The last line, <TeX>{String.raw`x = x_0 + v_0 t + \tfrac12 a t^2`}</TeX>, is exactly the rule the car
              simulation obeys — no coincidence, since we hard-wired the model to it. Every term earns its place: the car
              starts at <TeX>{String.raw`x_0`}</TeX>, coasts <TeX>{String.raw`v_0 t`}</TeX> from its initial speed, and
              gains the extra <TeX>{String.raw`\tfrac12 a t^2`}</TeX> from steadily speeding up.
            </p>
          </Prose>
        </div>
      ),
    },
    {
      id: "check",
      title: "Your turn",
      content: (
        <div className="flex flex-col gap-4">
          <Prose>
            <p>
              Put the equation to work. Because the car starts from rest, the <TeX>{String.raw`v_0 t`}</TeX> term
              vanishes and you are left with <TeX>{String.raw`\Delta x = \tfrac12 a t^2`}</TeX>. Compute the answer — and
              if you like, verify it by setting the car's <TeX>{String.raw`v_0`}</TeX> to 0 and <TeX>{String.raw`a`}</TeX>{" "}
              to 3.0 and reading its position at 5 seconds.
            </p>
          </Prose>

          <KinematicsCheck />
        </div>
      ),
    },
  ];
}

// ── Slide view — one beat per screen ─────────────────────────────────────────
function slides() {
  return [
    {
      id: "title",
      content: (
        <div className="flex h-full flex-col justify-center gap-4 px-6 sm:px-12">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Motion</h1>
          <p className="max-w-[52ch] text-lg text-muted-foreground text-pretty sm:text-xl">
            Constant acceleration, one lecture — drive the model, read the graphs, then derive the position equation
            yourself.
          </p>
        </div>
      ),
    },
    {
      id: "intro",
      title: "Three linked quantities",
      content: (
        <div className="flex h-full flex-col justify-center gap-4">
          <Prose heading="What changes as you drive">
            <p>
              <strong>Position</strong> <TeX>{String.raw`x`}</TeX> — where you are. <strong>Velocity</strong>{" "}
              <TeX>{String.raw`v`}</TeX> — how fast <TeX>{String.raw`x`}</TeX> changes. <strong>Acceleration</strong>{" "}
              <TeX>{String.raw`a`}</TeX> — how fast <TeX>{String.raw`v`}</TeX> changes.
            </p>
            <p>
              Hold <TeX>{String.raw`a`}</TeX> constant and a beautiful pattern locks in: velocity rises in a straight
              line, position curves like a parabola. That is the whole lecture in one sentence.
            </p>
          </Prose>
        </div>
      ),
    },
    {
      id: "model",
      title: "The model",
      content: (
        <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="min-w-0">
            <CarLab />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Prose>
              <p>
                Set <TeX>{String.raw`v_0`}</TeX> and <TeX>{String.raw`a`}</TeX>, then <strong>Play</strong>. The car is
                placed at <TeX>{String.raw`x = v_0 t + \tfrac12 a t^2`}</TeX> every frame.
              </p>
              <p>Zero acceleration → evenly spaced trail. More acceleration → the dots spread out.</p>
            </Prose>
          </div>
        </div>
      ),
    },
    {
      id: "graphs",
      title: "Two graphs",
      content: (
        <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="min-w-0">
            <MotionGraphs />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Prose>
              <p>
                <strong>Velocity</strong> is a straight line — height <TeX>{String.raw`v_0`}</TeX>, slope{" "}
                <TeX>{String.raw`a`}</TeX>.
              </p>
              <p>
                <strong>Position</strong> is a parabola: it curves because the car keeps gaining speed. Flatten{" "}
                <TeX>{String.raw`a`}</TeX> and both straighten out.
              </p>
            </Prose>
          </div>
        </div>
      ),
    },
    {
      id: "derivation",
      title: "Where the formula comes from",
      content: (
        <div className="flex h-full flex-col justify-center gap-4">
          <Prose>
            <p>
              Average velocity is the midpoint of a straight <TeX>{String.raw`v`}</TeX>–<TeX>{String.raw`t`}</TeX> line,
              and displacement is average velocity times time. Step it out:
            </p>
          </Prose>
          <Derivation title="To x = x₀ + v₀t + ½at²" steps={DERIV_STEPS} />
          <Reveal label="Time-free companion: v² = v₀² + 2aΔx">
            <p className="mb-2">
              Solve <TeX>{String.raw`v = v_0 + a t`}</TeX> for <TeX>{String.raw`t`}</TeX> and substitute into{" "}
              <TeX>{String.raw`\Delta x = \tfrac12(v_0 + v)t`}</TeX>:
            </p>
            <TeX block>{String.raw`v^2 = v_0^2 + 2a\,\Delta x`}</TeX>
          </Reveal>
        </div>
      ),
    },
    {
      id: "check",
      title: "Check",
      content: (
        <div className="flex h-full flex-col justify-center gap-4">
          <Prose>
            <p>
              From rest the equation collapses to <TeX>{String.raw`\Delta x = \tfrac12 a t^2`}</TeX>. Your turn:
            </p>
          </Prose>
          <KinematicsCheck />
        </div>
      ),
    },
  ];
}

// ── The lecture shell ────────────────────────────────────────────────────────
export default function KinematicsLecture() {
  return (
    <Lecture
      title="Motion"
      lead="Constant acceleration, one lecture — drive the model, read the graphs, then derive the position equation yourself."
      defaultView="textbook"
      views={[
        { id: "slide", label: "Slides", content: <SlideDeck slides={slides()} /> },
        { id: "textbook", label: "Textbook", content: <TextbookView notesKey="kinematics" pages={textbookPages()} /> },
      ]}
    />
  );
}
