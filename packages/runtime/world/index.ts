// Curriculum core — public entry. Import from "./".
// Core (locked): CurriculumHost + progression + state, plus the WorldPack port
// (types.ts, the frozen contract) that presentations plug into. `linearPack` (a
// document-style list) ships here as the built-in fallback presentation; richer
// presentations are packs — `map2d` (copy-in: `faraday pack add map2d`) and
// `world3d` (from the `three` pack).
export { CurriculumHost } from "./host";
export { useNode } from "./node-context";
export { linearPack } from "./packs/linear";
export type {
  Curriculum,
  CurriculumNode,
  CurriculumEdge,
  CurriculumEvent,
  NodeContextValue,
  NodeStatus,
  Progress,
  WorldNode,
  WorldPack,
  WorldPackProps,
  WorldView,
} from "./types";
