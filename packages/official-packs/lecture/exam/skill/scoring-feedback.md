# Move 3 — Score and review (the review is the point)

A bare "72%" teaches nothing. The exam's learning value is the **review** after
submission.

- **Score by blueprint outcome, not just total.** Show the learner *which
  outcomes* they've mastered and which need work ("Conversion 8/8 ✓ · Debugging
  3/8 — review off-by-one"). This maps failures back to what to study.
- **Review each missed item** with the misconception named (from the item's
  `hint`) and a pointer back into the lesson/interactive that teaches it — a
  feed-forward review, not "correct answer: C".
- **Mastery threshold, not ranking.** Gate "pass" on a criterion (e.g. ≥80% and no
  outcome below 50%), consistent with mastery-based progression. Avoid curving.
- **Let them retry** the missed outcomes (optionally with fresh items) — an exam
  that ends learning is a wasted one.

→ **Faraday:** put the score + review on a final node revealed on submit (a
`<Reveal>` or a dedicated results screen); if the exam lives in a curriculum, write
per-outcome results to the `lms` recorder so the dashboard reflects them.
