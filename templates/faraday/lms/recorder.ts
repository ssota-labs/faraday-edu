// LMS v0 — records the curriculum event stream (the CurriculumHost `onEvent`
// wiring point) to localStorage, and derives progress analytics. Stage 1 is
// single-learner + local; a real roster is aggregated at the platform tier from
// many learners' records. This hook is the seam the platform LMS plugs into.
import { useCallback, useState } from "react";
import type { CurriculumEvent } from "@/faraday/world";

export interface LmsEvent {
  type: CurriculumEvent["type"];
  nodeId?: string;
  at: number; // epoch ms
  xp: number;
  done: number;
}

export interface NodeStat {
  nodeId: string;
  entered: number;
  completed: boolean;
  /** ms between first enter and completion (time on task) */
  timeMs: number | null;
}

export interface LmsSummary {
  events: number;
  xp: number;
  done: number;
  startedAt: number | null;
  lastActiveAt: number | null;
  activeMs: number; // summed enter→complete durations
  perNode: Record<string, NodeStat>;
}

function loadEvents(key: string): LmsEvent[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as LmsEvent[];
  } catch {
    /* unavailable */
  }
  return [];
}

/** Wire the returned `onEvent` into <CurriculumHost onEvent={...} />. */
export function useLmsRecorder(courseId: string) {
  const key = `faraday:lms:${courseId}`;
  const [events, setEvents] = useState<LmsEvent[]>(() => loadEvents(key));

  const onEvent = useCallback(
    (e: CurriculumEvent) => {
      const entry: LmsEvent = {
        type: e.type,
        nodeId: "nodeId" in e ? e.nodeId : undefined,
        at: Date.now(),
        xp: e.progress.xp,
        done: e.progress.completed.length,
      };
      setEvents((prev) => {
        const next = [...prev, entry];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* unavailable */
        }
        return next;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    setEvents([]);
    try {
      localStorage.setItem(key, "[]");
    } catch {
      /* unavailable */
    }
  }, [key]);

  return { onEvent, events, clear };
}

export function summarize(events: LmsEvent[]): LmsSummary {
  const perNode: Record<string, NodeStat> = {};
  for (const e of events) {
    if (!e.nodeId) continue;
    const s = (perNode[e.nodeId] ??= { nodeId: e.nodeId, entered: 0, completed: false, timeMs: null });
    if (e.type === "enter") s.entered = s.entered || e.at;
    if (e.type === "complete") {
      s.completed = true;
      if (s.entered) s.timeMs = e.at - s.entered;
    }
  }
  const last = events[events.length - 1];
  const activeMs = Object.values(perNode).reduce((sum, s) => sum + (s.timeMs ?? 0), 0);
  return {
    events: events.length,
    xp: last?.xp ?? 0,
    done: last?.done ?? 0,
    startedAt: events[0]?.at ?? null,
    lastActiveAt: last?.at ?? null,
    activeMs,
    perNode,
  };
}
