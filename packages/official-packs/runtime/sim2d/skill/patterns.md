# Patterns

## Constant acceleration (kinematics)

- `useSimTime` + velocity arrow length ∝ `v(t)`
- `rate: 2` or `3` so acceleration is visible on a long track
- Charts still from the same `posOf` / `velOf` functions

## Drag + integrate (F = ma, friction)

- `useSvgDrag` for applied force
- `useSimLoop` for `v += a*dt`, `x += v*dt`
- Update block position with `setSvgTranslate` inside the loop callback

## Eased discrete switch

- `useAnimatedValue(selected ? x1 : x2)` for highlighting two cases
