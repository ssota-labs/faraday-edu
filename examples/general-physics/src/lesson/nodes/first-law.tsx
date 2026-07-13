// Node: first-law — Newton's 1st law (inertia) & equilibrium. Peer-Instruction shape:
// a committed ConcepTest first, then a puck model resolves it, then equilibrium.
import { useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSwitch, Readout,
  Compare, Callout, Quiz, TeX, Stage,
} from "@faraday-academy/runtime/blocks";
import { Button } from "@faraday-academy/runtime/ui/button";
import { useNode } from "@faraday-academy/runtime/world";
import { useRafLoop } from "@faraday-academy/runtime/runtime";

const TRACK_M = 40;
const W = 560;
const H = 170;
const KICK = 12; // m/s
const MU_K_G = 4; // kinetic decel with friction on (μ_k·g ≈ 0.4·9.8, rounded)

function Puck({ xM, moving }: { xM: number; moving: boolean }) {
  const toPix = (m: number) => 24 + ((m % TRACK_M) / TRACK_M) * (W - 72);
  const cx = toPix(xM);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Puck sliding on a surface" width="100%">
      <line x1={16} y1={120} x2={W - 16} y2={120} stroke="var(--border)" strokeWidth={3} />
      {moving && (
        <g>
          {/* velocity arrow — the only force-free motion carrier */}
          <line x1={cx + 20} y1={104} x2={cx + 54} y2={104} stroke="var(--primary)" strokeWidth={3} />
          <polygon points={`${cx + 54},98 ${cx + 66},104 ${cx + 54},110`} style={{ fill: "var(--primary)" }} />
          <text x={cx + 43} y={92} textAnchor="middle" fontSize={11} style={{ fill: "var(--primary)" }}>v</text>
        </g>
      )}
      <circle cx={cx} cy={104} r={15} style={{ fill: "var(--chart-1)" }} />
    </svg>
  );
}

