"use client";
// CurriculumHost — the locked core shell. Owns progress, the world↔lesson toggle,
// the standard HUD, completion wiring, and the event stream that LMS + Tutor AI
// subscribe to. It hands a read-only WorldView to the chosen pack and consumes
// the pack's navigation intents. Packs never touch progression or state.
import { useEffect, useMemo, useState } from "react";
import { ArrowCounterClockwiseIcon, CaretLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { Badge } from "@/faraday/ui/badge";
import type { Curriculum, CurriculumEvent, NodeContextValue, WorldPack } from "./types";
import { buildWorldView, isFinished } from "./progression";
import { useCurriculumState } from "./store";
import { NodeContext } from "./node-context";

export function CurriculumHost(props: {
  curriculum: Curriculum;
  pack: WorldPack;
  storageKey?: string;
  onEvent?: (e: CurriculumEvent) => void;
}) {
  const { curriculum, pack } = props;
  const storageKey = props.storageKey ?? `faraday:progress:${curriculum.title}`;
  const { progress, packState, focus, complete, addXp, setPackState, reset } = useCurriculumState(
    curriculum,
    storageKey,
  );
  const [entered, setEntered] = useState<string | null>(null);

  const world = useMemo(() => buildWorldView(curriculum, progress), [curriculum, progress]);
  const emit = props.onEvent ?? (() => {});

  // whole-curriculum finish event
  useEffect(() => {
    if (isFinished(curriculum, progress)) emit({ type: "finish", progress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completed.length]);

  const finishNode = (id: string) => {
    complete(id);
    emit({ type: "complete", nodeId: id, progress });
  };
  const doEnter = (id: string) => {
    const n = curriculum.nodes.find((x) => x.id === id);
    if (!n) return;
    setEntered(id);
    emit({ type: "enter", nodeId: id, progress });
    if (n.complete === "onEnter") finishNode(id);
  };
  const doFocus = (id: string) => {
    focus(id);
    emit({ type: "focus", nodeId: id, progress });
  };

  const node = entered ? curriculum.nodes.find((n) => n.id === entered) : undefined;

  // ── lesson view ──
  if (node) {
    const isDone = progress.completed.includes(node.id);
    const ctx: NodeContextValue = {
      nodeId: node.id,
      complete: () => {
        finishNode(node.id);
        setEntered(null);
      },
    };
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2 border-b pb-3">
          <Button variant="ghost" size="sm" onClick={() => setEntered(null)}>
            <CaretLeftIcon /> Back
          </Button>
          <span className="truncate text-sm font-medium text-muted-foreground">{node.title}</span>
          <Button size="sm" disabled={isDone} onClick={() => { finishNode(node.id); setEntered(null); }}>
            {isDone ? "Done" : "Finish"} <CheckIcon />
          </Button>
        </div>
        <NodeContext.Provider value={ctx}>
          {node.lesson ?? <p className="text-muted-foreground">This stop has no lesson yet.</p>}
        </NodeContext.Provider>
      </div>
    );
  }

  // ── world view + standard HUD ──
  const Pack = pack;
  const pct = world.total ? (world.done / world.total) * 100 : 0;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{curriculum.title}</h1>
          <Button variant="ghost" size="icon-sm" aria-label="Reset progress" onClick={reset}>
            <ArrowCounterClockwiseIcon />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">
            {world.done}/{world.total}
          </span>
          {progress.xp > 0 ? <Badge variant="secondary">{progress.xp} XP</Badge> : null}
        </div>
      </header>
      <Pack
        world={world}
        onFocus={doFocus}
        onEnter={doEnter}
        onComplete={finishNode}
        onReward={addXp}
        packState={packState}
        setPackState={setPackState}
      />
    </div>
  );
}
