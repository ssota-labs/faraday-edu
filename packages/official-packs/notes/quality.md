# Pack `notes` — quality bar

- **Marks are the learning.** Pen input is used because *producing* handwriting /
  sketches / annotations is the point — not as a novelty over a click.
- **Stylus-friendly.** Width follows pressure; the canvas sets `touch-action:
  none` and lives where the page won't scroll-jack under the pen.
- **Stable `notebookId`.** Every `<Notebook>` has a stable id so the learner's ink
  persists across reloads; no volatile or missing ids.
- **Right tool.** `<Notebook>` for an open persistent surface; `<SketchPad>` for a
  graded predict-by-drawing check — not swapped.
- **Checked where it matters.** If an outcome must be assessed, a `<Quiz>` /
  `<Challenge>` gates it — the notebook itself isn't auto-graded.
