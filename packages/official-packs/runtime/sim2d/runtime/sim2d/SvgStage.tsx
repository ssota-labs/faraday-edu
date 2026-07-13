import type { ReactNode } from "react";

export type SvgStageProps = {
  viewBox: string;
  children?: ReactNode;
  className?: string;
  /** Defaults to a generic label if omitted. */
  ariaLabel?: string;
};

/** Workbench-sized SVG host — width 100%, height from viewBox aspect. */
export function SvgStage({ viewBox, children, className, ariaLabel = "Simulation" }: SvgStageProps) {
  return (
    <svg
      viewBox={viewBox}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </svg>
  );
}
