# Pack: `notes` — pen notebook (agent guide)

Load this when the lesson is **handwriting- or sketch-driven on a stylus device** —
a full-page ink surface the learner writes or draws in (GoodNotes-style). This pack
ships an author-editable `<Notebook>` component into `src/lesson/notes/`; it uses no
new npm dependencies.

## When it fits

Pen input shines when *producing marks* is the learning: handwriting practice
(letters, kanji, math notation), free-body diagrams, graph sketching, geometry
constructions, annotating a figure, "show your work". It needs a stylus/touch
device to feel right — on a mouse it degrades to rough drawing.

**`<Notebook>` (this pack) vs. `<SketchPad>` (runtime):** use `<SketchPad>` for a
*graded predict-by-drawing check* (sketch vs. a revealed answer); use `<Notebook>`
for an *open, persistent writing surface* where the marks themselves are the work.

## Using it

```tsx
import { Notebook } from "./notes/Notebook";

<Notebook notebookId="kanji-water" height={480} />
```

- `notebookId` must be **stable** — it's the localStorage key; the ink persists
  across reloads. Change it → fresh page.
- Pen/eraser, colors, and size are built in; width follows **pressure**
  (`PointerEvent.pressure`), so Apple Pencil / stylus feels natural.
- `touch-action: none` is set so a finger/stylus draws instead of scrolling —
  place the notebook where the page itself doesn't need to scroll under it (a
  `<Paged>` screen is ideal).

## Composing

- Put a `<Notebook>` beside a prompt/figure in a landscape split, or full-width on
  its own `<Paged>` screen ("write the character three times").
- For a *checked* outcome, pair a `<Notebook>` (practice) with a `<Quiz>`/
  `<Challenge>` (the gate) — the notebook itself isn't auto-graded.
- The component is yours: edit `Notebook.tsx` for lined/grid paper, export, etc.

## Quality gate

See `quality.md`: pen input is chosen because *making marks* is the learning, the
surface is stylus-friendly (pressure, no scroll-jacking), and `notebookId` is
stable so work isn't lost.
