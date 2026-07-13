// Shared pressure-sensitive ink — used by overview canvas and per-slide annotation.
// Canvas + PointerEvents only (no React Flow / external whiteboard libs).

export type InkTool = "pen" | "highlighter" | "marker" | "eraser";

export interface InkPoint {
  x: number;
  y: number;
  p: number;
}

export interface InkStroke {
  tool: InkTool;
  color: string;
  size: number;
  points: InkPoint[];
}

export const INK_COLORS = ["#111827", "#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#9333ea"];

export function loadInk(storageKey: string): InkStroke[] {
  try {
    return JSON.parse(localStorage.getItem(`faraday.ink.${storageKey}`) ?? "[]");
  } catch {
    return [];
  }
}

export function saveInk(storageKey: string, strokes: InkStroke[]) {
  try {
    localStorage.setItem(`faraday.ink.${storageKey}`, JSON.stringify(strokes));
  } catch {
    /* session-only */
  }
}

export function drawInkStroke(ctx: CanvasRenderingContext2D, s: InkStroke) {
  if (s.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
  } else if (s.tool === "highlighter") {
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.38;
  } else if (s.tool === "marker") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.72;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = s.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const widthMul = s.tool === "highlighter" ? 2.8 : s.tool === "marker" ? 1.8 : 1;

  for (let i = 1; i < s.points.length; i++) {
    const a = s.points[i - 1];
    const b = s.points[i];
    ctx.beginPath();
    ctx.lineWidth = s.size * widthMul * (0.35 + b.p * 1.3);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export function defaultInkSize(tool: InkTool): number {
  if (tool === "highlighter") return 8;
  if (tool === "marker") return 5;
  if (tool === "eraser") return 6;
  return 3;
}
