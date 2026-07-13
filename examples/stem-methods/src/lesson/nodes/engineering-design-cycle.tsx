import { useState } from "react";
import {
  Prose,
  Quiz,
  NumericAnswer,
  Compare,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  Challenge,
  Callout,
} from "@faraday-academy/runtime/blocks";
import { MethodShell } from "../_shared/MethodShell";

// Physics: terminal velocity under parachute.
// v_terminal = sqrt( 2mg / (rho * Cd * A) )
// For egg drop: m=0.065 kg, g=9.81, rho=1.225, Cd=1.3 (open canopy)
// A = pi * r^2
const M = 0.065;
const G = 9.81;
const RHO = 1.225;
const CD = 1.3;

function impactSpeed(radiusCm: number): number {
  const r = radiusCm / 100;
  const area = Math.PI * r * r;
  const v = Math.sqrt((2 * M * G) / (RHO * CD * area));
  return Math.round(v * 10) / 10;
}

export default function EngineeringDesignCycle() {
  const [radius, setRadius] = useState(20);

  const speed = impactSpeed(radius);
  const missionClear = speed < 6;

  return (
    <MethodShell
      method="Engineering Design Cycle (EDC)"
      discipline="Physics / Mechanical Engineering"
      topic="Forces & Drag"
      title="Egg drop parachute — design, prototype, test, refine"
      lead="Walk the full engineering design cycle: define requirements, compare canopy options, prototype in the simulator, test against the safety threshold, and refine your design."
      phases={["Define", "Ideate", "Prototype", "Test", "Refine"]}
      families={["NumericAnswer", "Compare", "Workbench + ParamSlider + Readout", "Challenge", "Callout"]}
    >
      {/* Phase 1 — Define */}
      <Prose heading="Define: what must the design achieve?">
        <p>
          An egg (mass ≈ 65 g) is dropped from a third-floor window (~10 m). Your parachute must
          slow it enough that impact won't crack the shell. Lab tests show a raw egg survives
          impacts below <strong>6 m/s</strong>. Above that, shells crack.
        </p>
        <p>
          Before designing, make sure you understand the physics. The terminal velocity under a
          circular canopy is:
        </p>
        <p className="font-mono text-sm bg-muted rounded px-3 py-2">
          v = √( 2mg / (ρ · Cd · π r²) )
        </p>
        <p>
          where m = 0.065 kg, g = 9.81 m/s², ρ = 1.225 kg/m³ (air), Cd ≈ 1.3 (open canopy).
        </p>
      </Prose>

      <NumericAnswer
        question="Using the formula above, what is the terminal velocity (m/s) for a canopy radius of 30 cm? Round to one decimal place."
        answer={impactSpeed(30)}
        tolerance={0.15}
        unit="m/s"
        hint="Plug r = 0.30 m into the formula. Compute A = π × 0.30² first, then substitute into √(2mg / ρCdA)."
      />

      {/* Phase 2 — Ideate */}
      <Prose heading="Ideate: compare three canopy sizes">
        <p>
          Your team brainstormed three canopy diameters. Review the trade-offs — a larger canopy
          gives lower speed but is harder to fold and more likely to tangle.
        </p>
      </Prose>

      <Compare
        defaultValue="small"
        items={[
          {
            value: "small",
            label: "Small (r = 15 cm)",
            content: (
              <div className="flex flex-col gap-2 p-4 text-sm">
                <p><strong>Canopy radius:</strong> 15 cm</p>
                <p><strong>Impact speed:</strong> {impactSpeed(15)} m/s</p>
                <p><strong>Verdict:</strong> {impactSpeed(15) < 6 ? "Safe" : "Too fast — egg cracks"}</p>
                <p className="text-muted-foreground">
                  Compact, easy to fold, fits in one hand — but drag area is only 0.071 m². At this
                  speed the egg is unlikely to survive.
                </p>
              </div>
            ),
          },
          {
            value: "medium",
            label: "Medium (r = 25 cm)",
            content: (
              <div className="flex flex-col gap-2 p-4 text-sm">
                <p><strong>Canopy radius:</strong> 25 cm</p>
                <p><strong>Impact speed:</strong> {impactSpeed(25)} m/s</p>
                <p><strong>Verdict:</strong> {impactSpeed(25) < 6 ? "Safe ✓" : "Too fast — egg cracks"}</p>
                <p className="text-muted-foreground">
                  Moderate drag area (0.196 m²). Folds to roughly A4 size. Depending on your
                  calculation this may or may not clear the 6 m/s threshold.
                </p>
              </div>
            ),
          },
          {
            value: "large",
            label: "Large (r = 35 cm)",
            content: (
              <div className="flex flex-col gap-2 p-4 text-sm">
                <p><strong>Canopy radius:</strong> 35 cm</p>
                <p><strong>Impact speed:</strong> {impactSpeed(35)} m/s</p>
                <p><strong>Verdict:</strong> {impactSpeed(35) < 6 ? "Safe ✓" : "Too fast — egg cracks"}</p>
                <p className="text-muted-foreground">
                  Large drag area (0.385 m²) comfortably meets the spec, but the canopy can tangle
                  during deployment — a real failure mode to test for.
                </p>
              </div>
            ),
          },
        ]}
      />

      {/* Phase 3 — Prototype */}
      <Workbench
        title="Canopy simulator"
        panelTitle="Prototype parameters"
        controls={
          <ControlGroup label="Canopy geometry">
            <ParamSlider
              label="Radius (cm)"
              value={radius}
              min={10}
              max={40}
              step={1}
              onChange={setRadius}
            />
          </ControlGroup>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Readout
              label="Impact speed"
              value={`${speed} m/s`}
              tone={missionClear ? "primary" : speed < 8 ? "default" : "destructive"}
            />
            <Readout
              label="Drag area"
              value={`${(Math.PI * (radius / 100) ** 2).toFixed(3)} m²`}
            />
            <Readout label="Canopy radius" value={`${radius} cm`} />
            <Readout label="Limit" value="< 6 m/s" />
          </div>

          {/* Canopy diagram */}
          <svg
            viewBox="0 0 200 140"
            className="w-full max-w-xs"
            role="img"
            aria-label="Parachute canopy diagram"
          >
            {/* Canopy arc */}
            <ellipse
              cx={100}
              cy={70}
              rx={Math.max(10, radius * 1.8)}
              ry={Math.max(6, radius * 0.9)}
              fill="var(--primary)"
              opacity={0.15}
              stroke="var(--primary)"
              strokeWidth={1.5}
            />
            {/* Shroud lines */}
            {[-1, 0, 1].map((offset) => (
              <line
                key={offset}
                x1={100 + offset * Math.max(10, radius * 1.8) * 0.5}
                y1={70}
                x2={100}
                y2={115}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
              />
            ))}
            {/* Egg payload */}
            <ellipse cx={100} cy={120} rx={8} ry={6} fill="var(--chart-3)" opacity={0.8} />
            <text x={100} y={137} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">
              r = {radius} cm
            </text>
          </svg>
        </div>
      </Workbench>

      {/* Phase 4 — Test */}
      <Challenge
        title="Drop test"
        goal="Tune the canopy radius until simulated impact speed drops below 6 m/s."
        done={missionClear}
        hint="Each centimetre of radius adds π × 2r of drag area. Try r ≥ 25 cm and watch the speed readout cross 6 m/s."
      >
        <Prose>
          <p>
            Use the prototype workbench above to dial in your radius, then return here. The mission
            clears automatically when your design meets the safety specification.
            Current impact speed: <strong>{speed} m/s</strong> (need &lt; 6 m/s).
          </p>
        </Prose>
      </Challenge>

      {/* Phase 5 — Refine */}
      <Callout title="Refine: what the simulation ignores">
        The terminal-velocity model assumes steady-state, perfectly deployed canopy and calm air.
        In a real drop: (1) canopy fill time means the egg accelerates for ~1 s before drag
        dominates; (2) wind drift can cause a tilted canopy with reduced effective area; (3) thin
        cardboard or plastic bags crumple above ~0.3 m/s lateral load. Your physical prototype
        should test for all three — iterate until the egg survives three consecutive drops.
      </Callout>

      <Quiz
        question="You run the physical drop test and the egg cracks even though your simulation said 5.2 m/s. What is the most likely explanation?"
        options={[
          {
            label: "The formula for terminal velocity is wrong",
            hint: "The formula is well-established — the issue lies in how the model's assumptions match reality.",
          },
          {
            label: "The canopy didn't fully inflate before impact, so actual drag was less than modelled",
            correct: true,
            hint: "Correct. Canopy fill time is a real deployment delay — the egg reaches the ground before terminal velocity is established from a 10 m drop.",
          },
          {
            label: "The egg was heavier than 65 g",
            hint: "Egg mass varies slightly, but a few grams don't explain cracking at a predicted 5.2 m/s — the fill-time gap is far larger.",
          },
          {
            label: "Air density was wrong",
            hint: "At typical lab altitudes, air density varies by < 2 % — not enough to explain a significant speed discrepancy.",
          },
        ]}
      />
    </MethodShell>
  );
}
