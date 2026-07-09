# Interactive design — design the interaction that reveals a concept

The whole point of Faraday is that the learner *does* the idea instead of reading it.
That only works if the interaction is designed around the concept. Do this **before**
reaching for the block API — the blocks are how you build it, not what to build.

## The core question

**What should the learner manipulate, and what should visibly change, so the concept
becomes obvious?** If you can't answer that, you're not ready to author.

## Method

1. **Name the "aha" (or the misconception).** The one thing that's hard to see from
   static text — the thing this interactive exists to make visible. E.g. "binary
   search only works because the array is sorted"; "compounding frequency matters
   less than you'd think"; "a sorted-by-X list isn't sorted by Y."
2. **Pick the manipulable variable.** The knob, step, or input that — when the learner
   moves it — makes the aha appear. One primary variable is usually enough; too many
   knobs hide the point.
3. **Decide what changes in response, and how it maps to the concept.** The
   representation (a graph, a diagram, a count, a shape, a path) must move in a way
   that *is* the concept — not decoration next to it. If moving the knob doesn't
   visibly teach, redesign.
4. **Choose the shape** (see [blocks.md](blocks.md) "Two shapes"):
   - **Stepped** — the idea is a *sequence of moments* (an algorithm, a proof, a
     process). Precompute frames; walk with `useStepper` + `<Scrubber>`.
   - **Continuous** — the idea is a *live relationship* (a function, a parameter's
     effect). Hold params in state; `useMemo` the visual; drive with
     `<ParamSlider>`/`<Segmented>`.
5. **Add the check and the takeaway.** A `<Quiz>` that's only answerable if they
   engaged with the interaction (not from the prose), and a `<Callout>` naming the aha.

## Patterns by concept type

| Concept is… | Interaction | Blocks |
|---|---|---|
| a process / algorithm | step through precomputed frames | `useStepper` + `<Scrubber>` in a `<Workbench>` |
| a relationship / function | turn knobs, watch it respond | `<ParamSlider>`/`<Segmented>` + `<Chart>`/SVG |
| a comparison of cases | flip between them side by side | `<Compare>` |
| something spatial | rotate/inspect in 3D | `<Scene3D>` + helpers (a `mood` is mandatory) |
| an emergent / statistical effect | run many samples, measure the result | physics or a many-sample sim; **read state back out** to a `<Chart>` |

## Anti-patterns

- A control that changes nothing meaningful — motion without consequence.
- Decoration that doesn't map to the concept (pretty, but not teaching).
- So many knobs the learner can't tell which one carries the idea.
- A quiz answerable from the prose alone — it tests reading, not the interaction.

## The interaction must be *true*

A concept-revealing interactive that shows the *wrong* behaviour teaches the
misconception. Procedural helpers are approximations, not simulators — if the
lesson's point is the quantitative behaviour, model the real relationship yourself
and **verify it against the concept** (spot-check a value/invariant). This is where
interactive design meets "verify it teaches the right thing" in SKILL.md.

## Then build

Assemble it from [blocks.md](blocks.md) (single lesson) / [worlds.md](worlds.md)
(3D, course, world). Make it look clear with [design.md](design.md).
