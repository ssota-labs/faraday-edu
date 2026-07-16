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

## From interaction to chapter

One interaction ≠ one lesson. A lesson is a **textbook chapter**: its goal is
the concept, and each interaction is one instrument in the explanation. For a
substantial concept, design 2–4 interactions of *different kinds* that attack it
from different angles — typically:

- a **manipulable model** (the aha-revealing knob, per the method above),
- a **quantitative view** — a real `<Chart>` of the relationship (a plotted
  function or data measured *from* the simulation), because seeing the curve is
  a different understanding than feeling the knob,
- where it fits, a **stepped walkthrough** (process), a **`<Compare>`**
  (cases), or a **`<CodeCell>`** (audience codes / concept is algorithmic).

Then write the chapter *around* them: every interaction is preceded by prose
that sets up what to look for and followed by prose that interprets what was
seen; the formal statement of the idea lands in `<TeX>` between the intuition
and the quantification. Two interactives never sit adjacent. (Rubric:
[quality-bar.md](quality-bar.md).)

## Patterns by concept type

| Concept is… | Interaction | Blocks |
|---|---|---|
| a process / algorithm | step through precomputed frames | `useStepper` + `<Scrubber>` in a `<Workbench>` |
| a relationship / function | turn knobs, watch it respond | `<ParamSlider>`/`<Segmented>` + `<Chart>`/SVG |
| a comparison of cases | flip between them side by side | `<Compare>` |
| something spatial | rotate/inspect in 3D | `<Scene3D>` + helpers (a `mood` is mandatory) |
| an emergent / statistical effect | run many samples, measure the result | physics or a many-sample sim; **read state back out** to a `<Chart>` |

## Craft — make it feel alive, not form-driven

Designing *what* the learner manipulates is half the job; the other half is the
feel (graded by quality-bar.md Surface 3). Rules of thumb:

1. **Put the control ON the thing.** If the variable has a natural home in the
   scene — a position, an angle, a vector, a boundary — the learner drags THAT
   (`useSvgDrag` from `src/lesson/sim2d` gives viewBox-coordinate dragging in
   one line; add `cursor="grab"`, a visible handle, and a hover response).
   Placement hierarchy: object > canvas-overlay (Workbench `hud` takes buttons —
   Play/Pause, presets, mode toggles) > side panel (secondary/numerous
   parameters only). `<Workbench>` without `controls` renders the canvas
   full-width — a panel is not mandatory. **If the draggable object is itself in
   motion** (a handle on a body that translates under `useSimLoop`), pause the
   motion while the learner drags — grabbing a moving target is fiddly — and
   resume on release.
2. **Never teleport.** Route discrete changes (selection, step, mode, reset)
   through `useAnimatedValue(target)` — render from the animated value and the
   change eases instead of snapping. Continuous input (drag, slider) maps
   directly — no easing lag between hand and object.
3. **Keep dynamic concepts moving.** If the concept has time in it (orbits,
   waves, populations, flows), drive it with `useSimLoop(dt => …, playing)` and
   give the learner Play/Pause in the `hud`. A dead still of a moving system
   reads as a diagram, not a model. **Always advance the simulation by the `dt`
   the loop hands you (seconds) — `t + dt`, `v + a*dt` — never a fixed per-frame
   constant like `t + 0.02`.** A constant step ties the motion to the frame rate:
   it stutters under load and runs at different speeds on 60 Hz vs 120 Hz. (`dt`
   is real elapsed seconds, clamped for tab-switch jumps.)
4. **Emphasize the delta.** When something changes, foreground it — a highlight,
   a trail, a pulse on the readout that moved. The learner should never hunt
   for what their action did.
5. **Show affordances.** Grabbable = handle + `cursor-grab` + hover glow;
   clickable = looks like a button. If everything is flat decoration, the
   interaction is invisible — a one-line on-canvas hint ("drag the tip") is the
   backup, not the primary signal.

## Anti-patterns

- A control that changes nothing meaningful — motion without consequence.
- Decoration that doesn't map to the concept (pretty, but not teaching).
- So many knobs the learner can't tell which one carries the idea.
- A quiz answerable from the prose alone — it tests reading, not the interaction.
- A page built *for* one interaction, with prose reduced to captions — that's a
  demo, not a lesson.
- A `<Stat>` card strip reflexively dumped under every figure — live numbers go
  in the Workbench `hud` overlay.
- A slider row as the ONLY interface to a scene with grabbable objects — drag
  the object; keep sliders for handle-less quantities.
- State that snaps between arrangements with no transition, or a "Run" that
  swaps in a finished picture when the concept is a process.

## The interaction must be *true*

A concept-revealing interactive that shows the *wrong* behaviour teaches the
misconception. Procedural helpers are approximations, not simulators — if the
lesson's point is the quantitative behaviour, model the real relationship yourself
and **verify it against the concept** (spot-check a value/invariant). This is where
interactive design meets "verify it teaches the right thing" in SKILL.md.

## Then build

Assemble it from [blocks.md](blocks.md) and `<Course>` when bundling chapters.
Make it look clear with [design.md](design.md).
