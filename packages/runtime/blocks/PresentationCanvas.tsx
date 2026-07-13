// Free-mode canvas: pan/zoom workspace with positioned content cards and ink
// drawn directly on the canvas — not a separate notes panel.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";

export interface CanvasItem {
  id: string;
  title?: string;
  content: ReactNode;
}

type Tool = "pan" | "pen" | "eraser";
interface Point {
  x: number;
  y: number;
  p: number;
}
interface Stroke {
  tool: Tool;
  color: string;
  size: number;
  points: Point[];
}

const COLORS = ["#111827", "#2563eb", "#dc2626", "#16a34a"];
const CARD_W = 300;
const CARD_H = 200;
const GAP = 56;

function loadInk(key: string): Stroke[] {
  try {
    return JSON.parse(localStorage.getItem(`faraday.presentation-ink.${key}`) ?? "[]");
  } catch {
    return [];
  }
}

function saveInk(key: string, strokes: Stroke[]) {
  try {
    localStorage.setItem(`faraday.presentation-ink.${key}`, JSON.stringify(strokes));
  } catch {
    /* session-only */
  }
}

function gridLayout(count: number) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
  return Array.from({ length: count }, (_, i) => ({
    x: 48 + (i % cols) * (CARD_W + GAP),
    y: 48 + Math.floor(i / cols) * (CARD_H + GAP),
  }));
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < s.points.length; i++) {
    const a = s.points[i - 1];
    const b = s.points[i];
    ctx.beginPath();
    ctx.lineWidth = s.size * (0.35 + b.p * 1.3);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

export function PresentationCanvas(props: {
  items: CanvasItem[];
  inkKey: string;
  activeId?: string;
  onSelectItem?: (id: string) => void;
  className?: string;
}) {
  const { items, inkKey } = props;
  const positions = useMemo(() => gridLayout(items.length), [items.length]);
  const worldW = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
    return 96 + cols * (CARD_W + GAP);
  }, [items.length]);
  const worldH = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
    const rows = Math.ceil(items.length / cols);
    return 96 + rows * (CARD_H + GAP);
  }, [items.length]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [, bump] = useState(0);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = worldW * dpr;
    canvas.height = worldH * dpr;
    canvas.style.width = `${worldW}px`;
    canvas.style.height = `${worldH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, worldW, worldH);
    for (const s of strokesRef.current) drawStroke(ctx, s);
  }, [worldW, worldH]);

  useEffect(() => {
    strokesRef.current = loadInk(inkKey);
    syncCanvasSize();
  }, [inkKey, syncCanvasSize]);

  useEffect(() => {
    syncCanvasSize();
  }, [worldW, worldH, syncCanvasSize]);

  function worldPoint(clientX: number, clientY: number): Point {
    const el = viewportRef.current!;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left - panRef.current.x) / zoomRef.current;
    const y = (clientY - rect.top - panRef.current.y) / zoomRef.current;
    return { x, y, p: 0.5 };
  }

  function applyTransform() {
    const layer = viewportRef.current?.querySelector("[data-world-layer]") as HTMLElement | null;
    if (!layer) return;
    layer.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    bump((n) => n + 1);
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const prev = zoomRef.current;
    const next = Math.min(2.5, Math.max(0.35, prev * (e.deltaY < 0 ? 1.08 : 0.92)));
    panRef.current.x = mx - ((mx - panRef.current.x) * next) / prev;
    panRef.current.y = my - ((my - panRef.current.y) * next) / prev;
    zoomRef.current = next;
    applyTransform();
  }

  function onPointerDown(e: React.PointerEvent) {
    if (tool === "pan" || e.button === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }
    if (tool === "pen" || tool === "eraser") {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      const p = worldPoint(e.clientX, e.clientY);
      p.p = e.pressure > 0 ? e.pressure : 0.5;
      currentRef.current = { tool, color, size, points: [p] };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragRef.current) {
      panRef.current.x = dragRef.current.panX + (e.clientX - dragRef.current.x);
      panRef.current.y = dragRef.current.panY + (e.clientY - dragRef.current.y);
      applyTransform();
      return;
    }
    const cur = currentRef.current;
    if (!cur) return;
    const p = worldPoint(e.clientX, e.clientY);
    p.p = e.pressure > 0 ? e.pressure : 0.5;
    cur.points.push(p);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && cur.points.length >= 2) {
      drawStroke(ctx, { ...cur, points: cur.points.slice(-2) });
    }
  }

  function onPointerUp() {
    dragRef.current = null;
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.points.length > 1) {
      strokesRef.current = [...strokesRef.current, cur];
      saveInk(inkKey, strokesRef.current);
    }
    currentRef.current = null;
  }

  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    saveInk(inkKey, strokesRef.current);
    syncCanvasSize();
  }

  function clear() {
    strokesRef.current = [];
    saveInk(inkKey, strokesRef.current);
    syncCanvasSize();
  }

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col bg-muted/20", props.className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/80 px-3 py-2 backdrop-blur-sm">
        <Button size="sm" variant={tool === "pan" ? "default" : "outline"} onClick={() => setTool("pan")}>
          Pan
        </Button>
        <Button size="sm" variant={tool === "pen" ? "default" : "outline"} onClick={() => setTool("pen")}>
          Pen
        </Button>
        <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")}>
          Eraser
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Ink color ${c}`}
            onClick={() => {
              setColor(c);
              setTool("pen");
            }}
            className={cn(
              "size-6 rounded-full ring-offset-2",
              color === c && tool === "pen" ? "ring-2 ring-ring" : "",
            )}
            style={{ background: c }}
          />
        ))}
        <input
          type="range"
          min={1}
          max={10}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-20"
          aria-label="Pen size"
        />
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={undo}>
            Undo
          </Button>
          <Button size="sm" variant="outline" onClick={clear}>
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          cursor: tool === "pan" ? "grab" : tool === "eraser" ? "cell" : "crosshair",
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--border) 55%, transparent) 1px, transparent 1px)",
          backgroundSize: `${24 * zoomRef.current}px ${24 * zoomRef.current}px`,
          backgroundPosition: `${panRef.current.x}px ${panRef.current.y}px`,
        }}
      >
        <div
          data-world-layer
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: worldW,
            height: worldH,
            transform: `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`,
          }}
        >
          {items.map((item, i) => {
            const pos = positions[i];
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onSelectItem?.(item.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "absolute overflow-hidden rounded-xl border bg-card text-left shadow-md transition ring-offset-background hover:border-primary/50",
                  props.activeId === item.id ? "ring-2 ring-primary" : "",
                )}
                style={{ left: pos.x, top: pos.y, width: CARD_W, height: CARD_H }}
              >
                {item.title ? (
                  <div className="border-b bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
                    {item.title}
                  </div>
                ) : null}
                <div className="relative h-[calc(100%-1.75rem)] overflow-hidden p-2">
                  <div className="pointer-events-none origin-top-left scale-[0.42] text-sm" style={{ width: "238%" }}>
                    {item.content}
                  </div>
                </div>
              </button>
            );
          })}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute left-0 top-0"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
