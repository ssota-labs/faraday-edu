# third-law — Newton's 3rd law: action–reaction

- **outcome:** Identify the action–reaction pair (equal magnitude, opposite direction, on
  DIFFERENT bodies) and explain why equal forces give unequal accelerations for unequal
  masses (recognize/distinguish verb).
- **interactions (shared across both views):**
  1. **ConcepTest pretest** (`<Quiz>`) — truck vs car collision: which force is bigger?
  2. **Model** — two carts/skaters of adjustable mass ratio push off (`useRafLoop`); equal &
     opposite forces, but a = F/m so the lighter one recoils faster; live velocity Readouts
     show mₐvₐ = m_b v_b. Mass ratio via `<ParamSlider>`.
  3. `<Chart>` recoil speed vs mass (∝1/m) tying back to the 2nd law.
- **check:** `<Quiz>` ConcepTest — big truck hits small car: forces are equal & opposite
  (distractors = "truck exerts more", "they cancel"). `onCorrect` → `complete()`.
  Re-quiz second-law (spacing).
- **presentation split:** TextbookView = full chapter; SlideView = one beat per screen.
- **source:** Newton III; pair forces on different bodies; momentum split. **requires:** second-law.
- **file:** src/lesson/lectures/third-law.tsx.
