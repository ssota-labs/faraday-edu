"use client";
// CurriculumHost — the locked core shell. Owns progress, the world↔lesson toggle,
// the HUD, completion wiring, and the event stream that LMS + Tutor AI subscribe
// to. It hands a read-only WorldView to the chosen pack and consumes the pack's
// navigation intents. Packs never touch progression or state.
//
// Two world chromes:
//  - IMMERSIVE (pack.immersive, e.g. map2d/world3d/rpg): the world mounts as a
//    full-viewport game screen — the pack fills the layer and the host overlays
//    a game HUD (status plate, briefing panel, hint). No document chrome.
//  - INLINE (linearPack etc.): the world renders doc-style in the reading column.
// Entering a node always returns to the textbook: lessons render doc-style.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwiseIcon, CaretLeftIcon, CheckIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { Badge } from "@/faraday/ui/badge";
import type { Curriculum, CurriculumEvent, NodeContextValue, WorldPack } from "./types";
import { buildWorldView, isFinished } from "./progression";
import { useCurriculumState } from "./store";
import { NodeContext } from "./node-context";
import { HudActions, HudBriefing, HudHint, HudStatus } from "./hud";

export function CurriculumHost(props: {
  curriculum: Curriculum;
  pack: WorldPack;
  storageKey?: string;
  /** Override the pack's default chrome (e.g. force a game pack inline when
   *  embedding a small map inside a course page). */
  immersive?: boolean;
  /** Override the idle control hint shown in the immersive HUD. */
  hint?: string;
  onEvent?: (e: CurriculumEvent) => void;
}) {
  const { curriculum, pack } = props;
  const storageKey = props.storageKey ?? `faraday:progress:${curriculum.title}`;
  const { progress, packState, focus, complete, addXp, setPackState, reset } = useCurriculumState(
    curriculum,
    storageKey,
  );
  const [entered, setEntered] = useState<string | null>(null);

  // Progress is keyed on curriculum identity. Recreating the object every render
  // (e.g. defining `const curriculum = {…}` inside the component) wipes progress.
  // Keep it at module scope — see docs/authoring.md. Warn once in dev if the
  // identity flips while the title stays the same (the classic footgun).
  const curriculumRef = useRef(curriculum);
  useEffect(() => {
    if (curriculumRef.current !== curriculum) {
      const sameTitle = curriculumRef.current.title === curriculum.title;
      curriculumRef.current = curriculum;
      if (import.meta.env?.DEV && sameTitle) {
        console.warn(
          "[CurriculumHost] curriculum object identity changed but title is the same. " +
            "Keep the curriculum at module scope so progress isn't reset on every render.",
        );
      }
    }
  }, [curriculum]);

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
  const immersive = props.immersive ?? pack.immersive ?? false;

  // ── lesson view (always doc-style: the world is a game, the node is a textbook) ──
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
            {immersive ? <MapTrifoldIcon /> : <CaretLeftIcon />} {immersive ? "Map" : "Back"}
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

  const Pack = pack;
  const packEl = (
    <Pack
      world={world}
      onFocus={doFocus}
      onEnter={doEnter}
      onComplete={finishNode}
      onReward={addXp}
      packState={packState}
      setPackState={setPackState}
    />
  );

  // ── immersive world view: full-bleed game screen + HUD overlay ──
  if (immersive) {
    const focused = world.nodes.find((n) => n.id === progress.current);
    return (
      <div className="fixed inset-0 z-40 overflow-hidden bg-background">
        <div className="absolute inset-0">{packEl}</div>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <HudStatus world={world} finished={isFinished(curriculum, progress)} />
            <HudActions onReset={reset} />
          </div>
          <div className="flex items-end justify-between gap-3">
            <HudBriefing node={focused} world={world} onEnter={doEnter} />
            <div className="flex-1" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <HudHint>{props.hint ?? pack.hint ?? "Select an unlocked node to enter its lesson"}</HudHint>
        </div>
      </div>
    );
  }

  // ── inline world view (doc-style packs, e.g. linear) ──
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
      {packEl}
    </div>
  );
}
