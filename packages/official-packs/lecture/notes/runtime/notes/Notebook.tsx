// <Notebook> — a full-page pressure-sensitive ink canvas (GoodNotes-style).
// Author-editable; installed into the lesson by `faraday pack add notes`. Captures
// pointer strokes with pen/eraser, varies width by pressure (Apple Pencil / stylus),
// and persists strokes to localStorage per `notebookId` so the page survives reload.
// Canvas + PointerEvents only — no external dependencies.
import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser";
interface Point { x: number; y: number; p: number }
interface Stroke { tool: Tool; color: string; size: number; points: Point[] }

const COLORS = ["#111827", "#2563eb", "#dc2626", "#16a34a"];

function load(id: string): Stroke[] {
  try {
    return JSON.parse(localStorage.getItem(`faraday.notes.${id}`) ?? "[]");
  } catch {
    return [];
  }
}
function save(id: string, strokes: Stroke[]) {
  try {
    localStorage.setItem(`faraday.notes.${id}`, JSON.stringify(strokes));
  } catch {
    /* storage unavailable — session-only */
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < s.points.length; i++) {
    const a = s.points[i - 1], b = s.points[i];
    ctx.beginPath();
    ctx.lineWidth = s.size * (0.35 + b.p * 1.3); // pressure → width
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/**
 * @param notebookId  stable id — the localStorage key for this page's ink.
 * @param height      canvas height in px (default 420); the notebook fills its width.
 */
export function Notebook({ notebookId, height = 420 }: { notebookId: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokesRef.current) drawStroke(ctx, s);
  }

  // size the backing store to the element (crisp on HiDPI) and load saved ink
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    strokesRef.current = load(notebookId);
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, height]);

  function pos(e: React.PointerEvent): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, p: e.pressure > 0 ? e.pressure : 0.5 };
  }

  function onDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    currentRef.current = { tool, color, size, points: [pos(e)] };
  }
  function onMove(e: React.PointerEvent) {
    const cur = currentRef.current;
    if (!cur) return;
    cur.points.push(pos(e));
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && cur.points.length >= 2) {
      drawStroke(ctx, { ...cur, points: cur.points.slice(-2) });
    }
  }
  function onUp() {
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.points.length > 1) {
      strokesRef.current = [...strokesRef.current, cur];
      save(notebookId, strokesRef.current);
    }
    currentRef.current = null;
  }
  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    save(notebookId, strokesRef.current);
    redraw();
  }
  function clear() {
    strokesRef.current = [];
    save(notebookId, strokesRef.current);
    redraw();
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-2">
        <button
          onClick={() => setTool("pen")}
          className={`rounded-md px-3 py-1.5 text-sm ${tool === "pen" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          ✒️ Pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`rounded-md px-3 py-1.5 text-sm ${tool === "eraser" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          🩹 Eraser
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool("pen"); }}
            aria-label={`color ${c}`}
            className={`h-6 w-6 rounded-full ring-offset-2 ${color === c && tool === "pen" ? "ring-2 ring-ring" : ""}`}
            style={{ background: c }}
          />
        ))}
        <input
          type="range" min={1} max={10} value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="ml-1 w-24" aria-label="pen size"
        />
        <div className="ml-auto flex gap-2">
          <button onClick={undo} className="rounded-md bg-muted px-3 py-1.5 text-sm">↩︎ Undo</button>
          <button onClick={clear} className="rounded-md bg-muted px-3 py-1.5 text-sm">Clear</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{ width: "100%", height, touchAction: "none", display: "block", cursor: "crosshair" }}
      />
    </div>
  );
}
