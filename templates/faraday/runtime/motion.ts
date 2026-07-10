// Motion primitives — the difference between a diagram that *snaps* and one
// that moves. Dep-free, rAF-based. These exist so every lesson doesn't
// hand-roll animation (and so discrete changes never teleport — see
// quality-bar.md, Surface 3).
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAnimatedValue — returns a value that continuously chases `target` with a
 * critically-damped spring. Change the target (setState) and the returned
 * value animates there; render from the returned value.
 *
 *   const x = useAnimatedValue(selected ? 80 : 20);          // eased position
 *   const r = useAnimatedValue(radius, { stiffness: 120 });  // softer
 *
 * `stiffness` sets speed (default 170 ≈ 300ms settle). The value starts AT the
 * initial target (no mount animation); to jump without animating later, remount
 * the component (key change) instead — there is no snap option.
 */
export function useAnimatedValue(
  target: number,
  opts: { stiffness?: number; epsilon?: number } = {},
): number {
  const { stiffness = 170, epsilon = 0.0005 } = opts;
  const [value, setValue] = useState(target);
  const state = useRef({ value: target, velocity: 0, target });
  state.current.target = target;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const damping = 2 * Math.sqrt(stiffness); // critical damping — no overshoot
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const s = state.current;
      const accel = stiffness * (s.target - s.value) - damping * s.velocity;
      s.velocity += accel * dt;
      s.value += s.velocity * dt;
      const scale = Math.max(1, Math.abs(s.target));
      if (Math.abs(s.target - s.value) < epsilon * scale && Math.abs(s.velocity) < epsilon * scale) {
        s.value = s.target;
        s.velocity = 0;
        setValue(s.target);
        return; // settled — stop the loop (restarts on next target change)
      }
      setValue(s.value);
      raf = requestAnimationFrame(tick);
    };
    if (state.current.value !== target || state.current.velocity !== 0) {
      raf = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, epsilon]);

  return value;
}

/**
 * useRafLoop — run a simulation/animation loop while `playing` is true. The
 * callback gets `dt` (seconds, clamped) and total elapsed `t`. Use for systems
 * that are dynamic in the concept (orbits, waves, flight) so they LIVE on
 * screen instead of rendering dead stills.
 *
 *   useRafLoop((dt) => setAngle((a) => a + omega * dt), playing);
 */
export function useRafLoop(onFrame: (dt: number, t: number) => void, playing = true): void {
  const cb = useRef(onFrame);
  cb.current = onFrame;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000); // clamp tab-switch jumps
      last = now;
      t += dt;
      cb.current(dt, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
}

/**
 * useSvgDrag — direct manipulation on an SVG canvas: spread the returned
 * handler on any element inside the <svg>, and get drag positions in VIEWBOX
 * coordinates (pointer-captured, touch-friendly). This is how "drag the
 * planet / vector tip / vertex" is built — prefer it over a detached slider
 * whenever the variable lives on an object (quality-bar.md Surface 3).
 *
 *   const drag = useSvgDrag((x, y, phase) => setTip(clamp({ x, y })));
 *   <circle {...drag} cx={tip.x} cy={tip.y} r={8} cursor="grab" />
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
      // capture so the drag survives leaving the element — but a pointer can
      // already be gone (fast touch release, synthetic events); degrade to an
      // uncaptured drag instead of killing the handler.
      (el as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* not capturable — element listeners below still track the drag */
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
