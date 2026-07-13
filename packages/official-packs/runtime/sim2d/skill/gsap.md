# GSAP in sim2d lessons

## Rules

1. **Sim time** → `useSimTime` with `ease: "none"` (built in).
2. **Integration** → `useSimLoop` on GSAP ticker.
3. **Drawing** → `setSvgTranslate(ref, x, y)` or `gsap.set(el, { attr: … })`.
4. **HUD readouts** → throttle React state (e.g. every 4 ticks) or update only on pause.
5. **Discrete UI** → `useAnimatedValue(target)` when a slider selection should ease.

## Anti-pattern

```tsx
// BAD — re-renders the whole lesson 60×/s
useSimLoop(() => setT((t) => t + dt), playing);
```

## Good

```tsx
const timeRef = useRef(0);
const carRef = useRef<SVGGElement>(null);

useSimTime({
  playing,
  timeRef,
  until: tEnd,
  rate: 2,
  onTick: (t) => {
    const x = posOf(v0, a, t);
    setSvgTranslate(carRef.current, toPix(x), 132);
    maybeUpdateHud(t);
  },
  onComplete: () => setPlaying(false),
});
```
