# The quality bar — what "done" looks like

This is the acceptance rubric for shipped Faraday output. Grade your own work
against it **before** reporting done; a lesson that misses a MUST is not finished,
even if it compiles and renders. The bar is topic-agnostic on purpose — do not
tune output to one demo subject.

The core failure mode is a lesson that's a single gadget with three sentences
around it instead of a solid textbook chapter. Surface 2 grades how the
interactives *feel*.

## Surface 1 — lesson pages (the interactive textbook)

A lesson is a **solid textbook chapter** whose goal is that the learner
*understands the concept* — interactions serve the explanation, not the reverse.
"One gadget + a quiz" is a demo, not a lesson.

MUST:

- **Substantial explanation.** Prose does the teaching: motivation, the idea in
  words, worked reasoning, interpretation of what the interactive shows. Rough
  floor for a course-node lesson at secondary level and up: 4+ `<Prose>`
  sections / ~500+ words — a lesson whose text is a lead + two short paragraphs
  fails. For young children (the CRA row in the audience pack) substance shifts from
  prose to interaction turns: prose is deliberately minimal, but the lesson must
  still carry several distinct teach-and-check moves — thin is still thin.
- **Multiple, different interactions.** A substantial concept gets 2–4
  interactive figures of *different kinds* — e.g. one manipulable model
  (Workbench + controls) **and** one quantitative view (a real `<Chart>` of the
  relationship — a plotted function or measured simulation data), plus a
  stepped walkthrough or comparison where it fits. One interactive is only
  acceptable for a genuinely atomic concept.
- **Prose between interactives.** Every interactive is preceded by text that
  sets up what to look for and followed by text that interprets what was seen.
  Two interactive blocks never sit adjacent.
- **All math is LaTeX.** Every symbolic expression — inline or display — renders
  via `<TeX>`. `<code>` spans, ASCII math (`dA/dt = L/2m`), or unicode-hack
  formulas fail.
- **Central formulas are DERIVED, not decreed.** The lesson's key result
  arrives as the last line of a stepped, justified derivation
  (`<Derivation>` — one line at a time, each move named: "substitute T",
  "divide by m"), connected to what the interactive just showed. A boxed
  formula that appears from nowhere fails. Secondary/background results may
  defer their full derivation to a `<Reveal>`, and results taken on authority
  (a measured constant, a named theorem out of scope) should say so.
- **Quantitative claims get a graph.** If the concept asserts a relationship
  (growth, proportionality, a distribution), plot it — sampled from the *real*
  model, not a sketch.
- **Runnable code where the audience codes.** If the topic is algorithmic or the
  audience is programmers, include a `<CodeCell>` the learner can edit and run.
  Skip it where code would be noise.
- **Readouts are integrated, not stacked.** Live numbers belong in the Workbench
  `hud` overlay or the control panel — not as a strip of stat cards dumped under
  every interactive. (One deliberate `<Stat>` row for a summary moment is fine;
  a reflex row after each figure is not.)
- **Ends with assessment that requires the interaction, in the RIGHT form.**
  The closing check is only answerable by having used the figures, wires to
  `complete()` inside a course, and its form matches the outcome verb:
  recognize→`<Quiz>` (misconception distractors), compute→`<NumericAnswer>`,
  predict→`<SketchPad>`, do/achieve→`<Challenge>` mission. An MCQ closing a
  lesson whose outcome says compute/do/predict under-tests it and fails
  (see assessment.md).
- **The model is true.** Interactives implement the real relationship (verified
  against an independently derived value), not a decorative approximation.

SHOULD:

- A narrative arc: hook → build intuition (interact) → formalize (TeX) →
  quantify (chart) → edge cases / misconception → summary → check.
- `<Callout>` for the one-sentence takeaway; `<Reveal>` for optional depth.
- Consistent color meaning across every figure in the lesson.

Anti-patterns (automatic fail): interaction-first pages where prose exists only
as captions; equations in `<code>`; a `<Stat>` card grid under every figure;
controls that change nothing conceptually; a quiz answerable from the lead
sentence.

## Surface 2 — the interactives themselves (feel, motion, directness)

A correct interactive can still be a *dead* one: a static picture with a form
bolted to the side. The bar for how an interactive **feels**:

MUST:

- **Direct manipulation first.** If the learner's variable lives on an object in
  the scene, they manipulate the OBJECT — drag the planet, drag the vector tip,
  drag the vertex, click the cell — not a detached slider that happens to move
  it. Sliders/panels are for quantities with no natural on-canvas handle
  (counts, rates, toggles). A canvas where *nothing is grabbable* while every
  change routes through a side panel fails.
- **Controls live where the action is** — placement hierarchy: (1) on the object
  (drag handles, click targets), (2) overlaid on the canvas (floating buttons /
  chips — Play, mode toggles, presets), (3) the side panel, only for secondary
  or numerous parameters. The panel is optional, not the default home for
  everything.
- **Nothing teleports.** Discrete state changes (step, mode switch, reset,
  selection) animate continuously — tween/spring the position, ease the color —
  so the eye can track *what became what*. Parameter-driven changes track the
  input within a frame; event-driven changes take a legible transition
  (~150–400ms). A diagram that snaps between arrangements fails.
- **Immediate, emphasized feedback.** The response starts the same frame as the
  input, and the thing that changed is visually foregrounded (highlight, pulse,
  trail) — not just silently different somewhere in the scene.
- **Affordances are visible.** Draggable/clickable things look it — cursor
  change, hover response, a visible handle. Decoration doesn't invite clicks.
  A learner should discover every interaction without reading instructions
  (a short on-canvas hint is fine as a backup).
- **Purposeful life.** Systems that are dynamic *in the concept* keep moving on
  screen (the orbit keeps orbiting, the wave keeps traveling — pausable);
  static concepts stay still. Motion exists to carry meaning — no idle wobble
  on things that don't move in reality, no dead stills of things that do.

SHOULD:

- User-driven motion has physicality — springs/damping/inertia where the domain
  has them (a released pendulum swings; it doesn't lerp).
- Play/pause + a reset that animates home rather than snapping.
- Hover reveals local detail (a value, a label) before commitment.

Anti-patterns (automatic fail): a slider row as the ONLY way to interact with a
scene that has grabbable objects; state that jumps with no transition; a "Run"
that recomputes an SVG with no visible motion when the concept is a process;
invisible interactivity (nothing signals what's manipulable).

## How to grade (for the verify pass)

Walk the shipped thing at a real viewport, light + dark:

1. Open the lesson → check every Surface-1 MUST.
2. Drive each interactive → check every Surface-2 MUST: grab what looks
   grabbable, watch a discrete change for teleporting, screenshot before/after
   an action to confirm the delta is emphasized.
3. Spot-check one derived value against the model (truth check).
4. Report as a checklist with pass/fail per MUST — not an impression. Any MUST
   fail → keep iterating; don't ship.
