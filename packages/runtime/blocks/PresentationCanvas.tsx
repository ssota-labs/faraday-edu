// Free-mode canvas: custom pan/zoom workspace (not React Flow) with positioned
// content cards and ink drawn on the canvas.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { clientDistance, clientMidpoint, pinchZoomAtMidpoint } from "./canvas-gestures";
import { InkToolbar, type InkToolbarMode } from "./InkToolbar";
import {
  drawInkStroke,
  loadInk,
  saveInk,
  type InkPoint,
  type InkStroke,
  type InkTool,
  defaultInkSize,
  INK_COLORS,
} from "./ink";
import { useCoarsePointer } from "./use-coarse-pointer";

export interface CanvasItem {
  id: string;
  title?: string;
  content: ReactNode;
}

export type CanvasCardLayout = "landscape" | "portrait-9-16";

const LAYOUTS: Record<
  CanvasCardLayout,
  { cardW: number; cardH: number; gap: number; previewScale: number; previewWidth: string }
> = {
  landscape: { cardW: 360, cardH: 220, gap: 140, previewScale: 0.42, previewWidth: "238%" },
  "portrait-9-16": { cardW: 243, cardH: 432, gap: 140, previewScale: 0.36, previewWidth: "278%" },
};

interface TrackedPointer {
  x: number;
  y: number;
  type: string;
}

interface PinchSession {
  startDist: number;
  startZoom: number;
  startPanX: number;
  startPanY: number;
  lastMidX: number;
  lastMidY: number;
}

function gridLayout(count: number, cardW: number, cardH: number, gap: number) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
  return Array.from({ length: count }, (_, i) => ({
    x: 64 + (i % cols) * (cardW + gap),
    y: 64 + Math.floor(i / cols) * (cardH + gap),
  }));
}

