// pack-linear — the baseline WorldPack (non-game). Renders the curriculum as an
// ordered list with lock/progress state. A driven adapter: reads `world`, emits
// onEnter. No progression logic of its own.
import { CheckIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/faraday/lib/utils";
import type { WorldPack } from "../types";

export const linearPack: WorldPack = ({ world, onEnter }) => (
  <ol className="flex flex-col gap-2">
    {world.nodes.map((n, i) => {
      const locked = n.status === "locked";
      const done = n.status === "complete";
      return (
        <li key={n.id}>
          <button
            type="button"
            disabled={locked}
            onClick={() => onEnter(n.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              locked ? "opacity-50" : "hover:bg-accent",
              n.status === "active" && "border-primary",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm tabular-nums",
                done && "border-transparent bg-[var(--chart-3)] text-white",
                n.status === "active" && "border-primary text-primary",
              )}
            >
              {done ? <CheckIcon /> : locked ? <LockSimpleIcon /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{n.title}</span>
              {n.summary ? <span className="block truncate text-xs text-muted-foreground">{n.summary}</span> : null}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);
