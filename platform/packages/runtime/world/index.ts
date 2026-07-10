// Curriculum / world seed — public entry. Import from "@/faraday/world".
// Core (locked): CurriculumHost + progression + state. Packs are swappable
// adapters implementing the WorldPack port (see types.ts, the frozen contract).
export { CurriculumHost } from "./host";
export { useNode } from "./node-context";
export { linearPack } from "./packs/linear";
export { map2dPack } from "./packs/map2d";
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
