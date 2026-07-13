# friction — Friction: static & kinetic

- **outcome:** The learner can compute the maximum static friction (μ_s N) and kinetic
  friction (μ_k N), and predict the "break-away then slip" behaviour (compute verb).
- **interaction:** (1) Direct-manipulation model — drag an applied-force handle on a block
  on a horizontal surface (`useSvgDrag`); static friction matches the pull (f_s = F_app)
  up to μ_s N, then the block breaks free and kinetic friction μ_k N (< μ_s N) takes over,
  the block accelerates (`useRafLoop`). (2) `<Chart>` friction force vs applied force (rises
  on y=x to the peak, drops to the μ_k N plateau) — the quantitative claim. (3)
  `<Derivation>` f_s ≤ μ_s N and f_k = μ_k N from N = mg on the flat.
- **check:** `<NumericAnswer>` — m=5.0 kg, μ_s=0.5, g=9.8: minimum force to start it
  moving? answer 24.5 N. Wired to complete(). Re-quiz second-law (spacing).
- **source:** Coulomb friction. Spot: 0.5·5·9.8 = 24.5 N. **packs:** map2d.
- **requires:** second-law. **file:** src/lesson/nodes/friction.tsx. **status:** verified
