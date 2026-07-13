# kinematics — Motion: position, velocity, acceleration

- **outcome:** Given constant acceleration, the learner can relate x(t), v(t), a and
  compute an unknown with the kinematic equations (compute verb).
- **interaction:** (1) Continuous model — sliders for v₀ and a drive a car on a track;
  a Play button (`useRafLoop`) runs the motion with a fading trail; live Readouts for t,
  x, v in the HUD. (2) `<Chart>` of x(t) (parabola) and v(t) (line) sampled from the
  real model. (3) `<Derivation>` deriving x = x₀ + v₀t + ½at² and v² = v₀² + 2aΔx.
- **check:** `<NumericAnswer>` — from rest, a=3.0 m/s², after t=5.0 s displacement?
  answer 37.5 m, unit m. Diagnostic (must use Δx=½at²). Wired to complete().
- **source:** constant-acceleration kinematics (SUVAT). Spot: a=3,t=5 ⇒ v=15, Δx=37.5.
- **packs:** map2d. **requires:** — . **file:** src/lesson/nodes/kinematics.tsx
- **status:** verified
