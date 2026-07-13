# Pack: `kids` — young learners on a tablet

Load this when the learner is a **young child on a touch device**. This is a preset:
it composes existing blocks into a game-like, one-idea-per-screen tablet lesson, and
it **builds on the `audience` pack's CRA row** — load that first
(`faraday pack show audience`) for the methodology; this pack is the build recipe.

## The non-negotiables for this audience

- **CRA order** — every idea starts **concrete** (drag/tap/bend a real thing),
  becomes a **picture**, and only then meets a **symbol** — small, last, next to the
  picture it compresses. Never open on notation.
- **One idea per screen** — paged, not scrolled. A child should never face a wall of
  text or a scroll they can get lost in.
- **Big touch targets** — fingers, not cursors. Large hit areas, generous spacing,
  no tiny sliders or dense control panels; drag and tap over type.
- **Do, don't define** — checks are missions ("make the orbit a circle", "feed the
  animal 3 apples"), never "what is…". Answers are pictures, not words.
- **Celebrate visibly** — progress must be felt: XP, unlocks, a burst on success.
  Game worlds fit this audience best of all.
- **Tiny language** — short sentences, concrete nouns, read-aloud friendly; assume
  a pre/early reader. Under ~50 words per screen.

## Build recipe (composes existing blocks)

- **`<SlideDeck>`** — one idea per screen (the spine).
- **`<SketchPad>`** — draw/trace to answer (predict-by-drawing); great for pre-writing
  learners.
- **`<Challenge>`** — the "do it" mission cleared in a `<Workbench>`; the concrete
  step of CRA.
- **`<Quiz>`** with **picture-anchored options** — recognition without reading.
- A **game world** (`<CourseHost>` + `map2dPack`/`world3dPack`) for a sequence,
  with visible unlocks.

## Quality gate

See `quality.md`: CRA order holds (concrete → picture → symbol), targets are
finger-sized, checks are missions not definitions, and success is celebrated.
