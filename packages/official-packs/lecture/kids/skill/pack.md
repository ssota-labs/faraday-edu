# Pack: `kids` — young learners on a tablet

Load this when the learner is a **young child on a touch device**. This is a preset:
it composes existing blocks into a game-like lesson, and it **builds on the `audience`
pack's CRA row** — load that first (`faraday pack show audience`) for the methodology;
this pack is the build recipe.

## Preschool vs elementary

| Age | Primary presentation | Why |
|---|---|---|
| **Preschool / 유아 (~3–6)** | **`game-view`** | Walking, dialogue, scene changes — not slides |
| **Elementary (~6–12)** | `game-view` or `slide-view` + course shell | CRA missions; slides OK for older kids |

For **유아**, install `game-view` (auto-includes `assets-2d`). Use `<GameView>` beats —
not `<SlideDeck>` as the spine.

## The non-negotiables for this audience

- **CRA order** — every idea starts **concrete** (drag/tap/bend a real thing),
  becomes a **picture**, and only then meets a **symbol** — small, last, next to the
  picture it compresses. Never open on notation.
- **One idea per beat** — in game-view, one dialogue line or one mission at a time.
  A child should never face a wall of text or a scroll they can get lost in.
- **Big touch targets** — fingers, not cursors. Large hit areas, generous spacing,
  no tiny sliders or dense control panels; drag and tap over type.
- **Do, don't define** — checks are missions ("make the orbit a circle", "feed the
  animal 3 apples"), never "what is…". Answers are pictures, not words.
- **Celebrate visibly** — progress must be felt: XP, unlocks, a burst on success.
  Game worlds fit this audience best of all.
- **Tiny language** — short sentences, concrete nouns, read-aloud friendly; assume
  a pre/early reader. Under ~12 words per dialogue line (preschool).

## Build recipe (composes existing blocks)

### Preschool (유아) — game-view first

- **`<GameView>`** — scenes with `dialogue`, `move`, `choice` beats (the spine).
- **`assets-2d`** — sprites and backgrounds in `public/assets/`.
- **`<Challenge>`** — embedded as `interaction` beats for CRA concrete step.
- **`<SketchPad>`** — draw/trace inside an `interaction` beat.
- A **course shell** (`map2d` / `world3d`) for unlocking the next lecture — optional outer wrap.

### Elementary — slide or game

- **`<SlideDeck>`** or **`<GameView>`** — one idea per screen/beat.
- **`<SketchPad>`**, **`<Challenge>`**, **`<Quiz>`** with picture-anchored options.
- **`<CourseHost>`** + `map2dPack`/`world3dPack` for a sequence with visible unlocks.

## Quality gate

See `quality.md`: CRA order holds (concrete → picture → symbol), targets are
finger-sized, checks are missions not definitions, and success is celebrated.
