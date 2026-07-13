// Per-slide ink overlay — annotate directly on the active slide (present mode).
import { useCallback, useEffect, useRef, useState } from "react";
import { InkToolbar } from "./InkToolbar";
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

export function SlideInkLayer(props: { inkKey: string; active: boolean; onDone?: () => void }) {
  const coarse = useCoarsePointer();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<InkStroke[]>([]);
  const currentRef = useRef<InkStroke | null>(null);
  const penCountRef = useRef(0);

  const [tool, setTool] = useState<InkTool>("pen");
  const [color, setColor] = useState(INK_COLORS[0]);
  const [size, setSize] = useState(defaultInkSize("pen"));

  const sync = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const s of strokesRef.current) drawInkStroke(ctx, s);
  }, []);

  useEffect(() => {
    strokesRef.current = loadInk(props.inkKey);
    sync();
  }, [props.inkKey, sync]);

  useEffect(() => {
    if (!props.active) return;
    sync();
    const ro = new ResizeObserver(sync);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [props.active, sync]);

  function point(e: React.PointerEvent): InkPoint {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: e.pressure > 0 ? e.pressure : 0.5,
    };
  }

  function acceptsPointer(e: React.PointerEvent): boolean {
    if (!props.active) return false;
    if (e.button !== 0) return false;
    if (e.pointerType === "touch" && penCountRef.current > 0) return false;
    if (coarse && e.pointerType === "touch") return false;
    return true;
  }

  function onDown(e: React.PointerEvent) {
    if (!acceptsPointer(e)) return;
    if (e.pointerType === "pen") penCountRef.current += 1;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    currentRef.current = { tool, color, size, points: [point(e)] };
  }

  function onMove(e: React.PointerEvent) {
    const cur = currentRef.current;
    if (!cur) return;
    cur.points.push(point(e));
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && cur.points.length >= 2) {
      drawInkStroke(ctx, { ...cur, points: cur.points.slice(-2) });
    }
  }

  function onUp(e: React.PointerEvent) {
    if (e.pointerType === "pen") penCountRef.current = Math.max(0, penCountRef.current - 1);
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.points.length > 1) {
      strokesRef.current = [...strokesRef.current, cur];
      saveInk(props.inkKey, strokesRef.current);
    }
    currentRef.current = null;
  }

  function undo() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    saveInk(props.inkKey, strokesRef.current);
    sync();
  }

  function clear() {
    strokesRef.current = [];
    saveInk(props.inkKey, strokesRef.current);
    sync();
  }

  if (!props.active) return null;

  return (
    <>
      <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-10">
        <canvas
          ref={canvasRef}
          className="pointer-events-auto absolute inset-0 touch-none"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Slide annotations"
        />
      </div>
      <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-3">
        <InkToolbar
          tool={tool}
          color={color}
          size={size}
          onTool={setTool}
          onColor={setColor}
          onSize={setSize}
          onUndo={undo}
          onClear={clear}
        />
        {props.onDone ? (
          <button
            type="button"
            className="rounded-full border border-border/70 bg-background/94 px-3 py-1 text-sm shadow backdrop-blur-md"
            onClick={props.onDone}
          >
            Done annotating
          </button>
        ) : null}
      </div>
    </>
  );
}
