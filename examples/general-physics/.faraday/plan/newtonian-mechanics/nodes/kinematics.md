# kinematics — Motion: position, velocity, acceleration

- **outcome:** Given constant acceleration, relate x(t), v(t), a and compute an unknown
  with the kinematic equations (compute verb).
- **interactions (shared, reused across both views):**
  1. **Continuous model** — a car on a track; sliders for v₀ and a, Play (`useRafLoop`)
     runs the motion with a fading trail; live Readouts for t, x, v in the Workbench `hud`.
  2. `<Chart>` of x(t) (parabola) and v(t) (line) sampled from the *real* model (xType="number").
  3. `<Derivation>` ending at x = x₀ + v₀t + ½at² (and v² = v₀² + 2aΔx as a `<Reveal>`).
- **check:** `<NumericAnswer>` — from rest, a=3.0 m/s², after t=5.0 s displacement?
  answer **37.5**, unit m, tolerance 2%. Wired to `complete()`.
- **presentation split:**
  - *TextbookView* — full chapter: motivation prose → model → interpret → derivation → chart → check. 4+ Prose sections.
  - *SlideView* — one beat per slide: (1) what changes as you drive, (2) the model canvas, (3) the two graphs, (4) derivation, (5) the numeric check.
- **source:** constant-acceleration kinematics (SUVAT). Spot: a=3,t=5 ⇒ v=15, Δx=37.5.
- **requires:** — . **file:** src/lesson/lectures/kinematics.tsx.
