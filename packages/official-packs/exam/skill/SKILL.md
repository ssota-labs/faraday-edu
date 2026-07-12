# Pack: `exam` — build a practice test / mock exam (index)

Load this when the goal is **assessment across a topic** — a practice test or mock
exam that measures mastery — not teaching one concept. This is the folder skill's
**front door**: it routes to the sub-guides; open the one for the step you're on.

## When it fits

Use `exam` when the outcome is *"can the learner demonstrate the whole unit?"* —
diagnostics, chapter/section tests, board/cert prep, end-of-course exams. For
teaching a single idea, stay with a lesson + its inline `<Quiz>`; for spaced
memorization use the `srs` pack.

## The method, in four moves (open each guide as you reach it)

1. **Blueprint first** — [blueprint.md](blueprint.md). Decide *what* the exam
   measures (outcomes × weight × item count) before writing a single item.
2. **Write honest items** — [item-writing.md](item-writing.md). Pick each item's
   form by the outcome verb; write distractors from real misconceptions.
3. **Score & review** — [scoring-feedback.md](scoring-feedback.md). Report a
   result the learner can act on; a post-exam review that *teaches* beats a bare %.
4. **Keep it fair** — [integrity.md](integrity.md). No answer leaks, sensible
   randomization, accessible timing.

## Build surface (composes existing blocks)

An exam is a sequence of the assessment blocks the runtime already ships —
`<Quiz>` (MCQ), `<NumericAnswer>` (compute), `<Challenge>` (do-it missions) —
grouped into sections per the blueprint, usually inside a `<Paged>` (one item per
screen) or a `<Course>` (sections as chapters). No new dependencies. Gate the
final "score" node on completion, and put the review after submission.

## Quality gate

See [../quality.md](../quality.md). The bar: every item traces to a blueprint
outcome, distractors are real misconceptions, and the exam ends in an actionable
review — not just a number.
