// Newton's 1st law — inertia & equilibrium. One lecture, two presentation views
// (SlideDeck for class, TextbookView for self-study) built from ONE set of shared
// interactive components: a ConcepTest pretest, a live coasting-puck model, a
// velocity comparison chart, an equilibrium free-body diagram, and closing checks.
import { useRef, useState } from "react";
import {
  Lecture,
  SlideDeck,
  TeX,
  Prose,
  Workbench,
  Chart,
  ParamSwitch,
  Quiz,
  Compare,
  Callout,
  Reveal,
  Readout,
  Derivation,
} from "@faraday-academy/runtime/blocks";
import { useSimLoop } from "../sim2d";
import { useNode } from "@faraday-academy/runtime/world";
import { Button } from "@faraday-academy/runtime/ui/button";
import { TextbookView } from "../textbook-view";

// ─────────────────────────────────────────────────────────────────────────────
// The physical model (used by both the live sim and the comparison chart, so the
// two can never disagree). A puck on a surface, pushed once:
//   • friction OFF → ΣF = 0 ⇒ a = 0 ⇒ velocity is constant (coasts forever).
//   • friction ON  → a constant deceleration DECEL opposes motion until v = 0.
const DECEL = 3.0; // kinetic-friction deceleration magnitude, m/s²
const KICK_DV = 4.0; // speed added by one kick, m/s
const KICK_TIME = 0.22; // seconds the kick force acts (a brief push, not a teleport)
const KICK_ACCEL = KICK_DV / KICK_TIME; // ≈ 18.2 m/s² while the push lasts
const PX_PER_M = 24; // canvas scale
const STRIPE = 64; // ground-stripe spacing, px

