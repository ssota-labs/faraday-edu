// Progress + pack-state persistence. Stage 1 = localStorage (per-browser resume).
// The store is behind this hook so the platform phase can swap it for a tenant DB
// without touching the core or packs (a driven-adapter seam). It persists two
// slices: `progress` (owned by the core) and `packState` (opaque, owned by the
// pack — avatar position, inventory, etc.).
import { useCallback, useState } from "react";
import type { Curriculum, Progress } from "./types";
import { initialProgress, markComplete } from "./progression";

interface Saved {
  progress: Progress;
  packState: unknown;
}

function load(key: string, c: Curriculum): Saved {
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

/** Pass a STABLE `curriculum` (module-level or useMemo'd) and a storage key. */
export function useCurriculumState(curriculum: Curriculum, storageKey: string) {
  const [state, setState] = useState<Saved>(() => load(storageKey, curriculum));

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
    (nodeId: string) => commit((s) => ({ ...s, progress: markComplete(nodeId, curriculum, s.progress) })),
    [commit, curriculum],
  );
  const addXp = useCallback(
    (xp: number) => commit((s) => ({ ...s, progress: { ...s.progress, xp: s.progress.xp + xp } })),
    [commit],
  );
  const setPackState = useCallback((packState: unknown) => commit((s) => ({ ...s, packState })), [commit]);
  const reset = useCallback(
    () => commit(() => ({ progress: initialProgress(curriculum), packState: null })),
    [commit, curriculum],
  );

  return { progress: state.progress, packState: state.packState, focus, complete, addXp, setPackState, reset };
}
