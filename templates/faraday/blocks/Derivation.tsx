// <Derivation> — a formula DERIVED live, not decreed. Steps reveal one line at
// a time (like a teacher at the board): each line is a TeX equation plus the
// justification for the move ("substitute T", "divide by m", "sin doubles").
// The learner paces it with Next step; the newest line slides in highlighted.
// quality-bar rule: a lesson's central formula must arrive as the LAST line of
// one of these (or an equivalent stepped walk) — a bare boxed result fails.
//
//   <Derivation
//     title="Where the range formula comes from"
//     steps={[
//       { tex: String.raw`R = v_x\,T`, note: "range = horizontal speed × time aloft" },
//       { tex: String.raw`T = \frac{2v_0\sin\theta}{g}`, note: "vertical motion: up and back down" },
//       { tex: String.raw`R = v_0\cos\theta\cdot\frac{2v_0\sin\theta}{g}`, note: "substitute both" },
//       { tex: String.raw`R = \frac{v_0^2\sin 2\theta}{g}`, note: "2 sinθ cosθ = sin 2θ" },
//     ]}
//   />
import { useState } from "react";
import { CaretDownIcon, ArrowCounterClockwiseIcon, ListIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";
import { TeX } from "./TeX";

export interface DerivationStep {
  /** The equation at this point of the derivation (TeX source). */
  tex: string;
  /** WHY this line follows from the previous one — the move being made. */
  note?: string;
}

export function Derivation(props: {
  steps: DerivationStep[];
  /** What is being derived — shown as the section's micro-label. */
  title?: string;
  /** Start fully expanded (e.g. when revisiting). Default: one line. */
  defaultOpen?: boolean;
}) {
  const { steps } = props;
  const [shown, setShown] = useState(props.defaultOpen ? steps.length : 1);
  const done = shown >= steps.length;

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      {props.title ? (
        <span className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          {props.title}
        </span>
      ) : null}

      <ol className="flex flex-col" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => {
          const newest = i === shown - 1 && !props.defaultOpen;
          const last = i === steps.length - 1;
          return (
            <li
              key={i}
              className={cn(
                "grid grid-cols-1 items-center gap-x-6 gap-y-1 rounded-lg border-l-2 py-2 pl-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]",
                newest
                  ? "animate-in fade-in slide-in-from-bottom-2 border-primary bg-primary/5 duration-300"
                  : "border-transparent",
                last && done && "border-[var(--chart-3)] bg-[var(--chart-3)]/5",
              )}
            >
              <TeX
                block
                stream={newest}
                className="my-0 text-left [&_.katex-display]:my-0 [&_.katex-display]:text-left"
              >
                {s.tex}
              </TeX>
              {s.note ? (
                <span className={cn("text-xs", newest ? "text-foreground/80" : "text-muted-foreground")}>
                  {i > 0 ? "↳ " : ""}
                  {s.note}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-2">
        {!done ? (
          <>
            <Button size="sm" onClick={() => setShown((n) => Math.min(steps.length, n + 1))}>
              <CaretDownIcon /> Next step
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {shown}/{steps.length}
            </span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => setShown(steps.length)}>
              <ListIcon /> Show all
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">Derivation complete — the last line is the result.</span>
            <div className="flex-1" />
            <Button variant="ghost" size="icon-xs" aria-label="Restart derivation" onClick={() => setShown(1)}>
              <ArrowCounterClockwiseIcon />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
