// ─────────────────────────────────────────────────────────────────────────────
// Course core — THE PORT CONTRACT (frozen).
// Spine of the pack ecosystem: presentation-agnostic core (graph + progression +
// state + LMS/tutor hooks) with swappable WorldPack adapters (course shells).
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";

// ── Authored content (pack-agnostic) ────────────────────────────────────────

export interface LectureNode {
  /** stable id, used in progress + the URL hash */
  id: string;
  title: string;
  /** short blurb for course-shell UIs (map tooltip, list subtitle) */
  summary?: string;
  /** the lecture shown when the learner enters this node */
  lesson?: ReactNode;
  /** ids that must be complete before this lecture unlocks */
  requires?: string[];
  complete?: "manual" | "onEnter";
  reward?: { xp?: number };
  meta?: Record<string, unknown>;
}

export interface CourseEdge {
  from: string;
  to: string;
}

/** A course: an ordered/graph of lectures with unlock rules. */
export interface Course {
  title: string;
  nodes: LectureNode[];
  edges?: CourseEdge[];
}

// ── Progress (owned + mutated only by the core) ─────────────────────────────

export type NodeStatus = "locked" | "available" | "active" | "complete";

export interface Progress {
  completed: string[];
  current?: string;
  xp: number;
}

// ── The read-only view the core hands to a pack ─────────────────────────────

export interface WorldNode extends LectureNode {
  status: NodeStatus;
}

export interface WorldView {
  title: string;
  nodes: WorldNode[];
  edges: CourseEdge[];
  progress: Progress;
  done: number;
  total: number;
}

export interface WorldPackProps {
  world: WorldView;
  onFocus: (nodeId: string) => void;
  onEnter: (nodeId: string) => void;
  onComplete: (nodeId: string) => void;
  onReward: (xp: number) => void;
  packState: unknown;
  setPackState: (state: unknown) => void;
}

export type WorldPack = ((props: WorldPackProps) => ReactNode) & {
  immersive?: boolean;
  hint?: string;
};

export type CourseEvent =
  | { type: "focus"; nodeId: string; progress: Progress }
  | { type: "enter"; nodeId: string; progress: Progress }
  | { type: "complete"; nodeId: string; progress: Progress }
  | { type: "finish"; progress: Progress };

export interface NodeContextValue {
  nodeId: string;
  complete: () => void;
  /** Return to the course shell (map/list) without marking complete. */
  exit?: () => void;
  nodeTitle?: string;
}

// ── Deprecated aliases (pre-terminology migration) ───────────────────────────

/** @deprecated Use LectureNode */
export type CurriculumNode = LectureNode;
/** @deprecated Use CourseEdge */
export type CurriculumEdge = CourseEdge;
/** @deprecated Use Course */
export type Curriculum = Course;
/** @deprecated Use CourseEvent */
export type CurriculumEvent = CourseEvent;
