import { useCallback, useState } from "react";
import type { Course, Progress } from "./types";
import { initialProgress, markComplete } from "./progression";

interface Saved {
  progress: Progress;
  packState: unknown;
}

function load(key: string, c: Course): Saved {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Saved>;
      return { progress: s.progress ?? initialProgress(c), packState: s.packState ?? null };
    }
  } catch {
    /* storage unavailable / malformed */
  }
  return { progress: initialProgress(c), packState: null };
}

function save(key: string, s: Saved) {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

/** Pass a STABLE `course` (module-level or useMemo'd) and a storage key. */
export function useCourseState(course: Course, storageKey: string) {
  const [state, setState] = useState<Saved>(() => load(storageKey, course));

  const commit = useCallback(
    (updater: (s: Saved) => Saved) =>
      setState((prev) => {
        const next = updater(prev);
        save(storageKey, next);
        return next;
      }),
    [storageKey],
  );

  const focus = useCallback(
    (nodeId: string) => commit((s) => ({ ...s, progress: { ...s.progress, current: nodeId } })),
    [commit],
  );
  const complete = useCallback(
    (nodeId: string) => commit((s) => ({ ...s, progress: markComplete(nodeId, course, s.progress) })),
    [commit, course],
  );
  const addXp = useCallback(
    (xp: number) => commit((s) => ({ ...s, progress: { ...s.progress, xp: s.progress.xp + xp } })),
    [commit],
  );
  const setPackState = useCallback((packState: unknown) => commit((s) => ({ ...s, packState })), [commit]);
  const reset = useCallback(
    () => commit(() => ({ progress: initialProgress(course), packState: null })),
    [commit, course],
  );

  return { progress: state.progress, packState: state.packState, focus, complete, addXp, setPackState, reset };
}

/** @deprecated Use useCourseState */
export const useCurriculumState = useCourseState;
