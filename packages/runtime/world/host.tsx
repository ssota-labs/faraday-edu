"use client";
// CourseHost — locked core shell for a course (lecture graph). Owns progress,
// course-shell↔lecture toggle, HUD, completion, and LMS/tutor event stream.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwiseIcon, CaretLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { Course, CourseEvent, NodeContextValue, WorldPack } from "./types";
import { buildWorldView, isFinished } from "./progression";
import { useCourseState } from "./store";
import { NodeContext } from "./node-context";
import { HudActions, HudBriefing, HudHint, HudStatus } from "./hud";

export function CourseHost(props: {
  course: Course;
  pack: WorldPack;
  storageKey?: string;
  immersive?: boolean;
  hint?: string;
  onEvent?: (e: CourseEvent) => void;
}) {
  const { course, pack } = props;
  const storageKey = props.storageKey ?? `faraday:progress:${course.title}`;
  const { progress, packState, focus, complete, addXp, setPackState, reset } = useCourseState(course, storageKey);
  const [entered, setEntered] = useState<string | null>(null);

  const courseRef = useRef(course);
  useEffect(() => {
    if (courseRef.current !== course) {
      const sameTitle = courseRef.current.title === course.title;
      courseRef.current = course;
      if (import.meta.env?.DEV && sameTitle) {
        console.warn(
          "[CourseHost] course object identity changed but title is the same. " +
            "Keep the course at module scope so progress isn't reset on every render.",
        );
      }
    }
  }, [course]);

  const world = useMemo(() => buildWorldView(course, progress), [course, progress]);
  const emit = props.onEvent ?? (() => {});

  useEffect(() => {
    if (isFinished(course, progress)) emit({ type: "finish", progress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completed.length]);

  const finishNode = (id: string) => {
    complete(id);
    emit({ type: "complete", nodeId: id, progress });
  };
  const doEnter = (id: string) => {
    const n = course.nodes.find((x) => x.id === id);
    if (!n) return;
    setEntered(id);
    emit({ type: "enter", nodeId: id, progress });
    if (n.complete === "onEnter") finishNode(id);
  };
  const doFocus = (id: string) => {
    focus(id);
    emit({ type: "focus", nodeId: id, progress });
  };

  const node = entered ? course.nodes.find((n) => n.id === entered) : undefined;
  const immersive = props.immersive ?? pack.immersive ?? false;

  if (node) {
    const isDone = progress.completed.includes(node.id);
    const ctx: NodeContextValue = {
      nodeId: node.id,
      nodeTitle: node.title,
      exit: () => setEntered(null),
      complete: () => {
        finishNode(node.id);
        setEntered(null);
      },
    };
    if (immersive) {
      return (
        <NodeContext.Provider value={ctx}>
          <div className="fixed inset-0 z-40 bg-background">
            {node.lesson ?? <p className="p-6 text-muted-foreground">This lecture has no content yet.</p>}
          </div>
        </NodeContext.Provider>
      );
    }
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
          {node.lesson ?? <p className="text-muted-foreground">This lecture has no content yet.</p>}
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

  if (immersive) {
    const focused = world.nodes.find((n) => n.id === progress.current);
    return (
      <div className="fixed inset-0 z-40 overflow-hidden bg-background">
        <div className="absolute inset-0">{packEl}</div>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <HudStatus world={world} finished={isFinished(course, progress)} />
            <HudActions onReset={reset} />
          </div>
          <div className="flex items-end justify-between gap-3">
            <HudBriefing node={focused} world={world} onEnter={doEnter} />
            <div className="flex-1" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <HudHint>{props.hint ?? pack.hint ?? "Select an unlocked lecture to enter"}</HudHint>
        </div>
      </div>
    );
  }

  const pct = world.total ? (world.done / world.total) * 100 : 0;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
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

/** @deprecated Use CourseHost with the `course` prop */
export function CurriculumHost(props: {
  curriculum: Course;
  pack: WorldPack;
  storageKey?: string;
  immersive?: boolean;
  hint?: string;
  onEvent?: (e: CourseEvent) => void;
}) {
  const { curriculum, ...rest } = props;
  return <CourseHost course={curriculum} {...rest} />;
}
