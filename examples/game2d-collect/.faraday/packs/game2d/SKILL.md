# Pack: `game2d` — 2D educational game stage (index)

Load this when the lesson needs a **2D game canvas** — sprites, tilemaps, physics
toys, or interactive stages built with **PixiJS v8** + `@pixi/react`. This is the
**common engine pack**. Audience shells such as **`storybook-game2d`** `require` this pack and add pedagogy on top.

## When it fits (and when it doesn't)

Use `game2d` when the learner must **manipulate a spatial 2D world** (drag, bounce,
tile path, collect) to form or check an idea. Skip it for charts, quizzes, or
slide-only lectures — Faraday blocks already cover those. Do **not** build a
commercial game; keep the loop short and tied to a learning outcome.

## Surface (what installs)

| Piece | Where | Role |
|-------|--------|------|
| `pixi.js` + `@pixi/react` | npm deps | renderer + React bridge |
| `matter-js` | npm dep | 2D physics |
| `howler` | npm dep | SFX / music |
| `src/lesson/game2d/` | copy | author-editable glue |
| `@assetvault/cli` | npm devDep | CC0 asset registry CLI |
| `scripts/game2d-assets.mjs` | copy | wrapper → `public/assets/game2d/` |

API (from `src/lesson/game2d`):

- `<Game2D>` — Pixi `Application` host (resize-to-parent)
- `<PhysicsWorld>` / `<PhysicsBody>` / `usePhysics()` — Matter.js
- `<Tilemap>` — simple spritesheet tile grid
- `getAudioManager()` / `AudioManager` — Howler wrapper

## Read the sub-guides as you need them

1. **Pixi + React** — [pixi.md](pixi.md) (`extend`, `useTick`, Assets)
2. **Physics** — [physics.md](physics.md)
3. **Tilemaps** — [tilemap.md](tilemap.md)
4. **Audio** — [audio.md](audio.md)
5. **Assets** — [assetvault.md](assetvault.md) ← **AssetVault CLI (primary)** · [assets.md](assets.md) licenses
6. **Educational patterns** — [patterns.md](patterns.md)
7. **Anti-patterns** — [anti-patterns.md](anti-patterns.md)

## Specialized packs

- **`storybook-game2d`** — page-turn story / fairy-tale shell (absorbs the old
  `kids` tablet preset). Installs `game2d` via `requires`.
- **`sim2d`** — formula SVG simulations in Workbench (requires neither `game2d` nor runtime motion hooks)

## Quality gate

See [../quality.md](../quality.md).
