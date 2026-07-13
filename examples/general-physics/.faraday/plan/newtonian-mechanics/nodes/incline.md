# incline — Forces on an incline (application, join node)

- **outcome:** The learner can resolve gravity into components on a ramp (mg sinθ along,
  mg cosθ normal) and find the critical slip angle θ_c = arctan(μ_s) — and do it: tilt the
  ramp to the angle where the block just releases (do/achieve verb).
- **interaction:** (1) ConcepTest pretest — does a heavier block slip at a smaller angle?
  (No — θ_c is mass-independent.) (2) Direct-manipulation model — drag the ramp to set θ
  (`useSvgDrag`); a live free-body diagram draws the weight, normal, and friction vectors
  scaled to real magnitudes; the block stays put while μ_s mg cosθ ≥ mg sinθ, then slides
  (`useRafLoop`) once θ>θ_c. (3) `<Chart>` of driving force mg sinθ vs max static μ_s mg cosθ
  across θ, crossing at θ_c. (4) `<Derivation>` ending at θ_c = arctan(μ_s).
- **check:** `<Challenge>` mission — "tilt the ramp to the critical angle so the block just
  begins to slide" (visible target band at θ_c); done latches when the block releases within
  tolerance of θ_c. Wired to onDone→complete(). Re-quiz friction (spacing MCQ).
- **source:** incline decomposition; θ_c=arctan(μ_s), mass-independent. Spot: μ_s=0.5 ⇒
  θ_c=26.57°. **packs:** map2d. **requires:** third-law, friction.
- **file:** src/lesson/nodes/incline.tsx. **status:** verified
