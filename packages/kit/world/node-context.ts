// Kept separate from host.tsx so that host.tsx exports only a component — that's
// what lets React Fast Refresh hot-reload the host without a full page reload.
import { createContext, useContext } from "react";
import type { NodeContextValue } from "./types";

export const NodeContext = createContext<NodeContextValue | null>(null);

/** A lesson rendered inside a curriculum can self-complete (e.g. after a Quiz). */
export function useNode(): NodeContextValue {
  const ctx = useContext(NodeContext);
  if (!ctx) throw new Error("useNode() must be called inside a lesson rendered by <CurriculumHost>");
  return ctx;
}