// Analytic velocity vs. time from the SAME relationship the live loop integrates.
function sampleVelocity(friction: boolean): { t: number; v: number }[] {
  const v0 = 6; // speed just after a kick
  const rows: { t: number; v: number }[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i * 0.1;
    const v = friction ? Math.max(0, v0 - DECEL * t) : v0;
    rows.push({ t: Number(t.toFixed(2)), v: Number(v.toFixed(2)) });
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Live coasting-puck model. The puck stays centred while the GROUND scrolls (a
// treadmill), so constant velocity reads as endless coasting with no teleporting.
// On-canvas controls: a Kick button (brief force), Play/Pause, and a friction
// toggle. Live velocity + friction state live in the Workbench hud.
function PuckModel() {
  const v = useRef(0); // current speed, m/s
  const dist = useRef(0); // total distance travelled, px (drives ground scroll)
  const kick = useRef(0); // remaining kick-force time, s
  const [friction, setFriction] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState({ v: 0, off: 0 });

  useSimLoop((dt) => {
    let a = 0;
    if (kick.current > 0) {
      a += KICK_ACCEL; // the brief push
      kick.current = Math.max(0, kick.current - dt);
    }
    if (friction && v.current > 0) a -= DECEL; // friction opposes motion
    let nv = v.current + a * dt;
    if (nv < 0) nv = 0; // friction brings it to rest, never reverses it
    v.current = nv;
    dist.current += nv * dt * PX_PER_M;
    setFrame({ v: nv, off: ((dist.current % STRIPE) + STRIPE) % STRIPE });
  }, playing);

  const reset = () => {
    v.current = 0;
    dist.current = 0;
    kick.current = 0;
    setFrame({ v: 0, off: 0 });
  };

  const moving = frame.v > 0.01;
  const kicking = kick.current > 0;
  // speed lines behind the puck — length & opacity grow with speed (emphasis)
  const trail = Math.min(56, frame.v * 8);
  const cx = 260;
  const groundY = 188;
  const puckY = 158;

  return (
    <Workbench
      title="Puck on a surface — kick it, then watch"
      onReset={reset}
      hud={
        <>
          <Readout label="v" value={`${frame.v.toFixed(1)} m/s`} tone={moving ? "primary" : "default"} />
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/75 px-2.5 py-1.5 backdrop-blur-sm">
            <Button size="sm" onClick={() => (kick.current = KICK_TIME)}>
              Kick →
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </Button>
          </div>
          <div className="rounded-md border border-border/60 bg-background/75 px-2.5 py-1.5 backdrop-blur-sm">
            <ParamSwitch label="Friction" checked={friction} onChange={setFriction} />
          </div>
        </>
      }
    >
      <svg viewBox="0 0 520 260" role="img" aria-label="A puck coasting on a scrolling surface">
        {/* sky / table backdrop */}
        <rect x={0} y={0} width={520} height={260} fill="var(--muted)" opacity={0.25} />

        {/* scrolling ground stripes — motion you can see even though the puck is centred */}
        <line x1={0} y1={groundY} x2={520} y2={groundY} stroke="var(--border)" strokeWidth={2} />
        {Array.from({ length: 11 }).map((_, i) => {
          const x = i * STRIPE - frame.off;
          return (
            <line
              key={i}
              x1={x}
              y1={groundY}
              x2={x - 14}
              y2={groundY + 14}
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              opacity={0.5}
            />
          );
        })}

        {/* speed lines trailing the puck */}
        {moving
          ? [0, 1, 2].map((k) => (
              <line
                key={k}
                x1={cx - 30 - trail}
                y1={puckY - 12 + k * 12}
                x2={cx - 30}
                y2={puckY - 12 + k * 12}
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={Math.min(0.55, frame.v / 12)}
              />
            ))
          : null}

        {/* friction force arrow (opposes motion) */}
        {friction && moving ? (
          <g stroke="var(--destructive)" strokeWidth={3} fill="var(--destructive)">
            <line x1={cx - 4} y1={groundY - 6} x2={cx - 44} y2={groundY - 6} />
            <path d="M 0 0 L 8 -4 L 8 4 Z" transform={`translate(${cx - 44} ${groundY - 6}) rotate(180)`} />
          </g>
        ) : null}

        {/* kick / push force arrow — flashes during the brief push */}
        {kicking ? (
          <g stroke="var(--primary)" strokeWidth={4} fill="var(--primary)">
            <line x1={cx - 60} y1={puckY} x2={cx - 26} y2={puckY} />
            <path d="M 0 0 L 10 -5 L 10 5 Z" transform={`translate(${cx - 26} ${puckY})`} />
          </g>
        ) : null}

        {/* the puck (fixed at centre; the world moves past it) */}
        <circle cx={cx} cy={puckY} r={22} fill="var(--primary)" opacity={0.9} />
        <circle cx={cx} cy={puckY} r={22} fill="none" stroke="var(--border)" strokeWidth={2} />
        <ellipse cx={cx} cy={groundY + 4} rx={22} ry={5} fill="var(--foreground)" opacity={0.14} />

        {/* idle affordance */}
        {!moving && !kicking ? (
          <text x={cx} y={puckY - 40} textAnchor="middle" fontSize={13} fill="var(--muted-foreground)">
            Press “Kick →” to give it one push
          </text>
        ) : null}
      </svg>
    </Workbench>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Equilibrium free-body diagram: a sign hanging from a single rope. Tension up,
// weight down, equal in length → ΣF = 0. Static on purpose (nothing accelerates).
function EquilibriumFBD() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <svg viewBox="0 0 300 210" role="img" aria-label="A hanging sign in equilibrium: tension up equals weight down">
        {/* ceiling with hatching */}
        <line x1={40} y1={22} x2={260} y2={22} stroke="var(--border)" strokeWidth={3} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1={44 + i * 18}
            y1={22}
            x2={36 + i * 18}
            y2={12}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            opacity={0.6}
          />
        ))}

        {/* rope + sign */}
        <line x1={150} y1={22} x2={150} y2={70} stroke="var(--muted-foreground)" strokeWidth={2.5} />
        <rect x={104} y={70} width={92} height={40} rx={4} fill="var(--muted)" stroke="var(--border)" strokeWidth={2} />
        <text x={150} y={95} textAnchor="middle" fontSize={13} fill="var(--foreground)" fontWeight={600}>
          OPEN
        </text>

        {/* tension arrow — up (equilibrium partner of weight) */}
        <g stroke="var(--chart-3)" strokeWidth={3} fill="var(--chart-3)">
          <line x1={150} y1={70} x2={150} y2={34} />
          <path d="M 0 0 L -5 10 L 5 10 Z" transform="translate(150 34)" />
        </g>
        <text x={162} y={52} fontSize={12} fill="var(--chart-3)" fontWeight={600}>
          Tension
        </text>

        {/* weight arrow — down, equal length */}
        <g stroke="var(--destructive)" strokeWidth={3} fill="var(--destructive)">
          <line x1={150} y1={110} x2={150} y2={146} />
          <path d="M 0 0 L -5 -10 L 5 -10 Z" transform="translate(150 146)" />
        </g>
        <text x={162} y={134} fontSize={12} fill="var(--destructive)" fontWeight={600}>
          Weight
        </text>

        <text x={150} y={186} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
          up cancels down — no acceleration
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Velocity-vs-time comparison, sampled from the real model above.
function VelocityCompare() {
  const off = sampleVelocity(false);
  const on = sampleVelocity(true);
  return (
    <Compare
      defaultValue="off"
      items={[
        {
          value: "off",
          label: "Friction off",
          content: (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                One kick, then nothing. <TeX>{String.raw`\sum F = 0`}</TeX>, so the speed line is flat — it coasts
                forever.
              </p>
              <Chart
                type="line"
                data={off}
                x="t"
                xType="number"
                yAxis
                series={[{ key: "v", label: "speed (m/s)" }]}
                height={220}
              />
            </div>
          ),
        },
        {
          value: "on",
          label: "With friction",
          content: (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Now a steady backward force acts. The speed falls in a straight line and stops — the surface, not the
                puck, decides when it halts.
              </p>
              <Chart
                type="line"
                data={on}
                x="t"
                xType="number"
                yAxis
                series={[{ key: "v", label: "speed (m/s)" }]}
                height={220}
              />
            </div>
          ),
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared checks.
function PretestQuiz() {
  return (
    <Quiz
      question="A puck is pushed once across perfectly frictionless ice. After your hand leaves it, what happens?"
      options={[
        {
          label: "It keeps moving at the same speed in a straight line, forever.",
          correct: true,
          hint: "Right — with no net force there is nothing to change its velocity. Coasting is the natural state.",
        },
        {
          label: "It gradually slows and stops, because motion needs a force to keep it going.",
          hint: "That's the impetus misconception. On real ice friction stops it — but remove friction and nothing stops it.",
        },
        {
          label: "It speeds up, since the push it received keeps pushing it forward.",
          hint: "The push ended when your hand left. A force that isn't there can't keep accelerating it.",
        },
      ]}
    />
  );
}

function KinematicsRetrieval() {
  return (
    <Quiz
      question="Spaced review: an object moves so that its velocity never changes. What is its acceleration?"
      options={[
        {
          label: "Zero — constant velocity means no acceleration.",
          correct: true,
          hint: "Yes. Acceleration is the rate of change of velocity; if velocity is constant, that rate is zero.",
        },
        {
          label: "Constant and non-zero, matching the constant velocity.",
          hint: "Constant velocity is not constant acceleration — a steady speed means the velocity isn't changing at all.",
        },
        {
          label: "Equal to the velocity divided by the time.",
          hint: "That would be an average velocity-like quantity, not acceleration. No change in v means a = 0.",
        },
      ]}
    />
  );
}

function ClosingQuiz({ onCorrect }: { onCorrect: () => void }) {
  return (
    <Quiz
      onCorrect={onCorrect}
      question="A puck glides at a steady 5 m/s across frictionless ice, moving right. What is the net force on it?"
      options={[
        {
          label: "Zero — constant velocity means the forces are balanced.",
          correct: true,
          hint: "Exactly. Constant velocity ⇒ zero acceleration ⇒ ΣF = 0. This is Newton's first law.",
        },
        {
          label: "A steady forward force keeps it moving to the right.",
          hint: "Impetus misconception. Nothing has to push it to keep it moving — motion persists on its own.",
        },
        {
          label: "A force points in the direction of motion, or it couldn't be moving.",
          hint: "Velocity and net force are independent. A moving object with ΣF = 0 simply keeps its velocity.",
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FirstLawLecture() {
  const { complete } = useNode();

  const derivation = (
    <Derivation
      title="Why zero net force means constant velocity"
      steps={[
        { tex: String.raw`\vec{F}_{\text{net}} = m\,\vec{a}`, note: "Newton's second law: net force sets acceleration" },
        { tex: String.raw`\sum \vec{F} = 0`, note: "equilibrium — the forces on the puck cancel" },
        { tex: String.raw`m\,\vec{a} = 0`, note: "substitute ΣF = 0 into the second law" },
        { tex: String.raw`\vec{a} = 0`, note: "divide by the mass (m ≠ 0)" },
        {
          tex: String.raw`\frac{d\vec{v}}{dt} = 0 \;\Rightarrow\; \vec{v} = \text{const}`,
          note: "zero acceleration ⇒ velocity never changes (rest is the case v = 0)",
        },
      ]}
    />
  );

  return (
    <Lecture
      title="1st Law · Inertia"
      lead="Push it once and let go: what does an object do when nothing acts on it? Slides for class, textbook for self-study — same puck, same physics."
      defaultView="textbook"
      views={[
        // ── SLIDE VIEW — one beat per screen ─────────────────────────────────
        {
          id: "slide",
          label: "Slides",
          content: (
            <SlideDeck
              slides={[
                {
                  id: "predict",
                  title: "Predict first",
                  content: (
                    <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
                      <div className="flex flex-col justify-center">
                        <Prose heading="Commit to a prediction">
                          <p>
                            Frictionless ice. You give a puck one push and let go. Say what it does <em>before</em> we
                            test it — a guess you commit to sticks better than one you read.
                          </p>
                        </Prose>
                      </div>
                      <div className="flex flex-col justify-center">
                        <PretestQuiz />
                      </div>
                    </div>
                  ),
                },
                {
                  id: "model",
                  title: "The coasting puck",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose>
                        <p>
                          Kick it once. With <strong>friction off</strong> the speed holds — it coasts forever. Flip
                          friction on and it slides to a stop. The push ends the instant it starts; what happens after is
                          the whole lesson.
                        </p>
                      </Prose>
                      <PuckModel />
                    </div>
                  ),
                },
                {
                  id: "law",
                  title: "The law",
                  content: (
                    <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
                      <div className="flex flex-col justify-center">{derivation}</div>
                      <div className="flex flex-col justify-center">
                        <Callout title="Newton's first law">
                          An object keeps its velocity — including staying at rest — unless a net force changes it.{" "}
                          <TeX>{String.raw`\sum F = 0 \Rightarrow \vec{v} = \text{const}`}</TeX>.
                        </Callout>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "equilibrium",
                  title: "Equilibrium",
                  content: (
                    <div className="grid h-full gap-4 lg:grid-cols-[2fr_3fr]">
                      <div className="flex items-center justify-center">
                        <EquilibriumFBD />
                      </div>
                      <div className="flex flex-col justify-center">
                        <Prose heading="At rest is the same rule">
                          <p>
                            A hanging sign never moves, yet forces act on it. Tension up exactly cancels weight down:{" "}
                            <TeX>{String.raw`\sum F = T - W = 0`}</TeX>. Zero net force, zero acceleration — velocity
                            stays put at zero.
                          </p>
                        </Prose>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "check",
                  title: "Check",
                  content: (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <Prose heading="The trap to avoid">
                        <p>
                          It feels like moving things need a push to keep going — that's the medieval{" "}
                          <em>impetus</em> idea, and it's wrong. On real surfaces friction hides the truth. Remove it and
                          motion simply persists.
                        </p>
                      </Prose>
                      <ClosingQuiz onCorrect={complete} />
                    </div>
                  ),
                },
              ]}
            />
          ),
        },

        // ── TEXTBOOK VIEW — the full chapter ────────────────────────────────
        {
          id: "textbook",
          label: "Textbook",
          content: (
            <TextbookView
              notesKey="first-law"
              pages={[
                {
                  id: "predict",
                  title: "Predict before you read",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          Aristotle taught, and most of us quietly still believe, that a moving object needs a continuous
                          push to keep moving — stop pushing and it stops. It matches everyday life: let go of a shopping
                          cart and it rolls to a halt. Newton's first law says that intuition has the cause backwards.
                          The halt is caused by a force (friction). Take the force away and the motion never ends.
                        </p>
                        <p>
                          Before we settle it, commit to a prediction. Imagine a puck on <strong>perfectly frictionless
                          ice</strong>: you give it one shove and let go.
                        </p>
                      </Prose>
                      <PretestQuiz />
                    </div>
                  ),
                },
                {
                  id: "model",
                  title: "A puck you can kick",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          Here is that puck. Press <strong>Kick →</strong> to apply a brief force; the arrow flashes only
                          while the push lasts, then it's gone. Watch the velocity readout and the scrolling ground. With{" "}
                          <strong>Friction</strong> switched off, notice what the speed does after the push ends.
                        </p>
                      </Prose>
                      <PuckModel />
                      <Prose>
                        <p>
                          Friction off: the velocity locks in and the ground scrolls by at a fixed rate — the puck coasts
                          with no force acting on it at all. That is the first law made visible: once the push ends,{" "}
                          <TeX>{String.raw`\sum F = 0`}</TeX>, and nothing is left to change the velocity. Now flip
                          friction on and kick again. A steady backward force appears, the speed ramps down in a straight
                          line, and the puck stops. The motion didn't "run out" — a force removed it.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "law",
                  title: "From F = ma to constant velocity",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          The first law isn't separate from the second — it's the second law read at zero net force.
                          Start from <TeX>{String.raw`\vec{F}_{\text{net}} = m\vec{a}`}</TeX> and impose equilibrium, one
                          step at a time:
                        </p>
                      </Prose>
                      {derivation}
                      <Prose>
                        <p>
                          The last line is the whole idea: zero net force forces zero acceleration, and zero acceleration
                          means the velocity is frozen at whatever it already was. A puck already gliding keeps gliding; a
                          puck at rest stays at rest. <strong>Rest is not special — it is just the case</strong>{" "}
                          <TeX>{String.raw`\vec{v} = 0`}</TeX>.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "compare",
                  title: "Two worlds, side by side",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          The tabs below plot the puck's speed against time, sampled from the same model you just drove —
                          each starting from one kick to 6 m/s. Compare the shapes.
                        </p>
                      </Prose>
                      <VelocityCompare />
                      <Prose>
                        <p>
                          A flat line versus a downward ramp. The only difference between the two experiments is whether a
                          net force acts. When it doesn't, the graph is horizontal forever — the signature of the first
                          law. When it does, the slope of the line <em>is</em> the acceleration the force produces.
                        </p>
                      </Prose>
                    </div>
                  ),
                },
                {
                  id: "equilibrium",
                  title: "Equilibrium: forces that cancel",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          "No net force" does not mean "no forces". A sign hanging motionless over a shop door has two
                          forces on it, and it obeys the same law the coasting puck does. This is called{" "}
                          <strong>equilibrium</strong>.
                        </p>
                      </Prose>
                      <EquilibriumFBD />
                      <Prose>
                        <p>
                          The rope pulls up with tension <TeX>{String.raw`T`}</TeX>; gravity pulls down with weight{" "}
                          <TeX>{String.raw`W`}</TeX>. The sign doesn't accelerate, so by the first law the net force must
                          be zero:
                        </p>
                        <p>
                          <TeX block>{String.raw`\sum F = T - W = 0 \quad\Longrightarrow\quad T = W`}</TeX>
                        </p>
                        <p>
                          The two vectors are drawn the same length precisely because they cancel. Whenever something sits
                          still or drifts at constant velocity, you can read off that its forces balance — that is how
                          engineers know the tension a cable must supply.
                        </p>
                      </Prose>
                      <Reveal label="Does equilibrium require rest?">
                        <p>
                          No. A skydiver at terminal velocity falls fast but at <em>constant</em> speed: drag has grown
                          to equal weight, so <TeX>{String.raw`\sum F = 0`}</TeX> and the velocity holds steady. Constant
                          velocity — not zero velocity — is the real condition for equilibrium.
                        </p>
                      </Reveal>
                    </div>
                  ),
                },
                {
                  id: "misconception",
                  title: "The impetus misconception",
                  content: (
                    <div className="flex flex-col gap-4">
                      <Prose>
                        <p>
                          It is worth naming the wrong idea directly, because it is stubborn. The{" "}
                          <strong>impetus theory</strong> — argued by John Buridan in the 14th century and shared by most
                          people's gut instinct today — holds that a moving object carries an internal "impetus" that
                          gradually runs out, so a force is needed to <em>keep</em> it moving. Under that view, the
                          coasting puck should slow down on its own.
                        </p>
                        <p>
                          It doesn't. In the friction-off model the puck coasts with no force whatsoever, and the speed
                          never sags. What fooled everyone for centuries is that on Earth there is <em>always</em> a
                          hidden force — friction, drag, rolling resistance — quietly draining motion. Newton's insight
                          was to imagine those away and see the real default: <strong>a body in motion stays in motion</strong>.
                          A force is needed to <em>change</em> velocity, never to <em>maintain</em> it.
                        </p>
                      </Prose>
                      <Callout title="One sentence to keep">
                        Force causes changes in motion, not motion itself. Constant velocity — including rest — needs no
                        force at all.
                      </Callout>
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
                          First, a spaced review of kinematics — the language this law is written in. Then the ConcepTest
                          that closes the lesson.
                        </p>
                      </Prose>
                      <KinematicsRetrieval />
                      <Prose>
                        <p>
                          Now the payoff question. Read it as the puck you drove, and let the friction-off graph guide
                          you: a steady velocity is the fingerprint of zero net force.
                        </p>
                      </Prose>
                      <ClosingQuiz onCorrect={complete} />
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
