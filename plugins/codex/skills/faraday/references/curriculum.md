# Curriculum — decompose a subject into a sequenced roadmap

When the creator wants more than one lesson — a unit, a course, a learning roadmap —
design the structure *before* building any lesson. Reshaping an outline is cheap;
rebuilding lessons is not. Produce a roadmap the creator signs off on, then build.

If the creator brought their own method or sequence, it leads. Otherwise this method
implements the default's "design backward" and "prerequisite graph" moves — see
the `lecture-design` pack for the evidence.

## Method

0. **Fix the outcomes first (backward design).** Before structuring content, write
   what the learner should be able to *do* after, and what would prove it. Each
   outcome will become a node (or tier) plus its check — designed **before** the
   lesson bodies. Cut anything that maps to no outcome.
1. **Inventory the concepts.** From their material (see [discovery.md](discovery.md)),
   list the atomic ideas — one "aha" each. Err toward too many; you'll merge later.
   For complex integrated skills (projects, diagnosis, troubleshooting), consider
   structuring around whole tasks ordered simple→complex instead of a topic list
   (see the lecture-design pack on 4C/ID).
2. **Map dependencies.** For each idea, ask "what must the learner understand first?"
   These prerequisite edges are the backbone of the roadmap. This is the highest-value
   step — it's what a flat table of contents lacks.
3. **Chunk into lessons.** Faraday's grain is **one idea per lesson**. Split a node
   that carries two "ahas"; merge two nodes that can't stand alone.
   - *Too big* if: it needs more than one interactive to land, or you can't write a
     single check that proves it.
   - *Too small* if: it can't stand alone with its own interaction + check.
4. **Sequence.** Topologically order by dependency. Surface **parallel branches**
   (things learnable in any order) and **join nodes** (need several prerequisites) —
   these make a roadmap richer than a straight line.
5. **Pick the shape:**
   - a **linear** sequence → `<Course>` (chapters, prev/next, hash routing).

## Visualize the roadmap and get sign-off — before building lessons

Don't silently build 12 lessons off an outline in your head. Make the roadmap
**visible and confirmable** first, using whichever fits:

- a **dependency outline / tree** (or a quick diagram) the creator can read and edit;
- or **scaffold `<Course>` with stub chapters** (title + one line each) so they
  literally see the sequence, then fill lessons in after they approve the structure.

Iterate on the *structure* with the creator here — reorder, split, merge, rename —
while it's still cheap. Only then build the real lessons.

## Persist the plan, then build lesson-by-lesson

A multi-lesson curriculum is a **long-running task** — don't hold it all in one
context. Once the roadmap is signed off, write it to `.faraday/plan/<plan-id>/`
(a node table + one brief file per node) and build the lessons against that
persisted plan, one clean sub-agent per node, resuming from the plan on any reset.
This — plan persistence, per-lesson isolation, the sub-agent loop — is
[orchestration.md](orchestration.md). (Scaffolding first is a prerequisite, since
design reads packs; see the order there.)

## Then build it

Implement the chosen shape with `<Course>` from `@faraday-academy/kit/runtime`.
Turn the roadmap into an actual *progression* (levels, mastery gates, continuity)
with [learning-design.md](learning-design.md).
