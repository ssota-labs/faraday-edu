# Pack: `assets-2d` — 2D sprites & backgrounds (index)

Load when a lecture needs **2D art** for `<GameView>` or other 2D scenes: character
sprites, backgrounds, tiles, UI icons. This pack is **skill-only** — it teaches sourcing
and generation; files land in the lesson's `public/` folder.

## Lesson paths

```
public/assets/sprites/       # characters, props (PNG/SVG/WebP)
public/assets/backgrounds/   # scene backdrops
public/assets/tiles/         # optional tilesets
```

Reference in `<GameView>`:

```tsx
{ id: "kid", sprite: "/assets/sprites/kid.png", x: 15, y: 72 }
{ type: "scene", background: "/assets/backgrounds/meadow.png" }
```

## T0 — Curated CC0 sources (prefer first)

| Source | What | License |
|---|---|---|
| [Kenney.nl](https://kenney.nl/assets) | Characters, UI, nature, platformer kits | CC0 |
| [OpenGameArt.org](https://opengameart.org) | Sprites, tilesets — filter CC0 | varies; pick CC0 |
| [itch.io](https://itch.io/game-assets/free/tag-cc0) | CC0 bundles | CC0 |
| [Game-icons.net](https://game-icons.net) | UI icons | CC BY 3.0 |

Download into `public/assets/` and keep a `CREDITS.md` with source URLs.

## T1 — AI / procedural generation

When CC0 doesn't fit the brief, generate art with a **consistent pipeline**:

### External skill: ai-game-art-pipeline

[ybuild-ai/ai-game-art-pipeline-skill](https://github.com/ybuild-ai/ai-game-art-pipeline-skill)
covers end-to-end 2D game art:

- Character sprite sheets (walk cycles, idle)
- Background scenes
- Chroma-key / transparency cleanup
- Sheet slicing into individual frames

**Workflow:** prompt → generate sheet → slice → place in `public/assets/sprites/`.

### Other tools

| Tool | Use |
|---|---|
| [Ludo.ai](https://ludo.ai) | Sprite generation, style-locked characters |
| [spritesheets.ai](https://spritesheets.ai) | Animation sheets from prompts |
| Inline SVG | Fast placeholder during authoring (see `game-view` examples) |

## Style rules (preschool / game-view)

- **One style per lecture** — flat vector OR pixel, not both.
- **Large readable silhouettes** — preschool needs clear shapes at small sizes.
- **Calm backgrounds** — low detail behind dialogue; characters pop.
- **Transparent PNG/WebP** for sprites; avoid JPEG for characters.

## Pair with

- **`game-view`** — auto-requires this pack; sprites feed `<GameView>` beats.
- **`kids`** — CRA preset; concrete sprites before symbols.
