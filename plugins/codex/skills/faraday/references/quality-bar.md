# The quality bar — what "done" looks like

This is the acceptance rubric for shipped Faraday output. Grade your own work
against it **before** reporting done; a lesson or world that misses a MUST is not
finished, even if it compiles and renders. The bar is topic-agnostic on purpose —
do not tune output to one demo subject.

There are two content surfaces, with different bars: the **world / roadmap
screen** (a game) and the **lesson page** (a textbook chapter). The core failure
mode is blending them: a roadmap that reads like a document, or a lesson that's a
single gadget with three sentences around it. Surface 3 grades how the
interactives *feel*. Surface 4 grades the **opt-in AI tutor** (`--tutor`) — and
unlike the others it is judged by **behavior over an API**, not pixels, because it
is a server-backed durable agent rather than a rendered view.

## Surface 1 — world / roadmap screens (map2d, world3d, rpg packs)

A curriculum map must read as a **game screen**, not a webpage section. The
learner should feel "I'm in a world, these are my missions", not "I'm reading a
dashboard with a diagram in it".

MUST:

- **Full-bleed.** The world fills the viewport edge to edge. No reading column,
  no page header above it, no card border around it, no page scroll behind it.
  If you can see a document h1 + paragraph + bordered widget, it fails.
- **Game HUD, not document chrome.** Title, progress, and XP live in overlay
  plates ON the world (corners), styled like a game status window / HMD readout:
  compact, translucent, uppercase micro-labels, tabular numbers. A thin page-wide
  progress bar over a heading is document chrome — fails.
- **Node states are legible at a glance** — locked / available / active /
  complete each visibly distinct (glow, icon, color), without reading text.
- **Focus shows intel.** Hovering/focusing a node surfaces its briefing (title,
  summary, reward, lock reason) in a HUD panel — the map itself answers "what is
  this and can I enter?"
- **An idle hint exists** ("select a node", "WASD to move") so a first-time
  learner is never stuck.
- **Mood matches subject** (3D scenes: correct `mood`, matched object palette).

SHOULD:

- Motion with purpose: active-node pulse, hover response, camera ease. No decorative chaos.
- Entering a node feels like a transition (world → lesson), not a page swap glitch.
- Locked paths visually distinct from open paths (dashed/dimmed edges).

Anti-patterns (automatic fail): world rendered inside the prose column; big
whitespace margins around the map; document typography (3xl serif-ish headings)
floating above the canvas; a Reset icon as the most prominent HUD element.

## Surface 2 — lesson pages (the interactive textbook)

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
- **Readouts are integrated, not stacked.** Live numbers belong in the
  Workbench `hud` overlay or the control panel — not as a strip of stat cards
  dumped under every interactive. (One deliberate `<Stat>` row for a summary
  moment is fine; a reflex row after each figure is not.)
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

## Surface 3 — the interactives themselves (feel, motion, directness)

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

## Surface 4 — the AI tutor (`--tutor`, opt-in / server-backed)

The tutor is not a view — it is a durable chat agent grounded in the lesson. It
is graded by **what it does over `/api/chat`**, not by a screenshot. It is opt-in:
a lesson with no open-ended goal should not have one at all.

MUST:

- **Warranted, not bolted on.** Add a tutor **only** when a learning outcome needs
  free-text judgment — an explain / argue / design / discuss goal (the open-response
  row in assessment.md). A `<Tutor>` on a lesson whose checks are all
  recognize / compute / predict / do is scope creep and fails. The *reason* it was
  added must trace to an open-ended outcome, not "it's a nice feature".
- **Grounded in the actual material.** `<Tutor context={…}>` is fed the real lesson
  or section text (or the relevant slice) — never an empty or generic context. Its
  answers are traceable to that material; asked something outside it, it steers back
  instead of free-associating from world knowledge.
- **Socratic — no answer-dumping, no leaking.** It hints and asks rather than
  handing over the final answer, and it **never reveals the solution to the lesson's
  graded checks** (quiz / exercise answers) even on a direct "just tell me the
  answer" — it deflects and redirects to reasoning.
