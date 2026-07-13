# first-law — Newton's 1st law: inertia & equilibrium

- **outcome:** State that zero net force ⇒ constant velocity (rest is a special case) and
  identify equilibrium; distinguish "needs a force to keep moving" (impetus misconception)
  from the correct view (recognize/distinguish verb).
- **interactions (shared across both views):**
  1. **ConcepTest pretest MCQ** (frictionless puck) — commit first (`<Quiz>`).
  2. **Continuous model** — a puck on a surface; `<ParamSwitch>` toggles friction on/off,
     an on-canvas "Kick" button applies a brief force (`useRafLoop`); friction off → coasts
     forever, friction on → decays. Live velocity Readout.
  3. `<Compare>` of the two cases + an equilibrium free-body (hanging sign, ΣF=0) as an SVG.
- **check:** `<Quiz>` ConcepTest — puck coasting at constant v on frictionless ice, net
  force = 0 (distractors = documented misconceptions). Re-quiz kinematics (spacing).
  Wire `onCorrect` → `complete()`.
- **presentation split:** TextbookView = full chapter (pretest → model → compare → equilibrium
  → prose naming the misconception → check). SlideView = one beat per screen.
- **source:** Newton I; equilibrium ΣF=0. **requires:** kinematics.
- **file:** src/lesson/lectures/first-law.tsx.
