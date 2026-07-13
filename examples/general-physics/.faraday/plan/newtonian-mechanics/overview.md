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
- **Scope:** one 6-lecture **Course** → `<CourseHost>` + `map2dPack` (immersive 2D map
  course shell).
- **Source:** standard general-physics canon (no creator artefact supplied). Physics is
  well-established; every quantitative claim is derived here and spot-checked by hand —
  nothing left unverified.
- **Methodology:** `audience` pack → Peer Instruction (undergrad row). `lecture-design`
  five moves underneath: backward design, prerequisite-gated graph, generative
  interaction, spaced retrieval (each lecture re-quizzes an earlier idea), feed-forward hints.

## Terminology (v0.2 — this build showcases it)

```
Curriculum (this app)
  └── Course  = "Newtonian Mechanics" (6 lectures + prereq graph)   ← map2d course shell
        └── Lecture = one topic (e.g. "2nd Law · F = ma")
              └── Presentation views (learner picks a tab):
                    ├── SlideView    → <SlideDeck>     (class / one beat per screen)
                    └── TextbookView → <TextbookView>  (self-study / dense scroll)
```

**Every lecture is authored as a `<Lecture views={[slide, textbook]}>`** — the headline
demo of PR #18. The *course shell* (`map2dPack`, lecture-to-lecture navigation) and the
*lecture presentation* (slide/textbook, within one lecture) are deliberately kept
separate, matching `specs/terminology.md`.

## Pack decisions

- **map2d** (`course/`) — the course shell (`map2dPack`). Immersive game screen.
- **slide-view + textbook-view** (`lecture/`) — the two presentation views every
  lecture offers. `<SlideDeck>` (runtime block) + `<TextbookView>` (copied to
  `src/lesson/textbook-view/`).
- **audience**, **lecture-design** (`methodology/`) — design-time only (not runtime).
- **three / physics / tutor** — NOT used. Newtonian mechanics at this level is fully
  served by 2D SVG + `useRafLoop` scripted motion; the checks are all
  recognize/compute/do (no open-ended outcome), so a tutor would be scope creep
  (quality-bar Surface 4). These packs are not installed in this app.

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

## Lecture index

| id | title | requires | check (form) | status |
|----|-------|----------|--------------|--------|
| kinematics  | Motion: position, velocity, acceleration | — | numeric (compute displacement) | planned |
| first-law   | Newton's 1st law: inertia & equilibrium | kinematics | MCQ (ConcepTest) | planned |
| second-law  | Newton's 2nd law: F = ma | first-law | numeric (compute a) | planned |
| third-law   | Newton's 3rd law: action–reaction | second-law | MCQ (ConcepTest) | planned |
| friction    | Friction: static & kinetic | second-law | numeric (compute max static) | planned |
| incline     | Forces on an incline (application) | third-law, friction | mission (`<Challenge>` critical angle) | planned |

## Spot-checked values (truth checks)

- kinematics: from rest, a=3.0 m/s², t=5 s → v=15 m/s, Δx=½·3·25=**37.5 m**.
- second-law: F=12 N, m=3 kg → a=F/m=**4 m/s²**.
- friction: m=5 kg, μ_s=0.5, g=9.8 → f_s,max = μ_s m g = 0.5·5·9.8 = **24.5 N**.
- third-law: equal-and-opposite forces, unequal masses → speed ratio = inverse mass ratio.
- incline: block slips when tanθ>μ_s ⇒ θ_c = arctan(μ_s); μ_s=0.5 → θ_c=**26.57°**
  (mg sinθ_c = μ_s mg cosθ_c ✓, mass-independent).

## Assembly

- Each lecture lives in its own file `src/lesson/lectures/<id>.tsx` (export default a
  `<Lecture>` component), file-isolated so lectures build independently.
- Module-scope `course: Course` assembled in `src/lesson/lesson.tsx`, rendered by
  `<CourseHost course={course} pack={map2dPack} />` (import `map2dPack` from `./map2d`).
  Every node carries `summary`, `reward.xp`, `meta.{x,y}`, `requires`.
- The graded check inside each lecture wires to `useNode().complete()` so answering it
  completes the map node and unlocks dependents.
