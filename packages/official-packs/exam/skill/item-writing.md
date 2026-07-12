# Move 2 — Write honest items

Form follows the outcome verb (same rule as the base `assessment` reference):

- **recognize / recall** → `<Quiz>` (MCQ). One unambiguously correct option.
- **compute / derive** → `<NumericAnswer>` (typed value + tolerance). No guessing
  from options.
- **do / apply** → `<Challenge>` (a mission cleared in a sim/interactive).

Rules that separate a real exam from a quiz dump:

- **Distractors are documented misconceptions**, not filler. Each wrong MCQ option
  should be the answer a learner with a *specific* wrong model would pick. If you
  can't name the misconception, it's filler — cut it.
- **One construct per item.** Don't test reading comprehension when you mean to
  test the concept; keep stems short and unambiguous.
- **No trick items, no "all/none of the above"** as a crutch, no negatives in the
  stem without bolding.
- **Numeric items state units and tolerance.** "≈ 3.14 (±0.01)" not "3.14".
- **Spread difficulty** across the blueprint's items; don't stack all hard items in
  one section.

→ **Faraday:** write each item's `hint` as feed-forward for the *review* (not shown
during the exam) — it names the misconception the distractor represents, so the
post-exam review can teach.
