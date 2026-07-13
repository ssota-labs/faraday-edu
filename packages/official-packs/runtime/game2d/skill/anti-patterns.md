# Anti-patterns

- **Commercial game scope** — inventory, skill trees, multiplayer for a 10-minute lesson.
- **`setState` every frame** — kills React; use `useTick` + refs / Matter.
- **Old `@pixi/react` v7** (`<Stage>`, `<Container>` imports from the package) — wrong API; use `extend` + `pixi*` JSX.
- **Physics for everything** — a slider + formula often teaches better than a buggy sim.
- **Missing asset downloads** — referencing `/assets/game2d/…` that were never fetched.
- **Copyrighted art** — no scraped cartoon characters; Kenney CC0 or credited CC-BY only.
- **Audio autoplay with sound** — blocked by browsers; wait for a gesture.
- **Leaking WebGL** — forgetting to leave the slide / unmount `Game2D` between heavy stages.
