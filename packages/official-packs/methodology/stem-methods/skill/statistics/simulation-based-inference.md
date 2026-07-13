# Simulation-based inference

**Simulation-based inference** teaches p-values, confidence intervals, and
hypothesis tests by **building sampling/null distributions through simulation**
(randomization, bootstrap) before (or instead of) closed-form formulas (Cobb
2007; ISI curriculum; strong results in conceptual understanding).

## When to use

- Intro inference units (perm tests, bootstrap CI, null distributions)
- Learners who need *why* the formula works, not only when to plug in
- Pairs with GAISE for full stats courses; this method is the **inference arc**

## Unit arc

| Phase | Learner does | Block families |
|---|---|---|
| **Statistic in context** | Choose a measure for a real question | **Narrative** + **data** + **check** |
| **Simulate null / resample** | Build distribution by many repeats | **Executable** (sim loop) + **data** (histogram) |
| **Locate observed** | Compare observed stat to simulated distribution | **Data** + **check** (proportion as extreme) |
| **Formalize** (optional) | Name p-value, CI, SE with reference to sim | **Formalism** (`Reveal`), link back to **data** |
| **Transfer** | New scenario; choose sim vs formula | **Check** + **executable** |

## Rules

- Always **show the distribution** (data family) — the sim is the explanation.
- One parameter change at a time when building intuition (sample size, effect size).
- Formalize only after the learner has *seen* the randomization story.

## Anti-patterns

- Simulation as black-box animation with no learner-controlled reps.
- Jumping to z-scores with no sampling distribution concept.
