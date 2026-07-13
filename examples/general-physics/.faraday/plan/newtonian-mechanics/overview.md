# Plan — Newtonian mechanics (intro undergrad)

## Brief

- **Audience:** Undergraduates in an intro general-physics course (algebra/calculus-lite),
  no prior mechanics mastery assumed. Audience gate → **Peer Instruction** (Mazur):
  committed ConcepTest prediction with misconception distractors → the model resolves
  it → prose names the misconception. Real units, `<Reveal>` for full derivations,
  `<NumericAnswer>` for quantitative closes.
- **Goal (outcome):** After the unit a learner can (a) read position→velocity→acceleration
  relationships and compute with the constant-acceleration equations; (b) apply Newton's
  three laws — inertia/equilibrium, F=ma, action-reaction — to force problems; and (c)
  combine them to analyze friction on an incline (find the critical slip angle).
- **Scope:** one 6-node **unit** → `<CourseHost>` + `map2dPack` (immersive 2D map).
- **Source:** standard general-physics canon (no creator artefact supplied). Physics is
  well-established; every quantitative claim is derived here and spot-checked by hand —
  nothing left unverified.
- **Methodology:** `audience` pack → Peer Instruction (undergrad row). `lecture-design`
  five moves underneath: backward design, prerequisite-gated graph, generative
  interaction, spaced retrieval (each node re-quizzes an earlier idea), feed-forward hints.

## Pack decisions

- **map2d** — used, as the course presentation (`map2dPack`). Immersive game screen.
- **audience**, **lecture-design** — design-time methodology packs (not runtime).
- **three / physics / tutor** — NOT used. Newtonian mechanics at this level is fully
  served by 2D SVG + `useRafLoop` scripted motion; no genuine 3D or rigid-body engine is
  needed, and the checks are all recognize/compute/do (no open-ended outcome), so a tutor
  would be scope creep (quality-bar Surface 4). These packs are not installed in this app.

## Prerequisite graph & sequence

```
kinematics ──▶ first-law ──▶ second-law ──▶ third-law ─┐
                                     └────▶ friction ──┴─▶ incline
```

- Spine: kinematics → first-law → second-law.
- **Branch** (parallel, learnable in either order): `third-law` and `friction`, both from
  `second-law`.
- **Join:** `incline` requires **both** `third-law` and `friction`.

Map layout (`meta.{x,y}`, 0..100) reads left→right, branch above/below the spine:
kinematics (10,50) · first-law (28,50) · second-law (46,50) · third-law (68,28) ·
friction (68,72) · incline (88,50).

## Node index

| id | title | requires | check (form) | packs | status |
|----|-------|----------|--------------|-------|--------|
| kinematics  | Motion: position, velocity, acceleration | — | numeric (compute displacement) | map2d | verified |
| first-law   | Newton's 1st law: inertia & equilibrium | kinematics | MCQ (ConcepTest) | map2d | verified |
| second-law  | Newton's 2nd law: F = ma | first-law | numeric (compute a) | map2d | verified |
| third-law   | Newton's 3rd law: action–reaction | second-law | MCQ (ConcepTest) | map2d | verified |
| friction    | Friction: static & kinetic | second-law | numeric (compute max static) | map2d | verified |
| incline     | Forces on an incline (application) | third-law, friction | mission (`<Challenge>` critical angle) | map2d | verified |

## Spot-checked values (truth checks)

- kinematics: from rest, a=3.0 m/s², t=5 s → v=15 m/s, Δx=½·3·25=**37.5 m**.
- second-law: F=12 N, m=3 kg → a=F/m=**4 m/s²**.
- friction: m=5 kg, μ_s=0.5, g=9.8 → f_s,max = μ_s m g = 0.5·5·9.8 = **24.5 N**.
- third-law: equal-and-opposite forces, unequal masses → speed ratio = inverse mass ratio.
- incline: block slips when tanθ>μ_s ⇒ θ_c = arctan(μ_s); μ_s=0.5 → θ_c=**26.57°**
  (mg sinθ_c = μ_s mg cosθ_c ✓, mass-independent).

## Assembly

- Each node lesson lives in its own file `src/lesson/nodes/<id>.tsx` (export default).
- Module-scope `curriculum` object assembled in `src/lesson/lesson.tsx`, rendered by
  `<CourseHost course={curriculum} pack={map2dPack} />` (import `map2dPack` from
  `./map2d`). Every node carries `summary`, `reward.xp`, `meta.{x,y}`, `requires`.
