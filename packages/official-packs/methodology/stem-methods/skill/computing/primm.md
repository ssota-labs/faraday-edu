# PRIMM — Predict, Run, Investigate, Modify, Make

**PRIMM** (Sentance et al.) structures intro programming: **Predict** what code
does → **Run** it → **Investigate** discrepancies → **Modify** → **Make** new
programs. It separates reading code from writing code and builds mental models
before syntax fluency.

## When to use

- Intro programming (Python, JS, Java…) in secondary or undergrad
- Any unit teaching **reading and tracing** before authoring
- Pairs with `executable` family heavily

## Unit arc

| Phase | Learner does | Block families |
|---|---|---|
| **Predict** | State output/behavior before run | **Check** (trace MCQ, output prediction) |
| **Run** | Execute; compare to prediction | **Executable** |
| **Investigate** | Explain gap; line-by-line reasoning | **Narrative** prompts + **check** |
| **Modify** | Small controlled edits | **Executable** (starter code) |
| **Make** | New program from spec | **Executable** + **check** (test cases) |

## Rules

- Predict is **mandatory** and locked before Run — same discipline as POE.
- Modify tasks change **one concept at a time** (condition, loop bound, type).
- Make phase uses autogradable or clear **check** test cases when possible.

## Anti-patterns

- Run-first with no prediction (passive code demo).
- Make = copy-paste the solution from Investigate with renamed variables.
