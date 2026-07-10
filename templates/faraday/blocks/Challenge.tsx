// <Challenge> — a mission-style PERFORMANCE check: the learner clears it by
// DOING something in the interactive (hit the target, balance the system,
// reach the state), not by answering about it. You own the win condition:
// compute `done` from your sim state and the mission banner + clear state are
// handled here. The strongest assessment when the outcome verb is "do/tune/
// build/achieve" (see assessment.md) — and the most game-like.
//
//   <Challenge
//     goal={<>Land the ball within <TeX>{String.raw`\pm 3\,\text{m}`}</TeX> of the 80 m flag.</>}
//     done={landed && Math.abs(landingX - 80) <= 3}
//     hint="Range rises then falls with angle — bracket the flag from both sides."
//     onDone={complete}
//   >
//     <LaunchPad … />   {/* the same interactive, now with a target flag */}
//   </Challenge>
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FlagCheckeredIcon, LightbulbIcon } from "@phosphor-icons/react";
import { cn } from "@/faraday/lib/utils";
import { celebrate } from "./celebrate";

export function Challenge(props: {
  /** The win condition, stated as a goal the learner can act on. */
  goal: ReactNode;
  /** Author-computed win condition from the sim state. Once it flips true the
   *  mission is cleared (latched — brief overshoots don't un-clear it). */
  done: boolean;
  /** Short mission label. Default "Mission". */
  title?: string;
  /** Feed-forward help behind a "stuck?" toggle — guide, don't solve. */
  hint?: ReactNode;
  /** Fires ONCE when the mission is first cleared — wire to complete(). */
  onDone?: () => void;
  /** The interactive the mission is played in. */
  children: ReactNode;
}) {
  const [cleared, setCleared] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const fired = useRef(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (props.done && !fired.current) {
      fired.current = true;
      setCleared(true);
      celebrate(rootRef.current);
      props.onDone?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.done]);

  return (
    <section
      ref={rootRef}
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5 transition-colors",
        cleared ? "border-[var(--chart-3)]/60 bg-[var(--chart-3)]/5" : "border-primary/40 bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "text-[10px] font-medium tracking-[0.22em] uppercase",
              cleared ? "text-[var(--chart-3)]" : "text-primary",
            )}
          >
            {props.title ?? "Mission"} {cleared ? "· clear" : ""}
          </span>
          <div className="flex items-start gap-2 font-medium">
            <FlagCheckeredIcon className={cn("mt-1 shrink-0", cleared && "text-[var(--chart-3)]")} />
            <span>{props.goal}</span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase",
            cleared
              ? "border-[var(--chart-3)]/50 text-[var(--chart-3)]"
              : "border-border text-muted-foreground",
          )}
        >
          {cleared ? "Clear ✓" : "In progress"}
        </span>
      </div>

      {props.children}

      {!cleared && props.hint ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LightbulbIcon /> {showHint ? "Hide hint" : "Stuck? Get a hint"}
          </button>
          {showHint ? <p className="text-sm text-muted-foreground">{props.hint}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
