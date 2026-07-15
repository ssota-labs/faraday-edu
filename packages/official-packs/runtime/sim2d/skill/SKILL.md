# Pack: `sim2d` — 2D formula simulations (index)

Load when the lesson needs a **formula-driven 2D simulation** or explanatory
**SVG animation** inside a `<Workbench>` — kinematics, vectors, waves. This
pack **replaces** the old `@faraday-academy/kit` motion hooks
(`useRafLoop`, `useSvgDrag`, `useAnimatedValue`). Install copies
`src/lesson/sim2d/`.

For Pixi game stages, collisions, and sprites → **`game2d`**.

## Surface

| API | Role |
|-----|------|
| `<SvgStage viewBox>` | Workbench SVG host |
| `useSimTime` | Closed-form time `t` → update SVG via refs (SUVAT) |
| `useSimLoop` | Step integration `dt` (puck coasting, F=ma) |
| `useSvgDrag` | Drag handles in viewBox coords |
| `useAnimatedValue` | GSAP ease between discrete targets |
| `setSvgTranslate` | Imperative `transform` |

## Guides

1. [gsap.md](gsap.md) — timelines, no setState every frame
2. [patterns.md](patterns.md) — kinematics, drag+sim hybrid
3. [vs-game2d.md](vs-game2d.md) — when sim2d vs game2d

## Quality

See [../quality.md](../quality.md).
