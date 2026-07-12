// ─────────────────────────────────────────────────────────────────────────────
// World / curriculum seed — THE PORT CONTRACT (frozen).
// This is the spine of the pack ecosystem: a locked, presentation-agnostic core
// (graph + progression + state + LMS/tutor hooks) with swappable WorldPack
// adapters (linear / map2d / world3d / …). Changing this is a breaking change.
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";

// ── Authored content (pack-agnostic) ────────────────────────────────────────

export interface CurriculumNode {
  /** stable id, used in progress + the URL hash */
  id: string;
  title: string;
  /** short blurb for world UIs (map tooltip, list subtitle) */
  summary?: string;
  /** the lesson shown when the learner enters this node. A node with no lesson
   *  is a pure gate/marker (e.g. a section boundary or a boss/assessment stub). */
  lesson?: ReactNode;
  /** ids that must be complete before this node unlocks. [] / omitted = open from start. */
  requires?: string[];
  /** how the node becomes complete:
   *  - "manual"      : the learner presses Finish in the lesson frame (default)
   *  - "onEnter"     : complete as soon as it's entered (markers/cutscenes)
   *  the lesson may also self-complete by calling useNode().complete() (e.g. a passed Quiz). */
  complete?: "manual" | "onEnter";
  /** reward granted on completion */
  reward?: { xp?: number };
  /** pack-specific metadata, OPAQUE to the core (e.g. map coords { x, y }, icon). */
  meta?: Record<string, unknown>;
}

export interface CurriculumEdge {
  from: string;
  to: string;
}

export interface Curriculum {
  title: string;
  nodes: CurriculumNode[];
  /** explicit edges; if omitted the core derives them from each node's `requires`. */
  edges?: CurriculumEdge[];
}

// ── Progress (owned + mutated only by the core) ─────────────────────────────

export type NodeStatus = "locked" | "available" | "active" | "complete";

export interface Progress {
  completed: string[];
  current?: string;
  xp: number;
}

// ── The read-only view the core hands to a pack ─────────────────────────────

export interface WorldNode extends CurriculumNode {
  status: NodeStatus;
}

export interface WorldView {
  title: string;
  nodes: WorldNode[];
  edges: CurriculumEdge[];
  progress: Progress;
  /** completed / total, for HUDs */
  done: number;
  total: number;
}

// ── The PORT a pack implements (a driven adapter) ───────────────────────────
//
// A WorldPack RENDERS the navigable world and EMITS intents. It must not own
// progression logic or mutate progress — it only reads `world` and calls back.

export interface WorldPackProps {
  world: WorldView;
  /** focus/camera to a node without entering its lesson */
  onFocus: (nodeId: string) => void;
  /** enter a node's lesson (only meaningful when status is available/active/complete) */
  onEnter: (nodeId: string) => void;
  /** complete a node via GAMEPLAY without opening a lesson — a skill-check, a boss
   *  beaten, a checkpoint reached. (v2 seam for game-like packs.) */
  onComplete: (nodeId: string) => void;
  /** award ad-hoc XP (collectibles, bonuses). (v2 seam.) */
  onReward: (xp: number) => void;
  /** OPAQUE, pack-defined durable state the core persists but never interprets —
   *  avatar position, inventory, quest flags, timers. `null` until the pack sets it.
   *  This is what lets an advanced (game) pack keep real state across the
   *  world↔lesson toggle without the core knowing what a "player" is. (v2 seam.) */
  packState: unknown;
  setPackState: (state: unknown) => void;
}

export type WorldPack = ((props: WorldPackProps) => ReactNode) & {
  /** Game-like packs set this (map2d/world3d/rpg do). The host then mounts the
   *  world as a full-viewport immersive layer with a game HUD overlay instead
   *  of a document header, and the pack's render fills that layer (additive to
   *  the port contract — packs that omit it render inline, doc-style). */
  immersive?: boolean;
  /** Default idle control hint for the immersive HUD ("WASD to move…"). The
   *  author can override per-host via <CurriculumHost hint>. */
  hint?: string;
};

// ── Integration hook: events out to LMS / Tutor AI ──────────────────────────
//
// The host emits these; LMS (progress rollups) and the Tutor AI ("where is the
// learner, what have they done") subscribe. Keeping the contract here is what
// lets Stage 1 close the LMS + tutor layers horizontally, even at v0.

export type CurriculumEvent =
  | { type: "focus"; nodeId: string; progress: Progress }
  | { type: "enter"; nodeId: string; progress: Progress }
  | { type: "complete"; nodeId: string; progress: Progress }
  | { type: "finish"; progress: Progress }; // whole curriculum complete

/** Context a lesson can pull to self-complete (e.g. after a Quiz is passed). */
export interface NodeContextValue {
  nodeId: string;
  complete: () => void;
}