export default function FirstLaw() {
  const { complete } = useNode();
  const [friction, setFriction] = useState(false);
  const [xM, setXM] = useState(6);
  const [v, setV] = useState(0);
  const vRef = useRef(0);
  const xRef = useRef(6);
  vRef.current = v;
  xRef.current = xM;

  useRafLoop((dt) => {
    let nv = vRef.current;
    if (friction && nv > 0) nv = Math.max(0, nv - MU_K_G * dt);
    if (nv <= 0) return;
    setV(nv);
    setXM((xRef.current + nv * dt) % TRACK_M);
  }, true);

  const netForce = friction && v > 0.01 ? "− f (kinetic)" : "0";

  return (
    <Lesson topic="Newton's 1st law" title="Inertia: motion needs no cause — change does"
      lead="Aristotle taught that a moving object needs a continuous push to keep moving. He was wrong, and the mistake is one almost everyone makes. Newton's first law says the natural state of motion is to keep doing whatever you're already doing.">
      <Prose>
        <p>
          Newton's first law: <em>an object at rest stays at rest, and an object in motion stays in
          motion at constant velocity, unless acted on by a net external force.</em> Rest is not
          special — it is simply the case where the constant velocity happens to be zero. The property
          that resists any change in motion is <strong>inertia</strong>, and its measure is mass.
        </p>
        <p>
          Commit to a prediction before you run anything — this is where intuition and physics usually
          part ways.
        </p>
      </Prose>

      <Quiz question="A puck slides across perfectly frictionless ice with no one touching it. What happens to its motion?"
        options={[
          { label: "It gradually slows and stops — motion always dies out", hint: "That is the Aristotelian/impetus misconception. Slowing needs a force; frictionless means none acts." },
          { label: "It keeps moving forever at the same constant velocity", correct: true, hint: "Right — with zero net force there is nothing to change the velocity." },
          { label: "It keeps moving but needs a small forward force to do so", hint: "No force is required to MAINTAIN motion — only to CHANGE it. This is the key misconception the law corrects." },
        ]} />

      <Prose heading="Watch inertia directly">
        <p>
          Kick the puck, then flip friction on and off. With friction <strong>off</strong>, the velocity
          never changes on its own — the puck coasts forever with a steady <TeX>{String.raw`v`}</TeX> and{" "}
          <em>zero net force</em>. Turn friction <strong>on</strong> and a real force appears, opposing the
          motion, and only then does the puck slow. The motion did not need a cause; the <em>change</em> did.
        </p>
      </Prose>

      <Workbench
        title="Frictionless vs. real surface"
        panelTitle="Surface"
        onReset={() => { setFriction(false); setV(0); setXM(6); }}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Button size="sm" onClick={() => setV(KICK)}>Kick →</Button>
            <Readout label="v" value={`${v.toFixed(1)} m/s`} tone="primary" />
            <Readout label="net force" value={netForce} tone={netForce === "0" ? "default" : "destructive"} />
          </div>
        }
        controls={
          <ControlGroup label="Conditions">
            <ParamSwitch label="Friction on" checked={friction} onChange={setFriction} />
            <p className="text-sm text-muted-foreground">
              Off = ideal ice (no net force). On = a real floor that drags the puck to a stop.
            </p>
          </ControlGroup>
        }
      >
        <Puck xM={xM} moving={v > 0.01} />
      </Workbench>

      <Prose heading="The two regimes, side by side">
        <p>
          The difference is entirely about whether a net force exists — not about whether the puck is
          moving.
        </p>
      </Prose>
      <Compare items={[
        { value: "ideal", label: "Frictionless", content: (
          <p className="text-sm">
            Net force <TeX>{String.raw`\sum \vec F = 0`}</TeX>. Velocity is constant. The puck coasts
            indefinitely — motion persists with <em>no</em> cause. This is inertia in its purest form.
          </p>
        ) },
        { value: "real", label: "Real surface", content: (
          <p className="text-sm">
            Kinetic friction supplies a real backward force, so{" "}
            <TeX>{String.raw`\sum \vec F \ne 0`}</TeX> and the velocity decreases. The puck stops not
            because motion "runs out" but because a force acted.
          </p>
        ) },
      ]} />

      <Prose heading="Equilibrium: the same law at rest">
        <p>
          When the net force is zero the velocity is constant — and a very common case is constant{" "}
          <em>zero</em> velocity: a body at rest. This is <strong>equilibrium</strong>. A sign hanging
          from two cables isn't held up by magic; the two tensions and gravity add to exactly zero:
        </p>
      </Prose>
      <Stage caption="Static equilibrium — the three forces on the sign sum to zero.">
        <svg viewBox="0 0 420 220" role="img" aria-label="A sign hung from two cables in equilibrium" width="100%">
          <line x1={40} y1={30} x2={380} y2={30} stroke="var(--border)" strokeWidth={4} />
          <line x1={120} y1={30} x2={210} y2={120} stroke="var(--muted-foreground)" strokeWidth={2} />
          <line x1={300} y1={30} x2={210} y2={120} stroke="var(--muted-foreground)" strokeWidth={2} />
          <rect x={170} y={120} width={80} height={40} rx={4} style={{ fill: "var(--card)" }} stroke="var(--border)" strokeWidth={2} />
          <text x={210} y={145} textAnchor="middle" fontSize={13} style={{ fill: "var(--foreground)" }}>SIGN</text>
          {/* tension vectors */}
          <line x1={210} y1={120} x2={168} y2={78} stroke="var(--chart-2)" strokeWidth={3} />
          <polygon points="168,78 176,84 162,86" style={{ fill: "var(--chart-2)" }} />
          <line x1={210} y1={120} x2={252} y2={78} stroke="var(--chart-2)" strokeWidth={3} />
          <polygon points="252,78 258,86 244,84" style={{ fill: "var(--chart-2)" }} />
          <text x={150} y={74} fontSize={12} style={{ fill: "var(--chart-2)" }}>T₁</text>
          <text x={260} y={74} fontSize={12} style={{ fill: "var(--chart-2)" }}>T₂</text>
          {/* weight */}
          <line x1={210} y1={160} x2={210} y2={205} stroke="var(--destructive)" strokeWidth={3} />
          <polygon points="204,199 210,211 216,199" style={{ fill: "var(--destructive)" }} />
          <text x={224} y={195} fontSize={12} style={{ fill: "var(--destructive)" }}>mg</text>
        </svg>
      </Stage>
      <Prose>
        <p>
          In equilibrium both the horizontal and vertical components balance:{" "}
          <TeX block>{String.raw`\sum F_x = 0 \qquad \sum F_y = 0`}</TeX>
          The horizontal tensions cancel each other; the two vertical tension components together cancel{" "}
          the weight <TeX>{String.raw`mg`}</TeX>. Zero net force — exactly the first law, with the constant
          velocity equal to zero.
        </p>
      </Prose>

      <Callout title="The key idea">
        A force is not needed to keep something moving — only to <em>change</em> its motion. Constant
        velocity (including rest) ⇔ zero net force. That equivalence is Newton's first law.
      </Callout>

      <Quiz question="A spacecraft coasts between stars with its engines off, far from any star or planet. To keep moving in a straight line at constant speed, its engines must…"
        onCorrect={complete}
        options={[
          { label: "fire continuously forward", hint: "That's the impetus misconception again — constant velocity needs zero net force, so no thrust at all." },
          { label: "not fire at all — zero net force already means constant velocity", correct: true, hint: "Exactly. In deep space there is nothing to slow it, so it coasts by the first law." },
          { label: "fire briefly every few minutes to top up its motion", hint: "Motion doesn't leak away without a force. No top-ups are needed." },
        ]} />
      <Prose>
        <p className="text-sm text-muted-foreground">
          Spaced recall from the last node: if that spacecraft did fire a steady thrust and accelerated
          from rest at <TeX>{String.raw`3\ \text{m/s}^2`}</TeX>, you already know it would cover{" "}
          <TeX>{String.raw`\tfrac{1}{2}(3)(5)^2 = 37.5\ \text{m}`}</TeX> in 5 s.
        </p>
      </Prose>
    </Lesson>
  );
}
