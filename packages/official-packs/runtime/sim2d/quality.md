# Pack `sim2d` — quality bar

- **Model first.** Position/velocity come from the lesson's equations — not a physics
  engine fighting the math.
- **SVG + GSAP, not React every frame.** Drive sim time with `useSimTime` /
  `useSimLoop`; update SVG via refs/`gsap.set`. Throttle HUD readouts.
- **Workbench-native.** The stage is a block inside `<Workbench>`, with controls
  in the panel and Play/readouts in `hud`.
- **sim2d vs game2d.** Spatial *explanation* → sim2d. Collisions, sprites,
  tilemaps → `game2d`.
- **Accessible.** SVG `role="img"` + `aria-label` on `<SvgStage>`.
