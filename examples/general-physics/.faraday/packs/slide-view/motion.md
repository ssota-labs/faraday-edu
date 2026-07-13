# Move 2 — Motion with a job

Every animation must **reveal something**, not decorate. Three jobs earn motion:

- **Build** — stage a complex figure in parts (axes → curve → annotation) so
  attention lands in order.
- **Transition** — carry an object between slides so the reader tracks *the same
  thing* changing (shared element), not a cut to something new.
- **Focus** — a small emphasis (a value ticking, a highlight) that directs the eye
  to what just changed.

Rules:
- **No motion for flair** — spins, bounces, and fly-ins that don't reveal cost
  attention (extraneous load) and read as amateur.
- **Fast and once** — reveals are ~150–300 ms, not looping. The learner controls
  the pace with prev/next; motion shouldn't hold them hostage.
- **Respect `prefers-reduced-motion`** — degrade to an instant state, never break.

→ **Faraday:** use the runtime's `motion` helpers for slide/build transitions;
drive step-reveals with `<Scrubber>` + `useStepper` when the learner should scrub
the build themselves.
