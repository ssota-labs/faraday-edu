// The Incline — capstone (join) lecture. Joins Newton's third law (the normal
// force is the ramp pushing back) with friction (the static-friction limit) to
// find the critical slip angle theta_c = arctan(mu_s), and to *do* it: tilt the
// ramp until the block just begins to slide.
//
// One model, composed into both the slide deck and the textbook chapter.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Lecture,
  SlideDeck,
  Prose,
  Quiz,
  Challenge,
  Chart,
  Derivation,
  Callout,
  Reveal,
  Readout,
  ParamSlider,
  Workbench,
  ControlGroup,
  TeX,
} from "@faraday-academy/runtime/blocks";
import { useRafLoop, useSvgDrag } from "@faraday-academy/runtime/runtime";
import { useNode } from "@faraday-academy/runtime/world";
import { Button } from "@faraday-academy/runtime/ui/button";
import { TextbookView } from "../textbook-view";

// ── real-world constants (the model is TRUE, not decorative) ────────────────
const M = 2; // block mass (kg) — cancels out of theta_c, which is the whole point
const G = 9.8; // gravity (m/s^2)
const MG = M * G; // weight (N) = 19.6

// ── scene geometry (viewBox units) ──────────────────────────────────────────
const VIEW_W = 440;
const VIEW_H = 300;
const PIVOT = { x: 52, y: 250 }; // ramp hinges here (bottom-left)
const L = 250; // ramp length (px)
const BLOCK = 30; // block edge (px)
const FS = 2.4; // force scale: px per newton (weight ≈ 47px)
const PX_PER_M = 32; // maps sliding acceleration (m/s^2) to px/s^2
const MAX_POS = L - 46; // block stops before reaching the hinge

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const DEG = 180 / Math.PI;

// A point on a ray from the pivot at `deg` above horizontal, radius `r`.
function pivotPoint(deg: number, r: number): string {
  const a = deg / DEG;
  return `${PIVOT.x + r * Math.cos(a)},${PIVOT.y - r * Math.sin(a)}`;
}

