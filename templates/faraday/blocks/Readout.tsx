// <Readout> — a compact label:value chip for LIVE numbers. Use it in a
// Workbench `hud` overlay (or a control panel) instead of stacking <Stat>
// cards under a figure — readouts belong ON the instrument, not after it.
import type { ReactNode } from "react";
import { cn } from "@/faraday/lib/utils";

export function Readout(props: {
  label: string;
  value: ReactNode;
  tone?: "default" | "primary" | "destructive";
}) {
  return (
    <div className="flex items-baseline gap-2 rounded-md border border-border/60 bg-background/75 px-2.5 py-1.5 backdrop-blur-sm">
      <span className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{props.label}</span>
      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          props.tone === "primary" && "text-primary",
          props.tone === "destructive" && "text-destructive",
        )}
      >
        {props.value}
      </span>
    </div>
  );
}
