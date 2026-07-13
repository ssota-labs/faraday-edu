import { useState } from "react";
import {
  Prose,
  Quiz,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  Callout,
} from "@faraday-academy/runtime/blocks";
import { MethodShell } from "../_shared/MethodShell";

// Stability model: wider base → more stable; steeper angle beyond 60° tips the stand forward.
// Score 0-100. Max score at baseWidth≈14, angle≈65.
function stabilityScore(baseWidth: number, angle: number): number {
  const baseScore = Math.min(baseWidth / 20, 1); // wider = better, caps at 20 cm
  const anglePenalty = angle > 75 ? (angle - 75) * 2 : angle < 55 ? (55 - angle) * 1.5 : 0;
  return Math.max(0, Math.round((baseScore * 100 - anglePenalty)));
}

function heightAt(angle: number): number {
  // Approximate screen height above desk for a 25 cm arm at given angle (degrees from horizontal)
  const rad = (angle * Math.PI) / 180;
  return Math.round(25 * Math.sin(rad));
}

export default function ProjectChallengeLearning() {
  const [baseWidth, setBaseWidth] = useState(10);
  const [angle, setAngle] = useState(60);

  const score = stabilityScore(baseWidth, angle);
  const screenHeight = heightAt(angle);
  const meetsHeight = screenHeight >= 14; // requirement: ≥ 14 cm above desk
  const meetsStability = score >= 70;     // requirement: stability score ≥ 70

  return (
    <MethodShell
      method="Project-Based Learning (PjBL)"
      discipline="Engineering Design / Physics"
      topic="Forces & Structures"
      title="Design a cardboard phone stand for tablet recording"
      lead="Teams build a real deliverable — a cardboard stand sturdy enough to hold a tablet at recording height — learning structural principles through the build, not before it."
      phases={["Brief", "Plan", "Build", "Verify"]}
      families={["Prose", "Quiz", "Workbench + ParamSlider + Readout", "Quiz"]}
    >
      {/* Phase 1 — Brief */}
      <Prose heading="Project brief">
        <p>
          Your school's media club needs cheap, portable stands to hold tablets steady during
          podcast recordings. The budget is limited to <strong>cardboard and hot glue</strong>.
          Your team must design and prototype one stand that meets all three requirements:
        </p>
        <ul>
          <li>Screen height above desk: <strong>≥ 14 cm</strong> (avoids chin-angle shots)</li>
          <li>Stability score: <strong>≥ 70 / 100</strong> (survives a desk tap without tipping)</li>
          <li>Materials: cardboard only — no tape on external faces, glue joints only</li>
        </ul>
        <p>
          You will iterate in the simulation below, then build the winning design in cardboard.
        </p>
      </Prose>

      {/* Phase 2 — Plan */}
      <Quiz
        question="Before cutting cardboard, what structural principle most directly controls whether a tall stand tips over when nudged?"
        options={[
          {
            label: "The colour of the cardboard surface",
            hint: "Aesthetics don't affect structural stability — focus on geometry.",
          },
          {
            label: "The width of the base relative to the height of the centre of mass",
            correct: true,
            hint: "Correct. A wider base lowers the tipping threshold — the centre of mass must move outside the base footprint for the stand to topple.",
          },
          {
            label: "The thickness of the back support arm",
            hint: "Arm thickness affects rigidity under load, but it's the base-to-height ratio that determines tip resistance.",
          },
          {
            label: "The brand of glue used",
            hint: "Joint strength matters for load-bearing, but it's geometry — not adhesive brand — that resists tipping.",
          },
        ]}
      />

      {/* Phase 3 — Build (simulation workbench) */}
      <Workbench
        title="Stand geometry simulator"
        panelTitle="Design parameters"
        controls={
          <>
            <ControlGroup label="Base">
              <ParamSlider
                label="Base width (cm)"
                value={baseWidth}
                min={6}
                max={20}
                step={1}
                onChange={setBaseWidth}
              />
            </ControlGroup>
            <ControlGroup label="Support arm">
              <ParamSlider
                label="Lean angle (°)"
                value={angle}
                min={40}
                max={85}
                step={1}
                onChange={setAngle}
              />
            </ControlGroup>
          </>
        }
      >
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Readout
              label="Stability score"
              value={`${score} / 100`}
              tone={meetsStability ? "primary" : "destructive"}
            />
            <Readout
              label="Screen height"
              value={`${screenHeight} cm`}
              tone={meetsHeight ? "primary" : "destructive"}
            />
            <Readout label="Base width" value={`${baseWidth} cm`} />
            <Readout label="Arm angle" value={`${angle}°`} />
          </div>

          {/* Schematic side-view */}
          <svg
            viewBox="0 0 220 160"
            className="w-full max-w-xs"
            role="img"
            aria-label="Stand side-view schematic"
          >
            {/* Desk surface */}
            <line x1="10" y1="140" x2="210" y2="140" stroke="var(--border)" strokeWidth="2" />
            {/* Base */}
            <rect
              x={110 - baseWidth * 3}
              y={132}
              width={baseWidth * 6}
              height={8}
              rx={2}
              fill="var(--chart-3)"
              opacity={0.7}
            />
            {/* Arm */}
            {(() => {
              const rad = (angle * Math.PI) / 180;
              const armLen = 60;
              const x2 = 110 + armLen * Math.cos(rad) * 0.6;
              const y2 = 132 - armLen * Math.sin(rad);
              return (
                <line
                  x1={110}
                  y1={132}
                  x2={x2}
                  y2={y2}
                  stroke="var(--primary)"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })()}
            <text x={110} y={155} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
              base {baseWidth} cm · {angle}°
            </text>
          </svg>

          <p className="text-xs text-muted-foreground text-center">
            {meetsHeight && meetsStability
              ? "Design meets all requirements — ready to cut cardboard!"
              : !meetsHeight
              ? "Screen height too low — increase the arm angle."
              : "Stability too low — widen the base."}
          </p>
        </div>
      </Workbench>

      {/* Phase 4 — Verify */}
      <Quiz
        question="After building the physical prototype, the stand tips when you tap the desk firmly. According to the rubric, which adjustment most directly improves tipping resistance?"
        options={[
          {
            label: "Sand the cardboard surface for a better grip",
            hint: "Surface friction helps slightly on smooth desks, but does not address the root cause.",
          },
          {
            label: "Increase the base width so the centre of mass stays over the footprint under vibration",
            correct: true,
            hint: "Exactly. A wider base raises the tipping threshold — more lateral force is needed to push the centre of mass beyond the base edge.",
          },
          {
            label: "Use a thicker back panel to stiffen the arm",
            hint: "Stiffness reduces flex but doesn't prevent tipping — the base geometry is the lever here.",
          },
          {
            label: "Add decorative cut-outs to reduce weight",
            hint: "Lightening the top can marginally help, but widening the base is the dominant fix.",
          },
        ]}
      />

      <Callout title="PjBL in one sentence">
        The deliverable is real — students learn structural principles because the stand must
        actually stand, not because the lesson says so.
      </Callout>
    </MethodShell>
  );
}
