// Game HUD — the overlay chrome the immersive world layer draws ON TOP of a
// pack's full-viewport render. Styled as a game status window / HMD readout:
// translucent plates with cut corners, uppercase micro-labels, tabular numbers.
// All theme-token based so it holds in light and dark.
import type { ReactNode } from "react";
import { ArrowCounterClockwiseIcon, LockSimpleIcon, PlayIcon, CheckIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";
import type { WorldNode, WorldView } from "./types";

/** Base plate: translucent, blurred, one cut corner — the HMD panel look. */
export function HudPlate(props: { children: ReactNode; className?: string; cut?: "tl" | "tr" | "bl" | "br" }) {
  const cut = props.cut ?? "br";
  const clip = {
    tl: "[clip-path:polygon(14px_0,100%_0,100%_100%,0_100%,0_14px)]",
    tr: "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]",
    bl: "[clip-path:polygon(0_0,100%_0,100%_100%,14px_100%,0_calc(100%-14px))]",
    br: "[clip-path:polygon(0_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%)]",
  }[cut];
  return (
    <div className={cn("pointer-events-auto border border-border/70 bg-background/75 backdrop-blur-md", clip, props.className)}>
      {props.children}
    </div>
  );
}

export function HudLabel(props: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase", props.className)}>
      {props.children}
    </span>
  );
}

/** One tick per node, filled by completion — a game progress meter, not a page bar. */
function ProgressTicks({ world }: { world: WorldView }) {
  return (
    <div className="flex h-2 items-stretch gap-[3px]" role="img" aria-label={`${world.done} of ${world.total} complete`}>
      {world.nodes.map((n) => (
        <span
          key={n.id}
          className="w-3.5 skew-x-[-18deg]"
          style={{
            background:
              n.status === "complete"
                ? "var(--chart-3)"
                : n.status === "active"
                  ? "var(--primary)"
                  : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

/** Top-left: mission title + progress ticks + XP. */
export function HudStatus({ world, finished }: { world: WorldView; finished: boolean }) {
  return (
    <HudPlate cut="br" className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <HudLabel>{finished ? "All clear" : "Curriculum"}</HudLabel>
        {finished ? <CheckIcon size={12} style={{ color: "var(--chart-3)" }} /> : null}
      </div>
      <span className="max-w-[38ch] truncate text-sm font-semibold tracking-tight">{world.title}</span>
      <div className="flex items-center gap-3">
        <ProgressTicks world={world} />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {world.done}/{world.total}
        </span>
        <span className="font-mono text-xs tabular-nums text-primary">{world.progress.xp} XP</span>
      </div>
    </HudPlate>
  );
}

/** Top-right: minimal system actions. */
export function HudActions({ onReset }: { onReset: () => void }) {
  return (
    <HudPlate cut="bl" className="p-1">
      <Button variant="ghost" size="icon-sm" aria-label="Reset progress" onClick={onReset}>
        <ArrowCounterClockwiseIcon />
      </Button>
    </HudPlate>
  );
}

const STATUS_TEXT: Record<WorldNode["status"], string> = {
  complete: "Cleared",
  active: "Current objective",
  available: "Available",
  locked: "Locked",
};

/** Bottom-left: briefing panel for the focused node — the "mission intel" window. */
export function HudBriefing({
  node,
  world,
  onEnter,
}: {
  node: WorldNode | undefined;
  world: WorldView;
  onEnter: (id: string) => void;
}) {
  if (!node) {
    return (
      <HudPlate cut="tr" className="px-4 py-3">
        <HudLabel>Briefing</HudLabel>
        <p className="mt-1 text-sm text-muted-foreground">Select a node to see its briefing.</p>
      </HudPlate>
    );
  }
  const locked = node.status === "locked";
  const missing = (node.requires ?? []).filter((r) => !world.progress.completed.includes(r));
  const missingTitles = missing.map((id) => world.nodes.find((n) => n.id === id)?.title ?? id);
  return (
    <HudPlate cut="tr" className="flex w-72 flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <HudLabel
          className={cn(node.status === "active" && "text-primary", node.status === "complete" && "text-[var(--chart-3)]")}
        >
          {STATUS_TEXT[node.status]}
        </HudLabel>
        {node.reward?.xp ? <span className="font-mono text-[11px] tabular-nums text-primary">+{node.reward.xp} XP</span> : null}
      </div>
      <span className="text-sm font-semibold tracking-tight">{node.title}</span>
      {node.summary ? <p className="text-xs leading-relaxed text-muted-foreground">{node.summary}</p> : null}
      {locked ? (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <LockSimpleIcon className="mt-0.5 shrink-0" />
          <span>Requires: {missingTitles.join(", ")}</span>
        </p>
      ) : (
        <Button size="sm" className="mt-1 w-fit" onClick={() => onEnter(node.id)}>
          <PlayIcon /> {node.status === "complete" ? "Revisit" : "Enter"}
        </Button>
      )}
    </HudPlate>
  );
}

/** Bottom-center: idle control hint. */
export function HudHint({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
      {children}
    </div>
  );
}
