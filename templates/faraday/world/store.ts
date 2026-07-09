// Progress persistence. Stage 1 = localStorage (per-browser resume). The store is
// behind this hook so the platform phase can swap it for a tenant DB without
// touching the core or packs (a driven-adapter seam).
import { useCallback, useState } from "react";
import type { Curriculum, Progress } from "./types";
import { initialProgress, markComplete } from "./progression";

function load(key: string, c: Curriculum): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* storage unavailable / malformed */
  }
  return initialProgress(c);
}

function save(key: string, p: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

/** Pass a STABLE `curriculum` (module-level or useMemo'd) and a storage key. */
export function useProgress(curriculum: Curriculum, storageKey: string) {
  const [progress, setProgress] = useState<Progress>(() => load(storageKey, curriculum));

  const commit = useCallback(
    (updater: (p: Progress) => Progress) =>
      setProgress((prev) => {
        const next = updater(prev);
        save(storageKey, next);
        return next;
      }),
    [storageKey],
  );

  const focus = useCallback((nodeId: string) => commit((p) => ({ ...p, current: nodeId })), [commit]);
  const complete = useCallback(
    (nodeId: string) => commit((p) => markComplete(nodeId, curriculum, p)),
    [commit, curriculum],
  );
  const reset = useCallback(() => commit(() => initialProgress(curriculum)), [commit, curriculum]);

  return { progress, focus, complete, reset };
}
