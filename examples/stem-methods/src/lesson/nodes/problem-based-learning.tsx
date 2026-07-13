import { useState } from "react";
import {
  Prose,
  Quiz,
  Reveal,
  Challenge,
  Callout,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
} from "@faraday-academy/runtime/blocks";
import { MethodShell } from "../_shared/MethodShell";

// Simulated signal strength: higher AP count + better placement → stronger signal
function signalStrength(apCount: number, placement: number): number {
  // placement 1-5 represents corner → center-corridor. Center (3) is best for dead zones.
  const placementBonus = placement === 3 ? 1.2 : placement === 2 || placement === 4 ? 1.0 : 0.75;
  return Math.min(100, Math.round(apCount * 22 * placementBonus));
}

export default function ProblemBasedLearning() {
  const [apCount, setApCount] = useState(2);
  const [placement, setPlacement] = useState(1);

  const signal = signalStrength(apCount, placement);
  const deadZoneFixed = signal >= 85;

  const placementLabels = ["Corner", "Near wall", "Corridor center", "Near stacks", "Far corner"];

  return (
    <MethodShell
      method="Problem-Based Learning (PBL)"
      discipline="Networking / Physics"
      topic="Wireless Networks"
      title="Fix the library Wi-Fi dead zone"
      lead="Students drive their own learning by tackling a real infrastructure problem — a dead zone in the campus library — before they know the theory."
      phases={["Problem", "Idea generation", "Self-study", "Apply", "Debrief"]}
      families={["narrative", "Quiz", "Reveal", "Challenge", "Prose"]}
    >
      {/* Phase 1 — Problem */}
      <Prose heading="The problem">
        <p>
          It's finals week. Students flock to the north wing of the library — but Wi-Fi bars drop to
          zero past the reference stacks. The IT helpdesk has logged 47 complaints this semester. You
          are on the network committee. <strong>Why does the signal die, and where should new access
          points go?</strong>
        </p>
        <p>
          Before you can fix it, you need to figure out what you don't know.
        </p>
      </Prose>

      {/* Phase 2 — Idea generation */}
      <Quiz
        question="Your first step is to identify what you need to learn. Which question is most critical to investigate before proposing a solution?"
        options={[
          {
            label: "How much does a new access point cost?",
            hint: "Budget matters later, but it won't tell you why the signal drops — understand the physics first.",
          },
          {
            label: "How does distance and obstruction attenuate a Wi-Fi signal?",
            correct: true,
            hint: "Exactly. Path-loss and obstruction attenuation are the root cause — understanding them lets you place APs where they'll do the most good.",
          },
          {
            label: "Which students complain the most?",
            hint: "Knowing who is affected doesn't tell you why or how to fix the underlying physics.",
          },
          {
            label: "What brand of router does the library use?",
            hint: "Vendor details are secondary — the dead zone would exist with any brand given the same layout.",
          },
        ]}
      />

      {/* Phase 3 — Self-study */}
      <Reveal label="Key concept: path-loss and the inverse-square law">
        <p>
          In free space, signal power falls off with the <strong>square of distance</strong> (the
          inverse-square law). Inside a building, walls, metal shelving, and floors add extra
          attenuation on top of that — each thick concrete wall can subtract 10–15 dB. A rule of
          thumb: every 6 dB loss halves the effective range. The library's reference stacks are dense
          metal shelving — each row acts like a partial wall.
        </p>
        <p>
          Access-point placement strategy: place APs to minimize the number of obstructions between
          any user and the nearest AP, and keep inter-AP distance below the attenuation limit.
        </p>
      </Reveal>

      {/* Phase 4 — Apply */}
      <Challenge
        title="AP Placement Mission"
        goal="Achieve ≥ 85 % signal coverage across the north wing by adjusting the number and position of access points."
        done={deadZoneFixed}
        hint="Try 'Corridor center' placement — it minimises the number of shelving rows between users and the AP. Adding a second AP helps but placement still matters."
      >
        <Workbench
          title="Library floor plan (north wing)"
          panelTitle="AP Configuration"
          controls={
            <>
              <ControlGroup label="Access points">
                <ParamSlider
                  label="AP count"
                  value={apCount}
                  min={1}
                  max={4}
                  step={1}
                  onChange={setApCount}
                />
              </ControlGroup>
              <ControlGroup label="Primary AP position">
                <ParamSlider
                  label="Position (1=corner · 3=corridor · 5=far)"
                  value={placement}
                  min={1}
                  max={5}
                  step={1}
                  onChange={setPlacement}
                />
              </ControlGroup>
            </>
          }
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex gap-6">
              <Readout
                label="Signal coverage"
                value={`${signal} %`}
                tone={deadZoneFixed ? "primary" : signal >= 60 ? "default" : "destructive"}
              />
              <Readout label="AP placement" value={placementLabels[placement - 1]} />
              <Readout label="APs deployed" value={apCount} />
            </div>
            <div
              className="relative w-full max-w-md rounded border-2 border-border bg-muted/30"
              style={{ height: 160 }}
              aria-label="Library north-wing diagram"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center px-4">
                  North wing — reference stacks (metal shelving rows indicated by dashed lines)
                  <br />
                  Coverage: <strong>{signal} %</strong>
                  {deadZoneFixed ? " · Dead zone eliminated ✓" : " · Dead zone persists"}
                </p>
              </div>
            </div>
          </div>
        </Workbench>
      </Challenge>

      {/* Phase 5 — Debrief */}
      <Prose heading="Debrief: what did you actually learn?">
        <p>
          You started without knowing the relevant physics — and that was the point. PBL drives
          self-directed learning: you identified what you didn't know (path-loss), acquired it
          (inverse-square law + obstruction dB), and applied it to a real constraint (≥ 85 % coverage).
        </p>
        <p>
          Reflect: What would you investigate next if the budget allowed only one additional AP?
          How would you measure real-world coverage to validate your placement?
        </p>
      </Prose>

      <Callout title="PBL in one sentence">
        The problem comes first — theory is pulled in on demand, not pushed up front.
      </Callout>
    </MethodShell>
  );
}