export function PresentationCanvas(props: {
  items: CanvasItem[];
  inkKey: string;
  activeId?: string;
  onSelectItem?: (id: string) => void;
  className?: string;
  cardLayout?: CanvasCardLayout;
}) {
  const layout = LAYOUTS[props.cardLayout ?? "landscape"];
  const { cardW, cardH, gap, previewScale, previewWidth } = layout;
  const { items, inkKey } = props;
  const coarse = useCoarsePointer();

  const positions = useMemo(() => gridLayout(items.length, cardW, cardH, gap), [items.length, cardW, cardH, gap]);
  const worldW = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
    return 128 + cols * (cardW + gap);
  }, [items.length, cardW, gap]);
  const worldH = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
    const rows = Math.ceil(items.length / cols);
    return 128 + rows * (cardH + gap);
  }, [items.length, cardH, gap]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<InkStroke[]>([]);
  const currentRef = useRef<InkStroke | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pointersRef = useRef(new Map<number, TrackedPointer>());
  const pinchRef = useRef<PinchSession | null>(null);
  const penCountRef = useRef(0);

  const [tool, setTool] = useState<InkTool>("pen");
  const [color, setColor] = useState(INK_COLORS[0]);
  const [size, setSize] = useState(defaultInkSize("pen"));
  const [mode, setMode] = useState<InkToolbarMode>("draw");
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
    for (const s of strokesRef.current) drawInkStroke(ctx, s);
  }, [worldW, worldH]);

  useEffect(() => {
    strokesRef.current = loadInk(`overview:${inkKey}`);
    syncCanvasSize();
  }, [inkKey, syncCanvasSize]);

  useEffect(() => {
    syncCanvasSize();
  }, [worldW, worldH, syncCanvasSize]);

  function worldPoint(clientX: number, clientY: number): InkPoint {
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

  function cancelStroke() {
    currentRef.current = null;
    dragRef.current = null;
  }

  function beginPinch() {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return;
    const dist = clientDistance(pts[0], pts[1]);
    const mid = clientMidpoint(pts[0], pts[1]);
    pinchRef.current = {
      startDist: dist,
      startZoom: zoomRef.current,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
      lastMidX: mid.x,
      lastMidY: mid.y,
    };
    cancelStroke();
  }

  function updatePinch() {
    const session = pinchRef.current;
    const el = viewportRef.current;
    const pts = [...pointersRef.current.values()];
    if (!session || !el || pts.length < 2) return;
    const rect = el.getBoundingClientRect();
    const dist = clientDistance(pts[0], pts[1]);
    const mid = clientMidpoint(pts[0], pts[1]);
    const zoomed = pinchZoomAtMidpoint({
      rect,
      startDist: session.startDist,
      startZoom: session.startZoom,
      startPanX: session.startPanX,
      startPanY: session.startPanY,
      dist,
      mid,
    });
    panRef.current.x = zoomed.panX + (mid.x - session.lastMidX);
    panRef.current.y = zoomed.panY + (mid.y - session.lastMidY);
    zoomRef.current = zoomed.zoom;
    session.lastMidX = mid.x;
    session.lastMidY = mid.y;
    applyTransform();
  }

  function shouldRejectTouch(pointerType: string): boolean {
    return pointerType === "touch" && penCountRef.current > 0;
  }

  function shouldPanSingle(pointerType: string, button: number): boolean {
    if (button === 1) return true;
    if (mode === "pan") return true;
    if (coarse && pointerType === "touch") return true;
    return false;
  }

  function shouldDrawSingle(pointerType: string): boolean {
    if (mode !== "draw") return false;
    if (pointerType === "pen") return true;
    if (coarse) return false;
    return pointerType === "mouse";
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
    if (shouldRejectTouch(e.pointerType)) return;

    if (e.pointerType === "pen") penCountRef.current += 1;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 2) {
      beginPinch();
      return;
    }

    if (pointersRef.current.size !== 1) return;

    if (shouldPanSingle(e.pointerType, e.button)) {
      dragRef.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
      return;
    }

    if (shouldDrawSingle(e.pointerType)) {
      const p = worldPoint(e.clientX, e.clientY);
      p.p = e.pressure > 0 ? e.pressure : 0.5;
      currentRef.current = { tool, color, size, points: [p] };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const tracked = pointersRef.current.get(e.pointerId);
    if (!tracked) return;
    tracked.x = e.clientX;
    tracked.y = e.clientY;

    if (pointersRef.current.size >= 2) {
      updatePinch();
      return;
    }

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
      drawInkStroke(ctx, { ...cur, points: cur.points.slice(-2) });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (e.pointerType === "pen") penCountRef.current = Math.max(0, penCountRef.current - 1);

    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 1 && pointersRef.current.size > 0) {
      // resumed single-pointer — don't auto-start stroke
    }

    dragRef.current = null;
    const cur = currentRef.current;
    if (cur) {
      if (cur.points.length > 1) {
        strokesRef.current = [...strokesRef.current, cur];
        saveInk(`overview:${inkKey}`, strokesRef.current);
      }
      currentRef.current = null;
    }
  }

  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    saveInk(`overview:${inkKey}`, strokesRef.current);
    syncCanvasSize();
  }

  function clear() {
    strokesRef.current = [];
    saveInk(`overview:${inkKey}`, strokesRef.current);
    syncCanvasSize();
  }

  const titleH = props.cardLayout === "portrait-9-16" ? "2rem" : "1.75rem";

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col bg-muted/20 pb-20", props.className)}>
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          cursor: mode === "pan" || coarse ? "grab" : tool === "eraser" ? "cell" : "crosshair",
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
                  "absolute overflow-hidden rounded-none border bg-card text-left shadow-md transition ring-offset-background hover:border-primary/50",
                  props.activeId === item.id ? "ring-2 ring-primary" : "",
                )}
                style={{ left: pos.x, top: pos.y, width: cardW, height: cardH }}
              >
                {item.title ? (
                  <div className="border-b bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
                    {item.title}
                  </div>
                ) : null}
                <div
                  className="relative overflow-hidden p-2"
                  style={{ height: `calc(100% - ${titleH})` }}
                >
                  <div
                    className="pointer-events-none origin-top-left text-sm"
                    style={{ transform: `scale(${previewScale})`, width: previewWidth }}
                  >
                    {item.content}
                  </div>
                </div>
              </button>
            );
          })}
          <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
        <InkToolbar
          tool={tool}
          mode={mode}
          color={color}
          size={size}
          onTool={setTool}
          onMode={setMode}
          onColor={setColor}
          onSize={setSize}
          onUndo={undo}
          onClear={clear}
        />
      </div>
    </div>
  );
}
