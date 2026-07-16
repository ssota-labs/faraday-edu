// LMS v0 — records a small host-independent learning event stream to
// localStorage and derives progress analytics.
import { useCallback, useState } from "react";

export interface LearningEvent {
  type: "enter" | "complete" | "progress" | "reset";
  nodeId?: string;
  progress: {
    xp: number;
    completed: string[];
  };
}

export interface LmsEvent {
  type: LearningEvent["type"];
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

/** Send host learning events to the returned `onEvent` callback. */
export function useLmsRecorder(courseId: string) {
  const key = `faraday:lms:${courseId}`;
  const [events, setEvents] = useState<LmsEvent[]>(() => loadEvents(key));

  const onEvent = useCallback(
    (e: LearningEvent) => {
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
