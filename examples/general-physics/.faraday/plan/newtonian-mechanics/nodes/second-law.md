# second-law — Newton's 2nd law: F = ma

- **outcome:** Compute any one of F, m, a given the other two, and predict how acceleration
  scales with force (∝F) and mass (∝1/m) (compute verb).
- **interactions (shared across both views):**
  1. **Direct-manipulation model** — drag the force-vector arrow tip on a block
     (`useSvgDrag`); the block's acceleration and its motion (`useRafLoop`) respond live;
     mass on a `<ParamSlider>`. Grab the vector, not a detached slider (Surface 3).
  2. `<Chart>` a vs F (line, slope 1/m) — the quantitative claim.
  3. `<Derivation>` a = F/m from ΣF = ma; `<Compare>` fixed-F vs fixed-m.
- **check:** `<NumericAnswer>` — net force 12 N on a 3.0 kg cart, acceleration? answer **4**,
  unit m/s², tolerance 2%. Wired to `complete()`. Re-quiz first-law (spacing).
- **presentation split:** TextbookView = full chapter; SlideView = one beat per slide (drag
  the force → the a-vs-F line → derivation → the numeric check).
- **source:** Newton II, ΣF = ma. Spot: 12/3 = 4 m/s². **requires:** first-law.
- **file:** src/lesson/lectures/second-law.tsx.