- **Docked beside the lesson, on the same page.** The tutor is mounted via
  `<TutorDock>` wrapping the lesson — a resizable, collapsible right-side panel
  (right-edge tab to open; a drawer on mobile), co-existing with the content it is
  grounded in on the same page. NOT an inline `<Tutor>` block dumped in the content
  flow, a separate chat route, or a full-page chatbot detached from the material.
- **Replies render as Markdown + math.** Assistant turns render through Streamdown
  (Markdown + KaTeX), not raw text — so lists, code, and `$…$`/`$$…$$` formulas
  display formatted. Raw LaTeX or literal `$` delimiters showing in the bubble fail.
  Reasoning ("thinking") is at most a non-expandable indicator; raw chain-of-thought
  is never shown.
- **The durable pipeline is real.** `POST /api/chat` returns **200 + an
  `x-workflow-run-id`**, and the run is resumable: `GET
  /api/chat/{runId}/stream?startIndex=` replays the *same* run, so a refresh, a
  network drop, or a timeout does not lose the turn. (With a key: a real token
  stream. Without a key: 200 + an empty envelope + a `GatewayAuthenticationError`
  only in the dev log — that is the keyless *pass* tier for the pipeline, not a
  failure.)
- **Server only when needed; pins intact.** Only `--tutor` adds the `api/` +
  `workflows/` layer — non-tutor lessons in the same build stay static and
  server-free. The author touched only `workflows/tutor-agent.ts` (persona, model,
  rules) and the embed site; `@faraday-academy/tutor` (the pinned chat UI + client) is
  unedited and `faraday check` passes.

SHOULD:

- The persona / tone matches the audience methodology (a Socratic tutor for children
  reads differently from one for professionals — see the audience pack).
- The tutor knows its name: asked who it is, it says it's Faraday, the lesson's
  built-in tutor — not a generic model/assistant.
- The grounding prefix is byte-stable (deterministic `buildInstructions`) so implicit
  prompt caching works across a conversation.
- The greeting orients the learner to what they can usefully ask.

Anti-patterns (automatic fail): a tutor on a lesson with no open-ended goal
(decoration); an inline `<Tutor>` block sitting in the content flow instead of the
`<TutorDock>` side panel; an ungrounded tutor (empty/generic context) that answers
from world knowledge and drifts off-topic; leaking a quiz/exercise answer on direct
request; raw LaTeX/`$` delimiters visible in a reply; an expandable chain-of-thought
"thinking" block; a detached full-page chatbot with no tie to the page content; any
change the `@faraday-academy/tutor` pin to a range (`faraday check` fails).

## How to grade (for the verify pass)

Walk the shipped thing at a real viewport, light + dark:

1. Screenshot the world screen → check every Surface-1 MUST.
2. Enter the first node → check every Surface-2 MUST on that lesson.
3. Drive each interactive → check every Surface-3 MUST: grab what looks
   grabbable, watch a discrete change for teleporting, screenshot before/after
   an action to confirm the delta is emphasized.
4. Spot-check one derived value against the model (truth check).
5. Report as a checklist with pass/fail per MUST — not an impression. Any MUST
   fail → keep iterating; don't ship.

If the build has a tutor (`--tutor`), grade Surface 4 too — over the API, not by
screenshot:

6. First confirm the tutor is **warranted**: the lesson must have an open-ended
   (explain/argue/design/discuss) outcome. If every check is
   recognize/compute/predict/do, the tutor itself is the failure — stop here.
7. `pnpm dev`, then `curl -N POST /api/chat` a grounded question → with a key,
   expect `text-delta` tokens carrying a grounded, Socratic answer. Two adversarial
   probes: (a) "just tell me the quiz answer" → must NOT leak; (b) a question
   outside the material → must steer back. Keyless, expect the 200 + empty
   envelope + `GatewayAuthenticationError` in the dev log (pipeline pass tier).
8. Durability: capture `x-workflow-run-id` from the POST, then
   `GET /api/chat/{runId}/stream?startIndex=0` → confirm the same run replays.
9. In the browser (desktop width): confirm the tutor is the `<TutorDock>` right-side
   panel (right-edge tab opens it, resizable, collapsible) — not an inline block —
   and that a reply with math renders formatted (KaTeX, no raw `$`/LaTeX). Confirm
   `faraday check` passes and the `@faraday-academy/tutor` pin is intact.
