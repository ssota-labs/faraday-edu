import { useEffect, useRef, type MutableRefObject } from "react";
import gsap from "gsap";

export type UseSimTimeOptions = {
  playing: boolean;
  /** Shared sim clock (seconds). */
  timeRef: MutableRefObject<number>;
  /** Sim time to reach on this play segment. */
  until: number;
  /** Sim seconds per wall-clock second while playing (default 1). Try 2–3 for demos. */
  rate?: number;
  /** Called each GSAP tick with current sim time. Update SVG here. */
  onTick: (t: number) => void;
  onComplete?: () => void;
};

/**
 * Linear sim-time playback via GSAP (`ease: "none"`). Ideal for SUVAT / x(t)
 * lessons — no per-frame React setState on the lesson root.
 */
export function useSimTime({
  playing,
  timeRef,
  until,
  rate = 1,
  onTick,
  onComplete,
}: UseSimTimeOptions) {
  const proxy = useRef({ t: 0 });
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tweenRef.current?.kill();
    proxy.current.t = timeRef.current;
    onTickRef.current(timeRef.current);

    if (!playing) return;

    const from = proxy.current.t;
    const to = until;
    if (from >= to) {
      onComplete?.();
      return;
    }

    tweenRef.current = gsap.to(proxy.current, {
      t: to,
      duration: (to - from) / Math.max(0.001, rate),
      ease: "none",
      onUpdate: () => {
        timeRef.current = proxy.current.t;
        onTickRef.current(proxy.current.t);
      },
      onComplete: () => onComplete?.(),
    });

    return () => {
      if (tweenRef.current) void tweenRef.current.kill();
    };
  }, [playing, until, rate, timeRef, onComplete]);
}
