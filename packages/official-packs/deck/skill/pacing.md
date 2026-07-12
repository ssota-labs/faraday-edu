# Move 3 — Pace and navigate

- **Length** — a deck is short by nature. Aim for the fewest slides that carry the
  arc; if it runs past ~15–20, it's probably a `<Course>` (chaptered) instead.
- **Navigation is expected** — `<Paged>` ships prev/next, a dot rail, and arrow
  keys; keep them visible. A presenter drives with arrows; a kiosk reader taps.
- **Interactions punctuate** — don't make every slide a passive reveal. Alternate:
  claim → manipulate → predict → resolve. The learner *does* something every few
  slides, not just clicks "next".
- **Open and close deliberately** — first slide sets the question/hook; last slide
  lands the takeaway (or, in a graded context, the check). No trailing filler.
- **Self-contained slides** — because per-page state resets, a slide the reader
  jumps back to must still make sense on its own.

→ **Faraday:** `<Paged>` for the deck; a prediction `<Quiz>` slide before a reveal
slide; the final slide is the takeaway or the `<Quiz onCorrect={complete}>` gate.
