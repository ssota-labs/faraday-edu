# Assessment — pick the check by what the learner should be able to DO

A multiple-choice quiz is one instrument, not the definition of assessment. The
check's **form must match the outcome verb** you wrote in backward design
(the `lecture-design` pack move 1): if the outcome says *compute*, a
recognition MCQ under-tests it; if the outcome says *do/tune/achieve*, only a
performance mission proves it. Mismatched form is a quality-bar fail.

## The five forms (and their components)

| Outcome verb | Form | Component | Grading |
|---|---|---|---|
| recognize, distinguish, recall | **Recognition MCQ** — distractors are the documented misconceptions, never filler | `<Quiz>` | auto (choice) |
| calculate, derive, estimate, read off | **Free numeric response** — they type the number; tolerance makes rounding fair | `<NumericAnswer answer tolerance? unit?>` | auto (tolerance) |
| predict, visualize, construct | **Sketch-predict** — draw the expected curve/construction (pen/pencil/touch), then reveal the true overlay and self-assess against it | `<SketchPad prompt background? overlay onSelfAssess>` | self, against the revealed answer |
| do, tune, build, achieve, optimize | **Performance mission** — clear a goal state INSIDE the interactive (hit the target, balance it, reach the threshold) | `<Challenge goal done hint? onDone>` wrapping the sim | auto (win condition from sim state) |

Component notes:

- `<NumericAnswer>` — default tolerance is 2% of the answer; set it explicitly
  when precision matters. `hint` is feed-forward ("re-run the sim at n=1", not
  "wrong"). Wire `onCorrect` to `useNode().complete()` for gates.
- `<SketchPad>` — the pedagogy is *commit before seeing*: sketching a
  prediction then comparing against the revealed overlay is the feedback
  (there is no ML grading; don't pretend otherwise). Give it the same
  `background` scene the interactive uses so the sketch happens in context.
  Great on tablets (Apple Pencil pressure is honored).
- `<Challenge done>` — you compute the win condition from your sim state
  (`done={landed && Math.abs(x - target) <= 3}`); it latches on first success
  and fires `onDone` once. Add a visible target/goal INTO the scene (a flag, a
  zone) — a mission against an invisible goal is a guessing game.
- Every form supports feed-forward hints. Use them; bare "wrong" is a
  quality-bar fail (the `lecture-design` pack move 5).

## The flow: concept → instrument → check, per section

A chapter is a chain of sections, and each section closes its own loop
([interactive-design.md](interactive-design.md)):

1. **Open the chapter with a pretest** — a prediction the learner commits to
   before instruction (an MCQ or a `<SketchPad>` prediction — sketch-predict
   IS pretesting in visual form).
2. **Each section:** prose sets up → the interactive lets them *do* the idea →
   a **formative check** right there, in the form the section's verb demands
   (a ConcepTest MCQ after a comparison; a `<NumericAnswer>` after a
   quantitative model; a mini `<Challenge>` inside the sim they just used).
3. **Close the chapter with the summative gate** — the check that proves the
   node's outcome, wired to `complete()`. Prefer the *strongest* form the
   outcome supports: a `<Challenge>` or `<NumericAnswer>` gate over an MCQ
   when the verb allows it. Re-quiz one earlier idea while you're at it
   (spacing — the `lecture-design` pack move 4). In a standalone lesson
   (no `<Course>`) there is no gate to wire — the summative check
   still closes the chapter; just leave `onCorrect`/`onDone` off.

Mixing forms within a lesson is the norm, not the exception: a typical solid
chapter runs pretest-MCQ → mission → numeric → summative gate.

## Audience defaults (the `audience` pack rows)

- **Children / CRA** — missions first (`<Challenge>`: "make the bulb exactly
  this bright"), picture-anchored MCQs; no numeric typing before the symbols
  page; sketch works if the ask is concrete ("draw where it lands").
- **Secondary / 5E** — sketch-predict in Engage, mission in Explore/Elaborate,
  MCQ + numeric in Evaluate. The full mix.
- **Undergrad / Peer Instruction** — ConcepTest MCQs (misconception
  distractors) as the rhythm; `<NumericAnswer>` for the quantitative closes;
  missions for design-flavored problems.
- **General public / Mayer** — light touch: prediction MCQs framed as "check
  your intuition", one gentle mission; avoid numeric homework feel.
- **Professionals / Merrill** — the summative check IS the job task: a
  `<Challenge>` on realistic inputs ("size the resistor, ship it"), numeric
  answers with real units; MCQs only for quick concept triage.

## Anti-patterns

- MCQ-only assessment in a lesson whose outcomes say compute/do/predict.
- A quiz answerable from the prose alone (tests reading, not understanding).
- A `<Challenge>` whose goal state isn't visible in the scene.
- Sketch tasks graded as if machine-checked — the overlay comparison is the
  grading; be honest about it.
- Gating `complete()` on the weakest check in the lesson.
