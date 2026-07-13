// Pure progression engine — no React, no I/O.
import type { Course, CourseEdge, NodeStatus, Progress, WorldNode, WorldView } from "./types";

export function deriveEdges(c: Course): CourseEdge[] {
  if (c.edges && c.edges.length) return c.edges;
  const out: CourseEdge[] = [];
  for (const node of c.nodes) {
    for (const from of node.requires ?? []) out.push({ from, to: node.id });
  }
  return out;
}

export function statusOf(nodeId: string, c: Course, progress: Progress): NodeStatus {
  if (progress.completed.includes(nodeId)) return "complete";
  const node = c.nodes.find((n) => n.id === nodeId);
  const requires = node?.requires ?? [];
  const unlocked = requires.every((r) => progress.completed.includes(r));
  if (!unlocked) return "locked";
  if (progress.current === nodeId) return "active";
  return "available";
}

export function buildWorldView(c: Course, progress: Progress): WorldView {
  const nodes: WorldNode[] = c.nodes.map((n) => ({ ...n, status: statusOf(n.id, c, progress) }));
  return {
    title: c.title,
    nodes,
    edges: deriveEdges(c),
    progress,
    done: progress.completed.length,
    total: c.nodes.length,
  };
}

export function initialProgress(c: Course): Progress {
  const firstOpen = c.nodes.find((n) => (n.requires ?? []).length === 0);
  return { completed: [], current: firstOpen?.id, xp: 0 };
}

export function markComplete(nodeId: string, c: Course, progress: Progress): Progress {
  if (progress.completed.includes(nodeId)) return progress;
  const node = c.nodes.find((n) => n.id === nodeId);
  const completed = [...progress.completed, nodeId];
  const xp = progress.xp + (node?.reward?.xp ?? 0);
  const next: Progress = { completed, current: progress.current, xp };
  const nextAvailable = c.nodes.find(
    (n) => !completed.includes(n.id) && (n.requires ?? []).every((r) => completed.includes(r)),
  );
  next.current = nextAvailable?.id ?? nodeId;
  return next;
}

export function isFinished(c: Course, progress: Progress): boolean {
  return c.nodes.every((n) => progress.completed.includes(n.id));
}
