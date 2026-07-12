# Learning path — turn a roadmap into a progression that keeps learners going

A roadmap says *what order*. A learning path says *how the learner advances and why
they keep coming back*. Design the progression, don't just list lessons.

The defaults here (mastery gates, retrieval-based checks, spaced re-quizzing) are
the evidence-backed moves from the `lecture-design` pack — the creator's own
assessment style overrides them.

## The levers Faraday gives you

- **Unlock gates (`requires`)** — the prerequisite graph *is* your pacing. Gating the
  next node on the prior means a learner meets ideas in a supported order, never lost.
- **Mastery to advance** — wire the node's check so it completes on *demonstrated
  understanding*, not a click: `<Quiz onCorrect={complete} />` (from
  `useNode()`), so the next node unlocks only when the learner passes. This turns a
  roadmap into a **mastery-based** path. (Manual "Finish" stays as a fallback.)
- **Levels / tiers** — group nodes into stages (e.g. *foundations → applied →
  challenge*). Show them as map regions or course sections, and **ramp difficulty**
  across tiers. A tier's final node can be a boss-style challenge that gates the next
  tier.
- **Continuity (coming back)** — the biggest risk is drop-off. Reduce it with: a
  visible roadmap that always shows a clear "next"; **LMS progress**
  (`useLmsRecorder` → `<ProgressDashboard>`, see [worlds.md](worlds.md)) so returning
  learners see where they are; node `reward.xp` for momentum.

## Design method

For each node, decide the three things that make a progression coherent:

1. **Entry** — what must be complete before this unlocks (`requires`). Keep
   prerequisites *real* — only gate on things genuinely needed.
2. **Mastery** — what "got it" means here, expressed as the check that fires
   `complete()`. Make the check *diagnostic*: passable only if the learner understood
   the interaction, not by guessing.
3. **Exit** — what completing this unlocks, and whether it advances a tier.

Then tune the **difficulty ramp**, within a lesson and across the path: start with a
guided/worked example, then let the learner drive, then a challenge. Across tiers,
raise the bar deliberately.

## Keep gates honest

- A gate that's trivial to pass teaches nothing; a gate that's a wall frustrates.
  Aim for a check the target learner passes *after* engaging, not before and not never.
- **Assessment integrity:** if the lesson has a tutor, it must not leak quiz/exercise
  answers (the tutor is scaffolded Socratic and grounded — keep it that way; see
  [tutor.md](tutor.md)). A mastery gate the learner can talk their way past isn't a gate.

## Build it

`requires`, `useNode().complete()`, `<Quiz onCorrect>`, node `reward`, and the LMS
recorder/dashboard are all in [worlds.md](worlds.md). Design the individual
checks/interactions with [interactive-design.md](interactive-design.md).
