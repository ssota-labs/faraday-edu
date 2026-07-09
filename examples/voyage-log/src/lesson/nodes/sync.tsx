// Node 6 — Clock synchronisation mission.
//
// The learner has two clocks: a "home" clock that stayed at r → ∞ (rate 1) and
// a "ship" clock that spent `dwell` years hovering at r/r_s = `depth`. After
// the trip, the ship clock is BEHIND by Δ = years·(1 − √(1 − 1/depth)).
//
// The mission is to guess the sync offset that brings them back into agreement
// (within 1% tolerance). This anchors the abstract time-dilation formula from
// node 4 into a concrete "how much drift did the trip cost?" question.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Callout, Quiz, Stat } from "@/faraday/blocks";
import { useNode } from "@/faraday/world";

function fmtHours(hours: number): string {
  const h = Math.floor(Math.abs(hours));
  const m = Math.floor((Math.abs(hours) - h) * 60);
  const sign = hours < 0 ? "−" : "";
  return `${sign}${h}h ${m.toString().padStart(2, "0")}m`;
}

export default function SyncLesson() {
  const { complete } = useNode();
  const [depth, setDepth] = useState(1.4); // r/r_s the ship hovered at
  const [dwell, setDwell] = useState(2); // years spent hovering
  const [offsetHours, setOffsetHours] = useState(0); // learner's sync guess

  const model = useMemo(() => {
    const rate = Math.sqrt(1 - 1 / depth);
    const shipYears = dwell * rate;
    // "Drift" = how much LESS the ship ticked than home, in hours.
    const driftHours = (dwell - shipYears) * 365.25 * 24;
    const residualHours = driftHours - offsetHours;
    const tolerance = Math.max(1, driftHours * 0.01); // 1% or 1 hour, whichever is larger
    const synced = Math.abs(residualHours) <= tolerance;
    return { rate, shipYears, driftHours, residualHours, tolerance, synced };
  }, [depth, dwell, offsetHours]);

  const reset = () => {
    setDepth(1.4);
    setDwell(2);
    setOffsetHours(0);
  };

  return (
    <Lesson
      topic="Voyage Log · Node 6"
      title="Clock Sync — mission finale"
      lead="Your ship spent time hovering deep in a gravity well. Home kept ticking at full rate. Dial in the sync offset that brings the two clocks back into agreement."
    >
      <Prose>
        <p>
          You already know from the last stop that a stationary observer deep in a
          well ticks at rate <code>√(1 − r_s/r)</code>. So after <code>t</code> years
          at depth <code>r/r_s</code>, the ship's clock reads{" "}
          <code>t · √(1 − r_s/r)</code>. The <em>drift</em> — how far behind the ship
          clock is when you rejoin home — is the difference.
        </p>
        <p>
          Your mission: choose <strong>Sync offset</strong> (in hours) so that when
          it's added to the ship clock, both clocks agree to within 1%.
        </p>
      </Prose>

      <Workbench
        title="Mission"
        panelTitle="Voyage parameters"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="The voyage">
              <ParamSlider label="Hover depth (r / r_s)" value={depth} min={1.05} max={4} step={0.05} onChange={setDepth} format={(v) => v.toFixed(2)} />
              <ParamSlider label="Dwell time (home clock)" value={dwell} min={0.25} max={10} step={0.25} onChange={setDwell} format={(v) => `${v.toFixed(2)} yr`} />
            </ControlGroup>
            <ControlGroup label="Your sync offset">
              <ParamSlider label="Offset to add to ship clock" value={offsetHours} min={0} max={40000} step={10} onChange={setOffsetHours} format={(v) => fmtHours(v)} />
            </ControlGroup>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Home clock</p>
            <p className="mt-1 font-mono text-2xl tabular-nums">{dwell.toFixed(3)} yr</p>
            <p className="mt-3 text-xs text-muted-foreground">Rate: 1.000 (far from any well)</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Ship clock</p>
            <p className="mt-1 font-mono text-2xl tabular-nums">
              {model.shipYears.toFixed(3)} yr <span className="text-sm font-normal text-muted-foreground">+ {fmtHours(offsetHours)}</span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Rate: {model.rate.toFixed(4)} (hovered at r/r_s = {depth.toFixed(2)})</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Natural drift" value={fmtHours(model.driftHours)} delta={{ text: "ship is behind by", tone: "secondary" }} />
          <Stat label="Residual after offset" value={fmtHours(model.residualHours)} delta={{ text: `tolerance ±${fmtHours(model.tolerance)}`, tone: "secondary" }} />
          <Stat
            label="Status"
            value={model.synced ? "In sync" : "Drift remains"}
            delta={{ text: model.synced ? "within 1%" : "keep adjusting", tone: model.synced ? "secondary" : "destructive" }}
          />
        </div>

        {model.synced ? (
          <Callout title="Synced">
            Nice — you've reproduced the drift by inverting the Schwarzschild rate
            ratio. Move on to the quiz below to close out the voyage.
          </Callout>
        ) : null}
      </Workbench>

      <Callout title="Why the ship is always the one behind">
        The rate ratio <code>√(1 − r_s/r)</code> is always ≤ 1. A hovering deep
        observer accumulates <em>less</em> proper time than a far one for the same
        coordinate interval. Adjusting <code>depth → ∞</code> or <code>dwell → 0</code>
        both drive drift to zero.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="You hover deeper in the well (smaller r/r_s) for the same amount of home time. What happens to the drift you need to correct?"
        options={[
          { label: "It shrinks.", hint: "Shallower wells shrink drift; deeper wells grow it." },
          { label: "It grows.", correct: true, hint: "Deeper hover ⇒ slower ship clock ⇒ more accumulated drift." },
          { label: "It flips sign — now home is behind.", hint: "Home is at r → ∞ (rate 1) — it's always the faster clock." },
          { label: "Nothing — drift only depends on dwell time.", hint: "Drift depends on BOTH how long AND how deep." },
        ]}
      />
    </Lesson>
  );
}
