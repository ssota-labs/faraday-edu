import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Returns a number that eases toward `target` via GSAP (discrete UI changes
 * should not teleport — see quality-bar Surface 3).
 */
export function useAnimatedValue(target: number, opts: { duration?: number } = {}): number {
  const { duration = 0.35 } = opts;
  const [value, setValue] = useState(target);
  const proxy = useRef({ v: target });

  useEffect(() => {
    proxy.current.v = value;
    const tween = gsap.to(proxy.current, {
      v: target,
      duration,
      ease: "power2.out",
      onUpdate: () => setValue(proxy.current.v),
    });
    return () => {
      void tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
