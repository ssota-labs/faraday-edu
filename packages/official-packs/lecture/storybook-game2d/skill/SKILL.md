# Pack: `storybook-game2d` — storybook / fairy-tale 2D shell (index)

Load this when the lesson should feel like a **storybook or fairy-tale game** —
paged scenes, story-led or young learners, CRA order, big touch targets. This
pack **absorbs the former `kids` tablet preset** and builds on **`game2d`**
(auto-installed via `requires`).

Also load the **`audience`** pack when you need the CRA methodology detail; this pack
is the **build recipe + Pixi page shell**.

## When it fits

- Early readers / tablet sessions / narrative framing of a concept
- One idea per page with a short interactive stage
- Celebration and page-turn pacing matter more than an open world

When you need a free-roam map or XP graph for adults, stay on `game2d` (or a
future quest shell) — don't force a storybook frame.

## Non-negotiables (from the old `kids` pack)

- **CRA order** — concrete → picture → symbol last
- **One idea per page** — never a wall of text
- **Big touch targets** — fingers, not cursors
- **Do, don't define** — missions over "what is…"
- **Celebrate visibly** — SFX / burst / unlock
- **Tiny language** — short sentences; under ~50 words of narration per page for
  early readers

## Surface

```bash
faraday pack add storybook-game2d   # also installs game2d
```

- `src/lesson/storybook-game2d/` — `<StorybookGame>`, `celebrate()`
- `src/lesson/game2d/` — Pixi host, physics, tilemap, audio (dependency)

## Guides

1. [pages.md](pages.md) — authoring a page list
2. [pedagogy.md](pedagogy.md) — CRA + tablet rules (kids → here)
3. [game2d bridge](game2d-bridge.md) — how to use Pixi inside a page

## Quality gate

See [../quality.md](../quality.md).