// ── a labelled force vector drawn on the SVG canvas ─────────────────────────
function Arrow(props: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  label?: string;
  dashed?: boolean;
}) {
  const len = Math.hypot(props.dx, props.dy);
  if (len < 1.5) return null;
  const ux = props.dx / len;
  const uy = props.dy / len;
  const ex = props.x + props.dx;
  const ey = props.y + props.dy;
  const head = 8;
  const bx = ex - ux * head;
  const by = ey - uy * head;
  const px = -uy;
  const py = ux;
  const wing = 4.5;
  return (
    <g pointerEvents="none">
      <line
        x1={props.x}
        y1={props.y}
        x2={bx}
        y2={by}
        stroke={props.color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeDasharray={props.dashed ? "5 4" : undefined}
      />
      <polygon
        points={`${ex},${ey} ${bx + px * wing},${by + py * wing} ${bx - px * wing},${by - py * wing}`}
        fill={props.color}
      />
      {props.label ? (
        <text
          x={ex + ux * 10}
          y={ey + uy * 10}
          fill={props.color}
          fontSize={12}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {props.label}
        </text>
      ) : null}
    </g>
  );
}

interface LabState {
  theta: number;
  thetaC: number;
  sliding: boolean;
}

// ── the direct-manipulation model (drag the ramp; live FBD; block releases) ──
function InclineLab(props: { showTarget?: boolean; onState?: (s: LabState) => void }) {
  const { showTarget = false, onState } = props;
  const [thetaDeg, setThetaDeg] = useState(18);
  const [mu, setMu] = useState(0.5);
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0); // block travel from top of ramp (px)

  const posRef = useRef(0);
  const velRef = useRef(0);
  const draggingRef = useRef(false);

  const thetaC = Math.atan(mu) * DEG;
  const sliding = thetaDeg > thetaC + 1e-6;

  const tr = thetaDeg / DEG;
  const cos = Math.cos(tr);
  const sin = Math.sin(tr);
  const driving = MG * sin; // mg sinθ, down the slope
  const normal = MG * cos; // N = mg cosθ
  const maxStatic = mu * normal; // μ_s mg cosθ
  const friction = sliding ? maxStatic : Math.min(driving, maxStatic);

  // Drive the block: while stuck it eases home; once θ>θ_c it accelerates from
  // rest (a legible release — velocity builds from zero, nothing teleports).
  useRafLoop((dt) => {
    if (draggingRef.current) return; // pause motion while grabbing the ramp
    if (sliding) {
      const aPx = G * (sin - mu * cos) * PX_PER_M;
      velRef.current += aPx * dt;
      const next = Math.min(MAX_POS, posRef.current + velRef.current * dt);
      if (next >= MAX_POS) velRef.current = 0;
      if (next !== posRef.current) {
        posRef.current = next;
        setPos(next);
      }
    } else if (posRef.current > 0.3) {
      velRef.current = 0;
      const next = posRef.current + (0 - posRef.current) * Math.min(1, 7 * dt);
      posRef.current = next;
      setPos(next);
    } else if (posRef.current !== 0) {
      posRef.current = 0;
      setPos(0);
    }
  }, playing);

  useEffect(() => {
    onState?.({ theta: thetaDeg, thetaC, sliding });
  }, [thetaDeg, thetaC, sliding, onState]);

  // Drag the ramp itself — the angle lives on the object.
  const drag = useSvgDrag((x, y, phase) => {
    draggingRef.current = phase !== "end";
    const a = Math.atan2(PIVOT.y - y, x - PIVOT.x) * DEG;
    setThetaDeg(clamp(a, 5, 60));
  });

  // ── derived geometry ──
  const top = { x: PIVOT.x + L * cos, y: PIVOT.y - L * sin }; // top of the ramp
  const foot = { x: PIVOT.x + L * cos, y: PIVOT.y }; // right-angle corner
  const dnx = -cos; // down-slope unit
  const dny = sin;
  const nx = -sin; // outward normal unit
  const ny = -cos;
  const bx = top.x + dnx * pos + nx * (BLOCK / 2 + 3);
  const by = top.y + dny * pos + ny * (BLOCK / 2 + 3);

  const reset = () => {
    setThetaDeg(18);
    posRef.current = 0;
    velRef.current = 0;
    setPos(0);
  };

  const targetBand = showTarget
    ? `${PIVOT.x},${PIVOT.y} ${pivotPoint(thetaC, L)} ${pivotPoint(thetaC + 1, L)} ${pivotPoint(
        thetaC + 2,
        L,
      )} ${pivotPoint(thetaC + 3, L)}`
    : "";

  const fmt1 = (n: number) => n.toFixed(1);

  return (
    <Workbench
      title="Ramp — drag to tilt"
      panelTitle="Surface"
      onReset={reset}
      hud={
        <>
          <Readout label="θ" value={`${thetaDeg.toFixed(1)}°`} tone="primary" />
          <Readout label="mg sinθ" value={`${fmt1(driving)} N`} />
          <Readout label="μₛmg cosθ" value={`${fmt1(maxStatic)} N`} />
          <Readout
            label="state"
            value={sliding ? "sliding" : "stuck"}
            tone={sliding ? "destructive" : "primary"}
          />
          <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </Button>
        </>
      }
      controls={
        <ControlGroup label="Friction" defaultOpen>
          <ParamSlider
            label="μₛ (static coefficient)"
            value={mu}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={setMu}
            format={(v) => v.toFixed(2)}
          />
          <p className="text-xs text-muted-foreground">
            Critical angle θ_c = arctan(μₛ) = {thetaC.toFixed(1)}°. Rougher surface → steeper θ_c.
          </p>
        </ControlGroup>
      }
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label="Free-body diagram on an incline">
        {/* ground */}
        <line
          x1={0}
          y1={PIVOT.y}
          x2={VIEW_W}
          y2={PIVOT.y}
          stroke="var(--border)"
          strokeWidth={2}
        />
        {/* target band around the critical angle (mission only) */}
        {showTarget ? (
          <>
            <polygon points={targetBand} fill="var(--chart-3)" fillOpacity={0.16} />
            <line
              x1={PIVOT.x}
              y1={PIVOT.y}
              x2={PIVOT.x + L * Math.cos(thetaC / DEG)}
              y2={PIVOT.y - L * Math.sin(thetaC / DEG)}
              stroke="var(--chart-3)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={PIVOT.x + (L - 30) * Math.cos((thetaC + 1.5) / DEG)}
              y={PIVOT.y - (L - 30) * Math.sin((thetaC + 1.5) / DEG) - 8}
              fill="var(--chart-3)"
              fontSize={11}
              fontWeight={600}
              textAnchor="middle"
            >
              θ_c
            </text>
          </>
        ) : null}

        {/* the ramp wedge — grab anywhere on it to tilt */}
        <polygon
          {...drag}
          points={`${PIVOT.x},${PIVOT.y} ${top.x},${top.y} ${foot.x},${foot.y}`}
          fill="var(--muted)"
          stroke="var(--border)"
          strokeWidth={2}
          style={{ cursor: "grab" }}
        />
        {/* the incline surface, emphasised as the grabbable edge */}
        <line
          {...drag}
          x1={PIVOT.x}
          y1={PIVOT.y}
          x2={top.x}
          y2={top.y}
          stroke="var(--primary)"
          strokeWidth={4}
          strokeLinecap="round"
          style={{ cursor: "grab" }}
        />
        {/* grab handle at the ramp's top */}
        <circle
          {...drag}
          cx={top.x}
          cy={top.y}
          r={8}
          fill="var(--primary)"
          stroke="var(--background)"
          strokeWidth={2}
          style={{ cursor: "grab" }}
        />

        {/* the block */}
        <rect
          x={bx - BLOCK / 2}
          y={by - BLOCK / 2}
          width={BLOCK}
          height={BLOCK}
          rx={4}
          transform={`rotate(${-thetaDeg} ${bx} ${by})`}
          fill={sliding ? "var(--chart-4)" : "var(--primary)"}
          stroke="var(--background)"
          strokeWidth={1.5}
        />

        {/* free-body diagram, scaled to real magnitudes and rotated with θ */}
        <Arrow x={bx} y={by} dx={0} dy={MG * FS} color="var(--muted-foreground)" label="W" />
        <Arrow x={bx} y={by} dx={nx * normal * FS} dy={ny * normal * FS} color="var(--chart-2)" label="N" />
        <Arrow
          x={bx}
          y={by}
          dx={-dnx * friction * FS}
          dy={-dny * friction * FS}
          color="var(--chart-4)"
          label="f"
        />
        {/* driving component mg sinθ, down-slope (dashed partner of friction) */}
        <Arrow x={bx} y={by} dx={dnx * driving * FS} dy={dny * driving * FS} color="var(--chart-1)" dashed />

        {/* angle arc */}
        <path
          d={`M ${PIVOT.x + 44} ${PIVOT.y} A 44 44 0 0 0 ${pivotPoint(thetaDeg, 44)}`}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
        />
        <text x={PIVOT.x + 54} y={PIVOT.y - 10} fill="var(--muted-foreground)" fontSize={11}>
          θ
        </text>

        <text x={12} y={20} fill="var(--muted-foreground)" fontSize={11}>
          Drag the ramp to tilt it
        </text>
      </svg>
    </Workbench>
  );
}

