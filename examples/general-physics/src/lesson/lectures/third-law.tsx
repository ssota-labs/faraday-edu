// third-law.tsx — Newton's 3rd law: action–reaction pairs.
// Outcome (recognize/distinguish): the action–reaction pair is equal in
// magnitude, opposite in direction, and acts on DIFFERENT bodies — and equal
// forces give UNEQUAL accelerations for unequal masses. One push-off model,
// one recoil-vs-mass chart, three ConcepTests, composed into a slide deck and a
// textbook chapter.
import { useEffect, useState } from "react";
import {
  Lecture,
  SlideDeck,
  Prose,
  TeX,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  Chart,
  Quiz,
  Derivation,
  Callout,
  Reveal,
} from "@faraday-academy/runtime/blocks";
import type { Slide } from "@faraday-academy/runtime/blocks";
import { useSimLoop } from "../sim2d";
import { useNode } from "@faraday-academy/runtime/world";
import { Button } from "@faraday-academy/runtime/ui/button";
import { TextbookView, type TextbookPage } from "../textbook-view";

// ── The true model ─────────────────────────────────────────────────────────
// Two carts start at rest, touching at the centre of a frictionless track. They
// push off. By Newton III the mutual force is equal and opposite, so over the
// same contact time each cart receives the SAME impulse magnitude
// J = F·Δt. Momentum splits equally: m_A·v_A = m_B·v_B = J. Because a = F/m,
// the lighter cart accelerates more and leaves faster: v = J/m ⇒ v ∝ 1/m.
const IMPULSE = 60; // J = F·Δt, in viewBox units — the shared momentum magnitude
const T_CONTACT = 0.34; // seconds the carts stay in contact while pushing
const PUSH_FORCE = IMPULSE / T_CONTACT; // ≈176 — the equal-and-opposite push
const MASS_A = 1; // cart A is the fixed reference mass

const TRACK_Y = 152;
const X_MIN = 10;
const X_MAX = 390;

/** Recoil speed a cart of the given mass leaves with, from the shared impulse. */
function recoilSpeed(mass: number): number {
  return IMPULSE / mass;
}

/** Half-width of a cart, grown with mass so heavier reads as bigger. */
function halfWidth(mass: number): number {
  return 12 * Math.sqrt(mass);
}
function cartHeight(mass: number): number {
  return 20 * Math.sqrt(mass);
}

type Phase = "ready" | "contact" | "coast" | "done" | "return";
interface Sim {
  xA: number; // cart-A centre x
  xB: number; // cart-B centre x
  vA: number; // signed velocity (A recoils left ⇒ negative)
  vB: number; // signed velocity (B recoils right ⇒ positive)
  t: number; // elapsed contact time
  phase: Phase;
}

function HArrow(props: { x: number; y: number; len: number; dir: 1 | -1; color: string }) {
  const { x, y, len, dir, color } = props;
  if (len < 2) return null;
  const x2 = x + dir * len;
  const bx = x2 - dir * 6;
  return (
    <g stroke={color} fill={color} strokeWidth={3} strokeLinecap="round">
      <line x1={x} y1={y} x2={bx} y2={y} />
      <polygon points={`${x2},${y} ${bx},${y - 4.5} ${bx},${y + 4.5}`} stroke="none" />
    </g>
  );
}

