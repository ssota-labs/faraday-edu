# Pack `game2d` — quality bar

- **Learning first.** Every interaction teaches or checks an idea. A polished
  arcade loop with no learning outcome fails this pack.
- **React owns structure; Pixi owns frames.** Spawn/despawn with React state;
  continuous motion via `useTick` + refs — never `setState` every frame.
- **Touch + keyboard.** Hit targets are finger-sized when the audience is on a
  tablet; keyboard shortcuts never the only path.
- **Assets are licensed.** Install via **AssetVault** (`node scripts/game2d-assets.mjs starter`).
  Prefer CC0 packs; commit `assetvault.lock.json` when shipping art with the lesson.
- **Cleanup.** Unmount destroys the Pixi app, Matter engine, and Howler sounds —
  no leaked WebGL contexts between slides.
- **Composable.** The stage sits inside a normal Faraday lesson (`Workbench`,
  controls, assessment) — not a full-screen commercial game shell unless a
  specialized pack (e.g. `storybook-game2d`) opts into that frame.
