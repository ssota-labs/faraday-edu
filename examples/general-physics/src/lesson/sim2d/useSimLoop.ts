import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Integration loop while `playing` — `cb(dt, elapsed)` on GSAP's ticker.
 * Use when state evolves by small steps (velocity += a*dt), not a closed-form
 * time parameter. Prefer `useSimTime` when you have x(t) directly.
 */
export function useSimLoop(onFrame: (dt: number, elapsed: number) => void, playing = true): void {
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    if (!playing) return;
    let elapsed = 0;
    const tick = () => {
      const dt = Math.min(0.064, gsap.ticker.deltaRatio() / 60);
      elapsed += dt;
      cb.current(dt, elapsed);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [playing]);
}

/** @deprecated Use `useSimLoop` — kept for migrating lessons off runtime motion. */
export const useRafLoop = useSimLoop;