function PushOffModel() {
  const [massB, setMassB] = useState(2);
  const [playing, setPlaying] = useState(false);

  const halfA = halfWidth(MASS_A);
  const halfB = halfWidth(massB);
  const heightA = cartHeight(MASS_A);
  const heightB = cartHeight(massB);
  const homeA = 200 - halfA;
  const homeB = 200 + halfB;

  const [sim, setSim] = useState<Sim>(() => ({
    xA: 200 - halfA,
    xB: 200 + halfWidth(2),
    vA: 0,
    vB: 0,
    t: 0,
    phase: "ready",
  }));

  // Keep the carts touching at centre whenever they are at rest and the learner
  // changes the mass ratio.
  useEffect(() => {
    setSim((s) => (s.phase === "ready" ? { ...s, xA: homeA, xB: homeB } : s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [massB]);

  // Stop the loop the frame a cart hits a wall or the reset settles home.
  useEffect(() => {
    if (sim.phase === "done" || sim.phase === "ready") setPlaying(false);
  }, [sim.phase]);

  useSimLoop((dt) => {
    setSim((s) => {
      let { xA, xB, vA, vB, t, phase } = s;

      if (phase === "return") {
        const k = Math.min(1, 6 * dt);
        xA += (homeA - xA) * k;
        xB += (homeB - xB) * k;
        if (Math.abs(xA - homeA) < 0.5 && Math.abs(xB - homeB) < 0.5) {
          return { xA: homeA, xB: homeB, vA: 0, vB: 0, t: 0, phase: "ready" };
        }
        return { xA, xB, vA, vB, t, phase };
      }

      if (phase === "contact") {
        // Equal and opposite force → unequal accelerations (a = F/m).
        vA += (-PUSH_FORCE / MASS_A) * dt;
        vB += (PUSH_FORCE / massB) * dt;
        t += dt;
        if (t >= T_CONTACT) phase = "coast";
      }

      xA += vA * dt;
      xB += vB * dt;

      if (xA - halfA <= X_MIN || xB + halfB >= X_MAX) phase = "done";
      return { xA, xB, vA, vB, t, phase };
    });
  }, playing);

  const start = () => {
    setSim({ xA: homeA, xB: homeB, vA: 0, vB: 0, t: 0, phase: "contact" });
    setPlaying(true);
  };
  const reset = () => {
    setSim((s) => (s.phase === "ready" ? s : { ...s, phase: "return" }));
    setPlaying(true);
  };
  const mainClick = () => {
    if (sim.phase === "ready") return start();
    if (sim.phase === "done") return start();
    setPlaying((p) => !p);
  };
  const mainLabel =
    sim.phase === "ready" ? "Push off" : sim.phase === "done" ? "Push again" : playing ? "Pause" : "Resume";

  const speedA = Math.abs(sim.vA);
  const speedB = Math.abs(sim.vB);
  const pA = MASS_A * speedA;
  const pB = massB * speedB;
  const inContact = sim.phase === "contact";
  const moving = sim.phase === "coast" || sim.phase === "done";

  const ycA = TRACK_Y - heightA / 2;
  const ycB = TRACK_Y - heightB / 2;
  const vScale = 0.42;

  return (
    <Workbench
      title="Frictionless track — push off from rest"
      panelTitle="Masses"
      hud={
        <>
          <Readout label="V A" value={speedA.toFixed(1)} tone="primary" />
          <Readout label="V B" value={speedB.toFixed(1)} tone="destructive" />
          <Readout label="M·V (A)" value={pA.toFixed(0)} />
          <Readout label="M·V (B)" value={pB.toFixed(0)} />
          <Button size="sm" onClick={mainClick}>
            {mainLabel}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} disabled={sim.phase === "ready"}>
            Reset
          </Button>
        </>
      }
      controls={
        <ControlGroup label="Mass ratio" onReset={() => setMassB(2)}>
          <ParamSlider
            label="Cart B mass (× cart A)"
            value={massB}
            min={0.5}
            max={4}
            step={0.25}
            onChange={(n) => setMassB(n)}
            format={(n) => `${n.toFixed(2)}×`}
          />
          <p className="text-xs text-muted-foreground">
            Cart A is fixed at 1×. Same push, heavier cart barely budges.
          </p>
        </ControlGroup>
      }
    >
      <svg viewBox="0 0 400 200" role="img" aria-label="Two carts pushing off from rest on a track">
        {/* track + end walls */}
        <line x1={X_MIN} y1={TRACK_Y} x2={X_MAX} y2={TRACK_Y} stroke="var(--border)" strokeWidth={2} />
        <line x1={X_MIN} y1={TRACK_Y - 14} x2={X_MIN} y2={TRACK_Y} stroke="var(--muted-foreground)" strokeWidth={2} />
        <line x1={X_MAX} y1={TRACK_Y - 14} x2={X_MAX} y2={TRACK_Y} stroke="var(--muted-foreground)" strokeWidth={2} />

        {/* contact-point tick */}
        <line x1={200} y1={TRACK_Y} x2={200} y2={TRACK_Y + 8} stroke="var(--border)" strokeWidth={1} />

        {/* Cart A */}
        <g>
          <rect
            x={sim.xA - halfA}
            y={ycA}
            width={halfA * 2}
            height={heightA}
            rx={4}
            style={{ fill: "var(--primary)", opacity: 0.9 }}
          />
          <text x={sim.xA} y={ycA - 5} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
            A · {MASS_A.toFixed(1)}
          </text>
        </g>

        {/* Cart B */}
        <g>
          <rect
            x={sim.xB - halfB}
            y={ycB}
            width={halfB * 2}
            height={heightB}
            rx={4}
            style={{ fill: "var(--destructive)", opacity: 0.9 }}
          />
          <text x={sim.xB} y={ycB - 5} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
            B · {massB.toFixed(2)}
          </text>
        </g>

        {/* Equal-and-opposite force arrows during contact (same colour + length) */}
        {inContact ? (
          <>
            <HArrow x={sim.xA} y={TRACK_Y - heightA - 12} len={26} dir={-1} color="var(--chart-3)" />
            <HArrow x={sim.xB} y={TRACK_Y - heightB - 12} len={26} dir={1} color="var(--chart-3)" />
            <text x={200} y={TRACK_Y - 70} textAnchor="middle" fontSize={11} fill="var(--chart-3)">
              equal &amp; opposite push
            </text>
          </>
        ) : null}

        {/* Velocity arrows while coasting — length ∝ speed, so unequal */}
        {moving ? (
          <>
            <HArrow x={sim.xA} y={ycA - 12} len={speedA * vScale} dir={-1} color="var(--primary)" />
            <HArrow x={sim.xB} y={ycB - 12} len={speedB * vScale} dir={1} color="var(--destructive)" />
          </>
        ) : null}

        {sim.phase === "ready" ? (
          <text x={200} y={30} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
            Press “Push off” — watch which cart wins the recoil.
          </text>
        ) : null}
      </svg>
    </Workbench>
  );
}

// ── Recoil speed vs mass, sampled from the real model (v = J/m ∝ 1/m) ────────
function RecoilChart() {
  const [massB, setMassB] = useState(2);
  const masses: number[] = [];
  for (let m = 0.5; m <= 4.0001; m += 0.25) masses.push(Math.round(m * 100) / 100);
  if (!masses.some((m) => Math.abs(m - massB) < 1e-9)) {
    masses.push(massB);
    masses.sort((a, b) => a - b);
  }
  const data = masses.map((m) => ({
    m,
    speed: Math.round(recoilSpeed(m) * 10) / 10,
    here: Math.abs(m - massB) < 1e-9 ? Math.round(recoilSpeed(m) * 10) / 10 : null,
  }));

  return (
    <div className="flex flex-col gap-3">
      <Chart
        type="line"
        data={data}
        x="m"
        xType="number"
        yAxis
        legend
        height={260}
        series={[
          { key: "speed", label: "Recoil speed  v = J/m", color: "var(--chart-1)" },
          { key: "here", label: "Selected cart B", color: "var(--destructive)" },
        ]}
      />
      <ParamSlider
        label="Read off cart B mass"
        value={massB}
        min={0.5}
        max={4}
        step={0.25}
        onChange={(n) => setMassB(n)}
        format={(n) => `${n.toFixed(2)}×  →  v ≈ ${recoilSpeed(n).toFixed(0)}`}
      />
    </div>
  );
}

// ── Derivation of the recoil law ─────────────────────────────────────────────
function RecoilDerivation({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Derivation
      title="From equal forces to unequal speeds"
      defaultOpen={defaultOpen}
      steps={[
        {
          tex: String.raw`\vec F_{AB} = -\,\vec F_{BA}`,
          note: "Newton III — A's push on B and B's push on A are equal and opposite.",
        },
        {
          tex: String.raw`F\,\Delta t \;=\; m_A v_A \;=\; m_B v_B \;\equiv\; J`,
          note: "Same force, same contact time ⇒ each cart gains the same impulse J.",
        },
        {
          tex: String.raw`\frac{v_A}{v_B} \;=\; \frac{m_B}{m_A}`,
          note: "Divide the two: recoil speed is inversely proportional to mass.",
        },
        {
          tex: String.raw`v \;=\; \frac{J}{m} \quad\Longrightarrow\quad v \propto \frac{1}{m}`,
          note: "Fix the shared impulse J: the lighter body recoils faster.",
        },
      ]}
    />
  );
}

// ── ConcepTests ──────────────────────────────────────────────────────────────
function PretestQuiz() {
  return (
    <Quiz
      question="A heavy truck slams into a small parked car. During the collision, which pushes harder — the force of the truck on the car, or of the car on the truck?"
      options={[
        {
          label: "The truck pushes on the car much harder than the car pushes back.",
          hint: "This is the common intuition — but hold it. Run the push-off model below and watch m·v for each body before deciding.",
        },
        {
          label: "The car pushes harder because it stops so suddenly.",
          hint: "Sudden stops are about acceleration, not force size. Come back after the model and the derivation.",
        },
        {
          label: "Both forces are exactly equal in size, in opposite directions.",
          correct: true,
          hint: "This is Newton III. The forces are a matched pair — what differs is the acceleration, because a = F/m.",
        },
        {
          label: "It depends on how fast the truck was going.",
          hint: "Speed sets how hard the pair pushes, but the two members of the pair stay equal at every instant.",
        },
      ]}
    />
  );
}

function SecondLawSpacedQuiz() {
  return (
    <Quiz
      question="Recall the second law. The same push force acts on the light cart and on the heavy cart. Which one speeds up more during the push?"
      options={[
        {
          label: "The light cart — with F fixed, a = F/m is larger for smaller m.",
          correct: true,
          hint: "Exactly. Equal forces, unequal accelerations. That is why the light cart leaves faster.",
        },
        {
          label: "The heavy cart, because heavier things carry more force.",
          hint: "Mass resists acceleration, it doesn't add force. The force here is set by the push, the same on both.",
        },
        {
          label: "They speed up at the same rate — the force is the same.",
          hint: "Same force, but a = F/m. Divide the equal force by different masses and the accelerations differ.",
        },
      ]}
    />
  );
}

function ThirdLawCheck() {
  const { complete } = useNode();
  return (
    <Quiz
      onCorrect={complete}
      question="A 20-ton truck rear-ends a 1-ton car. Compare the force of the truck on the car with the force of the car on the truck during the impact."
      options={[
        {
          label: "Equal in magnitude, opposite in direction — even though the car is flung and the truck barely slows.",
          correct: true,
          hint: "Newton III. The pair is equal; the car accelerates far more only because a = F/m and its mass is tiny.",
        },
        {
          label: "The truck exerts a larger force — it's heavier and doing the hitting.",
          hint: "The two forces act on DIFFERENT bodies and are always equal. What the truck's mass buys is a small acceleration, not a bigger force.",
        },
        {
          label: "The forces are equal, so they cancel and neither vehicle accelerates.",
          hint: "They can't cancel — they act on different bodies. Forces only add up (and possibly cancel) when they act on the SAME body.",
        },
      ]}
    />
  );
}

// ── Slide deck ───────────────────────────────────────────────────────────────
const slides: Slide[] = [
  {
    id: "pretest",
    title: "Predict first",
    content: (
      <div className="flex h-full flex-col gap-4">
        <Prose heading="Truck meets car">
          <p>
            Commit to an answer before you see the model. During the crash, is the truck's push on the car bigger,
            smaller, or exactly equal to the car's push back on the truck?
          </p>
        </Prose>
        <PretestQuiz />
      </div>
    ),
  },
  {
    id: "model",
    title: "Push off",
    content: (
      <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
        <PushOffModel />
        <div className="flex flex-col gap-3">
          <Prose>
            <p>
              Two carts sit at rest, touching. When they push off, the force on each is <strong>equal and
              opposite</strong> (the orange arrows are the same length). Yet the light cart flies off faster.
            </p>
            <p>
              Watch the two <TeX>{String.raw`m\,v`}</TeX> readouts: they stay <strong>equal</strong> the whole time,
              even as the speeds differ. Momentum splits evenly; speed does not.
            </p>
          </Prose>
        </div>
      </div>
    ),
  },
  {
    id: "chart",
    title: "Recoil vs mass",
    content: (
      <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
        <RecoilChart />
        <div className="flex flex-col gap-3">
          <Prose>
            <p>
              Fix the shared impulse <TeX>{String.raw`J`}</TeX> and the recoil speed is{" "}
              <TeX>{String.raw`v = J/m`}</TeX> — a <TeX>{String.raw`1/m`}</TeX> curve. Double the mass, halve the speed.
            </p>
            <p>This is the second law wearing a disguise: equal force, so bigger mass means smaller response.</p>
          </Prose>
        </div>
      </div>
    ),
  },
  {
    id: "reason",
    title: "Why they don't cancel",
    content: (
      <div className="flex h-full flex-col gap-4">
        <RecoilDerivation defaultOpen />
        <Callout title="The one idea">
          Action and reaction are equal and opposite, but they act on <strong>different bodies</strong>, so they never
          cancel. Equal forces on unequal masses give unequal accelerations.
        </Callout>
      </div>
    ),
  },
  {
    id: "check",
    title: "Check",
    content: (
      <div className="flex h-full flex-col gap-4">
        <Prose heading="Back to the crash">
          <p>Now settle the truck-and-car question with everything you've seen.</p>
        </Prose>
        <ThirdLawCheck />
        <SecondLawSpacedQuiz />
      </div>
    ),
  },
];

// ── Textbook chapter ─────────────────────────────────────────────────────────
const pages: TextbookPage[] = [
  {
    id: "hook",
    title: "1 · A question you already have an opinion about",
    content: (
      <div className="flex flex-col gap-5">
        <Prose>
          <p>
            Picture a heavy truck slamming into a small parked car. Almost everyone's gut says the truck must push on
            the car far harder than the car pushes back — after all, the car is the one that gets wrecked. That
            intuition feels airtight, and it is <em>wrong</em>. This chapter is about why.
          </p>
          <p>
            Newton's third law makes a startling claim: whenever body A pushes on body B, body B pushes back on A with a
            force that is <strong>equal in magnitude and opposite in direction</strong>. Not roughly equal. Not equal
            once things settle. Equal at every instant, in every interaction, no matter how mismatched the two bodies.
            The forces come in pairs, and the two members of a pair are twins.
          </p>
          <p>
            Before we defend that, commit to a prediction. Locking in an answer first makes the model below land far
            harder than reading past it would.
          </p>
        </Prose>
        <PretestQuiz />
        <Prose>
          <p>
            Hold whichever answer you chose. The rest of the chapter is a machine for either confirming it or dismantling
            it — and the crucial move is to stop watching who gets <em>hurt</em> and start watching the two{" "}
            <em>forces</em> themselves.
          </p>
        </Prose>
      </div>
    ),
  },
  {
    id: "model",
    title: "2 · Two carts, one push",
    content: (
      <div className="flex flex-col gap-5">
        <Prose>
          <p>
            A collision is hard to watch because two things change at once — speeds and shapes. So strip it down. Put two
            carts on a frictionless track, at rest, touching. Between them sits a compressed spring. Release it and they
            push off. Because the track is frictionless, the only horizontal forces are the two the carts exert on{" "}
            <em>each other</em> — a clean action–reaction pair.
          </p>
          <p>
            Drive the model below. The orange arrows are the mutual push during contact; notice they are always the{" "}
            <strong>same length</strong> — that is <TeX>{String.raw`|\vec F_{AB}| = |\vec F_{BA}|`}</TeX>. After the
            carts separate, the arrows become velocity arrows, and now they differ. Change the mass ratio and push
            again.
          </p>
        </Prose>
        <PushOffModel />
        <Prose>
          <p>
            Two numbers deserve your attention. The speeds <TeX>{String.raw`v_A`}</TeX> and{" "}
            <TeX>{String.raw`v_B`}</TeX> are different — the lighter cart recoils faster. But the two momentum readouts,{" "}
            <TeX>{String.raw`m_A v_A`}</TeX> and <TeX>{String.raw`m_B v_B`}</TeX>, stay locked together at every frame.
            Equal forces acting for the same contact time hand each cart the same <em>impulse</em>, so the momenta split
            evenly even though the velocities do not. The heavier cart's mass eats its share of the impulse and leaves it
            barely crawling.
          </p>
        </Prose>
      </div>
    ),
  },
  {
    id: "quantify",
    title: "3 · The recoil law, derived and plotted",
    content: (
      <div className="flex flex-col gap-5">
        <Prose>
          <p>
            The model shows momenta staying equal; let's turn that observation into a formula, one honest line at a time.
            Everything follows from the third law plus the fact that both carts feel the force for the same length of
            time.
          </p>
        </Prose>
        <RecoilDerivation />
        <Prose>
          <p>
            The last line is the payoff: with the shared impulse <TeX>{String.raw`J`}</TeX> fixed, recoil speed is{" "}
            <TeX>{String.raw`v = J/m`}</TeX>. That is a proportional-to-<TeX>{String.raw`1/m`}</TeX> relationship, and a
            claim like that earns a graph. The curve below is sampled straight from the model — no sketching.
          </p>
        </Prose>
        <RecoilChart />
        <Prose>
          <p>
            Double a cart's mass and its recoil speed halves; quadruple it and the speed drops to a quarter. The steep
            wall on the left is why a ping-pong ball rebounds violently while the bat you struck it with does not visibly
            move. Notice this is the second law in disguise: the force is fixed, so{" "}
            <TeX>{String.raw`a = F/m`}</TeX> shrinks as mass grows. Equal forces, unequal accelerations.
          </p>
        </Prose>
        <SecondLawSpacedQuiz />
        <Prose>
          <p>
            Keep that distinction sharp — a bigger mass never means a bigger force here. It means a smaller response to
            the same force.
          </p>
        </Prose>
      </div>
    ),
  },
  {
    id: "reason",
    title: "4 · Different bodies, so they never cancel",
    content: (
      <div className="flex flex-col gap-5">
        <Prose>
          <p>
            There's a second trap hiding behind the first. If the two forces are exactly equal and opposite, why don't
            they simply cancel, leaving nothing to move? Students who escape the "truck pushes harder" error often fall
            straight into this one.
          </p>
          <p>
            The resolution is the most important sentence in the whole chapter: the two forces{" "}
            <strong>act on different bodies</strong>. The truck's push acts on the <em>car</em>; the car's push acts on
            the <em>truck</em>. Forces only add together — and can only cancel — when they act on the{" "}
            <em>same</em> body. A pair split across two bodies can never zero itself out. Each body feels exactly one
            member of the pair, accelerates according to its own <TeX>{String.raw`a = F/m`}</TeX>, and goes its own way.
          </p>
        </Prose>
        <Callout title="The one idea to keep">
          Action and reaction are equal in size, opposite in direction, and land on <strong>different bodies</strong>.
          Equal forces on unequal masses give unequal accelerations — which is why the small car is flung while the
          truck barely flinches.
        </Callout>
        <Reveal label="Common trap: “but the car clearly loses”">
          <p>
            The car does lose — in <em>acceleration</em>, not in force. With a tiny mass, the same force gives it a huge{" "}
            <TeX>{String.raw`a = F/m`}</TeX>, so it whips forward and its occupants feel a brutal jolt. The truck feels
            the identical-sized force but, divided by its enormous mass, gets a negligible acceleration. Damage tracks
            acceleration, not the size of the force pair.
          </p>
        </Reveal>
        <Prose>
          <p>
            You now have every piece: the pair is equal and opposite, it acts on two different bodies so it can't cancel,
            and equal force over unequal mass yields unequal recoil. Use all three to settle the crash for good.
          </p>
        </Prose>
        <ThirdLawCheck />
      </div>
    ),
  },
];

export default function ThirdLawLecture() {
  return (
    <Lecture
      title="3rd Law · Pairs"
      lead="Every push has an equal, opposite partner — on a different body. Slides for class, textbook for self-study."
      defaultView="textbook"
      views={[
        { id: "slide", label: "Slides", content: <SlideDeck slides={slides} /> },
        {
          id: "textbook",
          label: "Textbook",
          content: <TextbookView notesKey="third-law" pages={pages} />,
        },
      ]}
    />
  );
}
