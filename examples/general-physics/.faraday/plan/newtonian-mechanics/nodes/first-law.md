# first-law — Newton's 1st law: inertia & equilibrium

- **outcome:** The learner can state that zero net force ⇒ constant velocity (rest is a
  special case) and identify equilibrium; distinguishes "needs a force to keep moving"
  (impetus misconception) from the correct view (recognize/distinguish verb).
- **interaction:** (1) ConcepTest pretest MCQ (frictionless puck) — commit first.
  (2) Continuous model — a puck on a surface; toggle friction on/off, tap "Kick" to apply
  a brief force (`useRafLoop`); with friction off the puck coasts forever, with friction on
  it decays. (3) `<Compare>` of the two cases + an equilibrium free-body (hanging sign,
  ΣF=0) as an SVG `<Stage>`.
- **check:** `<Quiz>` ConcepTest — puck coasting at constant v on frictionless ice, net
  force = 0 (distractors = documented misconceptions). Re-quiz kinematics (spacing).
- **source:** Newton I; equilibrium ΣF=0. **packs:** map2d. **requires:** kinematics.
- **file:** src/lesson/nodes/first-law.tsx. **status:** verified
