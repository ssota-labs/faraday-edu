# Interactive design — the manipulation that reveals the idea

Do this **before** large code dumps.

## Core question

**What should the learner manipulate, and what should visibly change, so the
concept becomes obvious?**

## Method

1. **Name the aha / misconception** — the thing static text fails to show.
2. **Pick one primary manipulable** — a knob, drag handle, scrubber, or camera
   path. Extra knobs hide the point.
3. **Map response → concept** — the 3D representation must *be* the idea moving,
   not decoration beside it.
4. **Choose the shape**
   - **Continuous** — live relationship (orbit period, field strength, angle).
   - **Stepped** — sequence of moments (algorithm rotation, construction steps).
5. **Place the control on the thing** when possible (drag the body, not only a
   side slider). Overlay HUD is fine for secondary parameters.

## Fullscreen craft

- Primary viewport is the canvas — edge to edge.
- HUD is sparse: title, one control group, one readout.
- Prefer motion that teaches (orbit, morph, highlight) over ornamental spin.
- Respect `prefers-reduced-motion` for non-essential animation.

## Anti-patterns

- Dashboard chrome, card grids, multi-panel LMS shells.
- Knobs that change nothing conceptual.
- Teleporting state with no visual continuity.
