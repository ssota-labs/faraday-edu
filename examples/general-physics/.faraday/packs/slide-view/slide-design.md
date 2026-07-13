# Move 1 — One idea per slide

A slide earns its place when it carries **exactly one beat** — a claim, a reveal, a
question, or an interaction. If two things are fighting for the screen, split them.

## First slide (title card)

`<Lecture>` does **not** render a shared header above slide view — and `<SlideDeck>`
does **not** auto-insert a title slide. **You** decide what slide 1 is.

**Default pattern — title card:** center the lecture title and one-line hook on a
clean full-viewport screen. Reuse the wording from `<Lecture title lead>` when both
slide and textbook views share the same lecture; textbook view uses that metadata as
its chapter header separately.

```tsx
{
  id: "title",
  content: (
    <div className="flex h-full flex-col justify-center gap-4 px-6 sm:px-12">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        Motion
      </h1>
      <p className="max-w-[52ch] text-lg text-muted-foreground text-pretty sm:text-xl">
        Constant acceleration — drive the model, read the graphs, derive the equation.
      </p>
    </div>
  ),
},
```

- **No interactives** on the title card — orientation only.
- **Alternative:** open on the first teaching beat (e.g. a ConcepTest pretest) when
  that hook is stronger than a title card. Still one beat per slide.

## Every slide

- **Title tells the beat**, not the topic — "Doubling every step" beats "Growth".
- **Landscape split**, not a wall: put the manipulable/visual on one side, the few
  words that frame it on the other (`grid h-full lg:grid-cols-[3fr_2fr]`). The
  canvas leads; prose supports.
- **Cut everything decorative** (Mayer coherence) — slide view magnifies clutter
  because each slide is full-viewport.
- **Text is a caption, not a paragraph.** If a slide needs a paragraph, it's a
  scroll lesson, not a slide.
- **Per-page state resets** on return (only the active page is mounted) — don't
  rely on a slider's position persisting across slides; make each slide
  self-contained.

→ **Faraday:** one `<Workbench>`/`<Chart>`/`<Scene3D>` per slide, framed by a short
`<Prose>`; a prediction `<Quiz>` gets its own slide *before* the reveal slide.
