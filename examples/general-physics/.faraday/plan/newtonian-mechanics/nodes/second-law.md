# second-law — Newton's 2nd law: F = ma

- **outcome:** The learner can compute any one of F, m, a given the other two, and
  predict how acceleration scales with force (∝F) and mass (∝1/m) (compute verb).
- **interaction:** (1) Direct-manipulation model — drag the force-vector arrow tip on a
  block (`useSvgDrag`); the block's acceleration and its motion (`useRafLoop`) respond
  live; mass on a slider. (2) `<Chart>` a vs F (line, slope 1/m) — quantitative claim.
  (3) `<Derivation>` a = F/m from F = ma; `<Compare>` fixed-F vs fixed-m.
- **check:** `<NumericAnswer>` — net force 12 N on a 3.0 kg cart, acceleration? answer 4,
  unit m/s². Wired to complete(). Re-quiz first-law (spacing).
- **source:** Newton II, ΣF = ma. Spot: 12/3 = 4 m/s². **packs:** map2d.
- **requires:** first-law. **file:** src/lesson/nodes/second-law.tsx. **status:** verified