// ── quantitative view: the two force curves crossing at θ_c ─────────────────
function ForceCrossingChart() {
  const [mu, setMu] = useState(0.5);
  const thetaC = Math.atan(mu) * DEG;
  const data = useMemo(() => {
    const rows: Record<string, number>[] = [];
    for (let d = 0; d <= 60; d += 2) {
      const r = d / DEG;
      rows.push({
        theta: d,
        driving: +(MG * Math.sin(r)).toFixed(3),
        maxStatic: +(mu * MG * Math.cos(r)).toFixed(3),
      });
    }
    return rows;
  }, [mu]);

  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-md">
        <ParamSlider
          label="μₛ (static coefficient)"
          value={mu}
          min={0.1}
          max={0.9}
          step={0.05}
          onChange={setMu}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <Chart
        type="line"
        data={data}
        x="theta"
        xType="number"
        yAxis
        legend
        height={260}
        series={[
          { key: "driving", label: "mg sinθ (driving)", color: "var(--chart-1)" },
          { key: "maxStatic", label: "μₛ mg cosθ (max friction)", color: "var(--chart-4)" },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        The curves cross where the block breaks free:{" "}
        <TeX>{String.raw`\theta_c = \arctan\mu_s = ${thetaC.toFixed(1)}^\circ`}</TeX>. Left of the
        crossing friction wins (stuck); right of it gravity wins (sliding).
      </p>
    </div>
  );
}

// ── the derivation whose last line is θ_c = arctan(μ_s) ─────────────────────
function CriticalAngleDerivation() {
  return (
    <Derivation
      title="Where the critical angle comes from"
      steps={[
        {
          tex: String.raw`F_\parallel = mg\sin\theta`,
          note: "gravity's pull down the slope",
        },
        {
          tex: String.raw`N = mg\cos\theta`,
          note: "the ramp pushes back perpendicular to its surface",
        },
        {
          tex: String.raw`f_{s,\max} = \mu_s N = \mu_s\, mg\cos\theta`,
          note: "static friction can grow only up to this limit",
        },
        {
          tex: String.raw`mg\sin\theta_c = \mu_s\, mg\cos\theta_c`,
          note: "it just slips when driving force = max friction",
        },
        {
          tex: String.raw`\tan\theta_c = \mu_s`,
          note: "divide both sides by mg cosθ — m and g cancel",
        },
        {
          tex: String.raw`\theta_c = \arctan(\mu_s)`,
          note: "the slip angle depends only on μ_s — not on mass",
        },
      ]}
    />
  );
}

// ── the pretest ConcepTest (mass independence) ──────────────────────────────
function Pretest() {
  return (
    <Quiz
      question="Two blocks sit on identical ramps; one is twice as heavy. You slowly tilt both. Which slips first?"
      options={[
        {
          label: "The heavier block — more weight drags it down sooner.",
          hint: "Weight drives the block (mg sinθ) but also presses it down, raising the friction limit (μₛ mg cosθ). Both scale with m.",
        },
        {
          label: "They slip at the very same angle.",
          correct: true,
          hint: "Right. Mass multiplies BOTH the driving force and the friction limit equally, so it cancels: θ_c = arctan(μₛ).",
        },
        {
          label: "The lighter block — it has less friction holding it.",
          hint: "Its friction limit is smaller, but so is its driving force. The ratio that matters (tanθ vs μₛ) is identical.",
        },
      ]}
    />
  );
}

// ── the closing MISSION — tilt to the critical angle (do/achieve) ───────────
function Mission() {
  const { complete } = useNode();
  const [st, setSt] = useState<LabState>({ theta: 18, thetaC: 26.57, sliding: false });
  const TOL = 3; // "just begins to slide" — within 3° above θ_c
  const done = st.sliding && st.theta - st.thetaC <= TOL;

  return (
    <Challenge
      goal={
        <>
          Tilt the ramp until the block <em>just</em> begins to slide — land in the target band at
          the critical angle <TeX>{String.raw`\theta_c = \arctan\mu_s`}</TeX>.
        </>
      }
      done={done}
      hint="Ease the ramp up degree by degree. The instant the block releases, stop — overshoot far past the shaded band and you've gone too steep."
      onDone={complete}
    >
      <InclineLab showTarget onState={setSt} />
    </Challenge>
  );
}

// ── a spaced re-check on friction (textbook only) ───────────────────────────
function SpacedFrictionQuiz() {
  return (
    <Quiz
      question="You roughen the ramp, raising μₛ from 0.3 to 0.6. What happens to the critical slip angle θ_c?"
      options={[
        {
          label: "It rises — from about 16.7° to about 31°.",
          correct: true,
          hint: "Yes. θ_c = arctan(μₛ): arctan(0.3) ≈ 16.7°, arctan(0.6) ≈ 31°. Rougher surface tolerates a steeper ramp.",
        },
        {
          label: "It stays the same — μₛ doesn't affect the slip angle.",
          hint: "μₛ is exactly what sets it: θ_c = arctan(μₛ). Double μₛ and the block holds on a steeper ramp.",
        },
        {
          label: "It exactly doubles, since μₛ doubled.",
          hint: "arctan is nonlinear, so θ_c doesn't scale with μₛ: it goes 16.7° → 31°, not 16.7° → 33.4°.",
        },
      ]}
    />
  );
}

const LEAD =
  "The capstone: gravity, the normal force from Newton's third law, and friction all meet on a ramp. Find — and hit — the angle where the block breaks free.";

export default function InclineLecture() {
  return (
    <Lecture
      title="The Incline"
      lead={LEAD}
      defaultView="textbook"
      views={[
        {
          id: "slide",
          label: "Slides",
          content: (
            <SlideDeck
              slides={[
                {
                  id: "pretest",
                  title: "Predict first",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose heading="Does weight decide when it slips?">
                        <p>
                          A block rests on a ramp. Tilt the ramp far enough and it slides. Before we
                          model it — does a heavier block let go at a <em>smaller</em> angle?
                        </p>
                      </Prose>
                      <Pretest />
                    </div>
                  ),
                },
                {
                  id: "model",
                  title: "Tilt the ramp",
                  content: (
                    <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
                      <InclineLab />
                      <div className="flex flex-col justify-center">
                        <Prose heading="Two forces along the slope">
                          <p>
                            Grab the ramp and tilt it. Watch the free-body diagram: gravity splits
                            into <TeX>{String.raw`mg\sin\theta`}</TeX> down the slope and{" "}
                            <TeX>{String.raw`mg\cos\theta`}</TeX> into the surface. Friction (up the
                            slope) holds only until <TeX>{String.raw`mg\sin\theta`}</TeX> beats{" "}
                            <TeX>{String.raw`\mu_s mg\cos\theta`}</TeX> — then the block releases.
                          </p>
                        </Prose>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "chart",
                  title: "The crossing",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose heading="Driving force vs. friction limit">
                        <p>
                          Plot both across <TeX>{String.raw`\theta`}</TeX>. They cross exactly at the
                          critical angle — slide μₛ and watch the crossing move.
                        </p>
                      </Prose>
                      <ForceCrossingChart />
                    </div>
                  ),
                },
                {
                  id: "derive",
                  title: "Why arctan",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose heading="Mass cancels">
                        <p>
                          Set driving force equal to the friction limit at the tipping point. Every{" "}
                          <TeX>{String.raw`m`}</TeX> and <TeX>{String.raw`g`}</TeX> divides away.
                        </p>
                      </Prose>
                      <CriticalAngleDerivation />
                    </div>
                  ),
                },
                {
                  id: "mission",
                  title: "Mission",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose>
                        <p>
                          Now <strong>do</strong> it: tilt the ramp so the block <em>just</em> lets
                          go, landing in the target band at <TeX>{String.raw`\theta_c`}</TeX>.
                        </p>
                      </Prose>
                      <Mission />
                    </div>
                  ),
                },
              ]}
            />
          ),
        },
        {
          id: "textbook",
          label: "Textbook",
          content: (
            <TextbookView
              notesKey="incline"
              pages={[
                {
                  id: "join",
                  title: "Two ideas meet on a ramp",
                  content: (
                    <Prose>
                      <p>
                        This chapter is a join. Two threads we built separately come together here.
                        From <strong>Newton's third law</strong>: when the block presses on the ramp,
                        the ramp presses back with the normal force{" "}
                        <TeX>{String.raw`N`}</TeX>, always perpendicular to the surface. From{" "}
                        <strong>friction</strong>: the contact can resist sliding, but only up to a
                        ceiling set by the static coefficient,{" "}
                        <TeX>{String.raw`f_{s,\max} = \mu_s N`}</TeX>.
                      </p>
                      <p>
                        Put a block on a ramp and slowly steepen it. At shallow angles nothing moves.
                        Somewhere past a particular tilt the block breaks free and slides. That tilt
                        — the <em>critical slip angle</em> <TeX>{String.raw`\theta_c`}</TeX> — is what
                        this chapter is about, and by the end you'll not only derive it but tilt a
                        ramp to hit it on purpose.
                      </p>
                    </Prose>
                  ),
                },
                {
                  id: "pretest",
                  title: "Predict before you model",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          Here is the question almost everyone gets wrong the first time. Two blocks
                          sit on identical ramps — same material, same roughness — but one weighs
                          twice as much. You tilt both slowly. Does the heavy one let go first,
                          because there's more weight dragging it down the slope? Commit to an answer
                          before reading on.
                        </p>
                      </Prose>
                      <Pretest />
                      <Prose>
                        <p>
                          Hold that thought. The interactive below shows exactly which forces are in
                          play, and the derivation will settle the argument for good.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "model",
                  title: "Resolve gravity on the slope",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          The trick with any ramp problem is to resolve gravity into components{" "}
                          <em>aligned with the slope</em>, not with the ground. Weight{" "}
                          <TeX>{String.raw`mg`}</TeX> points straight down; split it into a piece{" "}
                          <TeX>{String.raw`mg\sin\theta`}</TeX> pointing <em>down the slope</em> (the
                          part that tries to make the block slide) and a piece{" "}
                          <TeX>{String.raw`mg\cos\theta`}</TeX> pressing <em>into</em> the surface
                          (the part the normal force answers).
                        </p>
                        <p>
                          Drag the ramp below to change <TeX>{String.raw`\theta`}</TeX>. Watch the
                          free-body diagram redraw: the dashed arrow is the driving force{" "}
                          <TeX>{String.raw`mg\sin\theta`}</TeX>, the solid up-slope arrow is
                          friction. While friction can match the driving force the block is{" "}
                          <em>stuck</em>; the moment <TeX>{String.raw`mg\sin\theta`}</TeX> exceeds the
                          friction ceiling <TeX>{String.raw`\mu_s mg\cos\theta`}</TeX>, the block
                          turns orange and slides. Use the μₛ slider to change how grippy the surface
                          is.
                        </p>
                      </Prose>
                      <InclineLab />
                      <Prose>
                        <p>
                          Notice what raising <TeX>{String.raw`\theta`}</TeX> does: the driving force{" "}
                          <TeX>{String.raw`mg\sin\theta`}</TeX> grows while the friction ceiling{" "}
                          <TeX>{String.raw`\mu_s mg\cos\theta`}</TeX> shrinks (its{" "}
                          <TeX>{String.raw`\cos\theta`}</TeX> is falling). One rising, one falling —
                          they are guaranteed to cross. That crossing is the release point.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "chart",
                  title: "The crossing point",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          Let's see the two quantities as curves rather than arrows. The chart plots
                          the driving force <TeX>{String.raw`mg\sin\theta`}</TeX> and the friction
                          limit <TeX>{String.raw`\mu_s mg\cos\theta`}</TeX> against the tilt{" "}
                          <TeX>{String.raw`\theta`}</TeX> from flat to steep. Below the crossing,
                          friction sits above driving — the block holds. Above it, driving wins and
                          the block accelerates. Move the μₛ slider and the crossing slides with it.
                        </p>
                      </Prose>
                      <ForceCrossingChart />
                      <Prose>
                        <p>
                          With <TeX>{String.raw`\mu_s = 0.5`}</TeX> the curves meet near{" "}
                          <TeX>{String.raw`26.6^\circ`}</TeX>. Rougher surfaces push the crossing
                          right (you can tilt further before it goes); slicker surfaces pull it left.
                          The next step pins down that crossing angle exactly.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "derive",
                  title: "Deriving θ_c = arctan(μₛ)",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          At the crossing the block is on the verge of sliding: static friction is
                          maxed out and exactly equals the driving force. Set them equal and simplify
                          one line at a time.
                        </p>
                      </Prose>
                      <CriticalAngleDerivation />
                      <Callout title="The result — and the pretest answer">
                        <TeX>{String.raw`\theta_c = \arctan(\mu_s)`}</TeX>. The mass{" "}
                        <TeX>{String.raw`m`}</TeX> and gravity <TeX>{String.raw`g`}</TeX> divided
                        clean away, so the slip angle depends on the surfaces alone. The heavy block
                        and the light block let go at <em>the same angle</em> — the pretest's second
                        option. With <TeX>{String.raw`\mu_s = 0.5`}</TeX>,{" "}
                        <TeX>{String.raw`\theta_c = \arctan(0.5) \approx 26.6^\circ`}</TeX>.
                      </Callout>
                      <Reveal label="Why does mass cancel, intuitively?">
                        <p>
                          A heavier block is dragged down harder (<TeX>{String.raw`mg\sin\theta`}</TeX>{" "}
                          is bigger) but it also presses into the ramp harder, so friction has more
                          to work with (<TeX>{String.raw`\mu_s mg\cos\theta`}</TeX> is bigger by the
                          same factor). Doubling <TeX>{String.raw`m`}</TeX> scales both sides
                          equally; the balance point doesn't move. Once sliding, the model uses{" "}
                          <TeX>{String.raw`a = g(\sin\theta - \mu\cos\theta)`}</TeX> — again
                          mass-free.
                        </p>
                      </Reveal>
                    </div>
                  ),
                },
                {
                  id: "mission",
                  title: "Mission — hit the critical angle",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          Knowing <TeX>{String.raw`\theta_c`}</TeX> is one thing; landing on it is
                          another. Your mission: tilt the ramp so the block <em>just</em> begins to
                          slide — no more, no less. The shaded band marks the target window at{" "}
                          <TeX>{String.raw`\theta_c`}</TeX>. Ease the ramp up until the instant the
                          block releases, then stop. Set μₛ first if you like — the target moves with
                          it, exactly as <TeX>{String.raw`\arctan(\mu_s)`}</TeX> predicts.
                        </p>
                      </Prose>
                      <Mission />
                      <Prose>
                        <p>
                          One last check to keep friction fresh in mind before you move on.
                        </p>
                      </Prose>
                      <SpacedFrictionQuiz />
                    </div>
                  ),
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
