import { useCallback, useRef } from "react";

/**
 * Direct manipulation on an SVG canvas — drag positions in viewBox coordinates.
 */
export function useSvgDrag(
  onDrag: (x: number, y: number, phase: "start" | "move" | "end") => void,
): { onPointerDown: (e: React.PointerEvent<Element>) => void } {
  const cb = useRef(onDrag);
  cb.current = onDrag;

  const onPointerDown = useCallback((e: React.PointerEvent<Element>) => {
    const el = e.currentTarget as Element & { ownerSVGElement?: SVGSVGElement | null };
    const svg = (el.ownerSVGElement ?? el) as SVGSVGElement;
    if (typeof svg.getScreenCTM !== "function") return;
    const toViewBox = (ev: PointerEvent | React.PointerEvent) => {
      const ctm = svg.getScreenCTM();
      const pt = new DOMPoint(ev.clientX, ev.clientY);
      const p = ctm ? pt.matrixTransform(ctm.inverse()) : pt;
      return { x: p.x, y: p.y };
    };
    e.preventDefault();
    try {
      (el as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* degrade to uncaptured drag */
    }
    const start = toViewBox(e);
    cb.current(start.x, start.y, "start");
    const move = (ev: PointerEvent) => {
      const p = toViewBox(ev);
      cb.current(p.x, p.y, "move");
    };
    const up = (ev: PointerEvent) => {
      const p = toViewBox(ev);
      cb.current(p.x, p.y, "end");
      el.removeEventListener("pointermove", move as EventListener);
      el.removeEventListener("pointerup", up as EventListener);
      el.removeEventListener("pointercancel", up as EventListener);
    };
    el.addEventListener("pointermove", move as EventListener);
    el.addEventListener("pointerup", up as EventListener);
    el.addEventListener("pointercancel", up as EventListener);
  }, []);

  return { onPointerDown };
}
