# Move 1 — One idea per slide

A slide earns its place when it carries **exactly one beat** — a claim, a reveal, a
question, or an interaction. If two things are fighting for the screen, split them.

- **Title tells the beat**, not the topic — "Doubling every step" beats "Growth".
- **Landscape split**, not a wall: put the manipulable/visual on one side, the few
  words that frame it on the other (`grid h-full lg:grid-cols-[3fr_2fr]`). The
  canvas leads; prose supports.
- **Cut everything decorative** (Mayer coherence) — a deck magnifies clutter
  because each slide is full-viewport.
- **Text is a caption, not a paragraph.** If a slide needs a paragraph, it's a
  scroll lesson, not a slide.
- **Per-page state resets** on return (only the active page is mounted) — don't
  rely on a slider's position persisting across slides; make each slide
  self-contained.

→ **Faraday:** one `<Workbench>`/`<Chart>`/`<Scene3D>` per slide, framed by a short
`<Prose>`; a prediction `<Quiz>` gets its own slide *before* the reveal slide.
