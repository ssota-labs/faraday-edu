# AGENTS.md — authoring a Faraday lesson

You are building **one interactive lesson**: a single-page, self-contained Vite +
React app that teaches one idea by letting the reader *do* something. The UI is
**shadcn-based** (Base UI primitives + an externalized CSS style layer).

**Hold the quality bar** — [docs/quality-bar.md](docs/quality-bar.md) is the
acceptance rubric (world screens must read as game screens; lessons must read as
solid textbook chapters: multiple different interactions, real prose between
them, all math in `<TeX>`, quantitative claims plotted). Grade your output
against it before calling anything done.

## Two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | Write your lesson here. `src/lesson/lesson.tsx` is the fixed entry and must `export default` a React component. Add sibling files freely. For a **multi-lesson curriculum**, put each node's lesson in its own file under `src/lesson/nodes/<id>.tsx` and import them into the module-scope `curriculum` in `lesson.tsx` — this keeps lessons file-isolated so they can be built independently (see `docs/examples/curriculum.tsx`). |
| **Runtime (dependency)** | `@faraday-academy/*` | The shadcn UI, lesson blocks, runtime, and styles — **pinned npm packages**, not vendored. You consume them via `@faraday-academy/runtime/*`; you don't edit them. `pnpm check` verifies the pin. |

`src/main.tsx`, `index.html`, and the config files are the app shell — you rarely touch them.

## How the styling works (important)

This uses the shadcn **CSS-style** convention, not inline utility soup:

- Components carry semantic `.cn-*` class names; all their styling lives in
  `-academy/runtime/styles/style-faraday.css` (shipped in the runtime package).
- **Theme tokens** (semantic colors, light/dark) → `-academy/runtime/styles/theme.css`.
- **Design tokens** (Tailwind namespace mapping + radius/density) → `-academy/runtime/styles/design-tokens.css`.
  You reference these tokens; the runtime owns them.
- In your lesson, use **semantic Tailwind classes** (`text-muted-foreground`,
  `bg-card`, `text-primary`) and the blocks below. Never hardcode colors like
  `text-blue-500`. In SVG, pull theme colors with `style={{ fill: "var(--primary)" }}`.

## Blocks you assemble

Import from `@faraday-academy/runtime/blocks`; raw shadcn primitives are in `@faraday-academy/runtime/ui/*`.

- `<Lesson title lead topic?>` — page frame. Put everything inside it.
- `<Prose heading?>` — a text section.
- `<Stage caption?>` — a Card-framed host for a single visualization (SVG/canvas/DOM).
- `<Workbench title? panelTitle? onReset? hud? controls?>` — the **live canvas**
  layout. Visualization in `children`; `hud` overlays top-right and is interactive —
  live `<Readout>` chips AND on-canvas actions (Play/Pause, presets as
  `<Button size="sm">`). `controls` (the floating side panel) is **optional**:
  omit it when all interaction lives on the canvas (drag handles, overlay
  buttons) and the canvas takes full width; use it for secondary or numerous
  parameters. `onReset` adds a reset button.
- **Motion hooks** (from `@faraday-academy/runtime/runtime`) — use these instead of hand-rolled
  rAF so nothing snaps: `useAnimatedValue(target)` (render from it → discrete
  changes ease, never teleport), `useRafLoop(cb, playing)` (keep dynamic systems
  moving, Play/Pause in `hud`), `useSvgDrag(onDrag)` (drag objects in viewBox
  coords — prefer dragging the thing over a detached slider).
- `<ControlGroup label defaultOpen? onReset?>` — a collapsible, labeled section for the
  panel's `controls`. Group controls semantically (e.g. "Playback", "Appearance",
  "Physics"); each group collapses independently and can have its own reset.
- `<Chart type data x series yAxis? xType?>` — a shadcn/Recharts chart (`type`: line | bar | area).
  `series: {key, label?, color?}[]`; colours default to `--chart-1..5` theme tokens.
  For function graphs / uneven samples set `xType="number"` (true x positions).
  A data point with `null` neighbours renders as a dot — use a mostly-null
  series as a "you are here" marker on a model curve.
- `<ParamSlider label value min max step? onChange format?>` — numeric control.
- `<ParamSwitch label checked onChange>` — on/off control.
- `<Segmented label? value onChange options>` — single-select segmented control.
- `<Scrubber ...>` — transport controls for a stepped visualization (wire to `useStepper`).
- **Checks — pick the FORM by the outcome verb** (see docs/quality-bar.md; an
  MCQ closing a compute/do/predict outcome under-tests it):
  - `<Quiz question options onCorrect?>` — recognition MCQ; distractors are
    documented misconceptions, hints are feed-forward. `onCorrect` →
    `useNode().complete()` gates a curriculum node.
  - `<NumericAnswer question answer tolerance? unit? hint? onCorrect?>` — the
    learner computes and types the number (default tolerance 2%).
  - `<SketchPad prompt background? overlay onSelfAssess?>` — draw the
    prediction (pen/Pencil/touch), reveal the true overlay, self-assess.
  - `<Challenge goal done hint? onDone>` — mission wrapping an interactive:
    clear it by DOING (win condition computed from your sim state; put a
    visible target in the scene).
- `<Callout title? variant?>` — highlighted note. `variant`: `"default"` | `"destructive"`.
- `<Reveal label?>` — collapsible hint/spoiler.
- `<Compare items defaultValue?>` — tabbed side-by-side cases. `items: {value,
  label, content}[]` — `value` keys each tab (required); `defaultValue` opens one.
- `<Stat label value delta?>` — compact metric read-out (use sparingly — one
  deliberate summary row, never a reflex strip under every figure).
- `<TeX block?>` — KaTeX math. **Every symbolic expression** goes through this
  (inline in prose or `block` for display equations): `<TeX>{String.raw`\frac{dA}{dt}`}</TeX>`.
  Never typeset math as `<code>` or ASCII.
- `<Derivation steps={[{tex, note?}]} title?>` — derive formulas LIVE: lines
  reveal one at a time (learner presses Next step), each with the move that
  justifies it. **A lesson's central formula must land as the last line of a
  derivation, not appear from nowhere**; secondary results can defer to
  `<Reveal>`.
- `<CodeCell code label? caption?>` — an editable, runnable JavaScript cell
  (sandboxed, console captured). Use when the audience codes or the concept is
  algorithmic — the learner edits and re-runs to test the idea.
- `<Readout label value tone?>` — a compact label:value chip for live numbers.
  Put readouts in the Workbench `hud` slot (overlaid on the canvas), not as a
  row of `<Stat>` cards after the figure.
- `<Paged pages height? onLastPage?>` — tablet-style screen-at-a-time layout:
  each page (`{id, title?, content}`) fills the viewport height; prev/next, dot
  rail, arrow keys. Only the active page stays mounted. Use when the audience
  wants one idea per screen (young learners, kiosk/tablet); the default lesson
  layout remains the book-like vertical scroll.
- `useStepper(total, { fps? })` — cursor + autoplay over an ordered list of frames.
- `<Course title chapters>` (from `@faraday-academy/runtime/runtime`) — bundle several lessons into a
  navigable textbook (chapter nav, prev/next, #hash routing). Use it as the default export.

Light/dark toggle and the reading column come from the runtime — you don't add them.

## Workflow

1. Decide what the reader manipulates and what they should *see change*.
2. Write it in `src/lesson/` using the blocks above. A lesson is a **chapter,
   not a gadget**: teach in prose, then let each idea be *done* — typically 2–4
   different interactives (a manipulable model, a plotted relationship, a
   stepped walkthrough, a code cell) with explanation before and interpretation
   after each. All math in `<TeX>`. See [docs/quality-bar.md](docs/quality-bar.md).
3. `pnpm check` — structure + integrity gates must pass (exit 0).
4. `pnpm dev` — Vite prints a local URL on a free port (read it from the output; run
   several lessons side by side). Open it, drive the controls, fix any console errors.
5. End with a `<Quiz>` that can only be answered by having used the interactives.

## MANDATORY: 3D scenes must carry the domain's mood

When a lesson uses `<Scene3D>`, you **must** set its `mood` to match the subject —
the canvas should *feel* like the topic, never the flat default:

| Subject | `mood` | Look |
|---|---|---|
| astronomy, space, gravity | `"space"` | deep-black + starfield |
| biology, cells, microscopy | `"cell"` | ethereal teal haze + drifting motes |
| chemistry, molecules | `"lab"` | clean bright lab + grid |
| mechanics, forces | `"physics"` | dim studio + reference grid |
| math, abstract geometry | `"abstract"` | minimal dark |
| UI/plumbing demo only | `"neutral"` | transparent (rare) |

`<Scene3D mood="space">…</Scene3D>`. Match the palette of any procedural objects to
the mood too (e.g. glowing bodies in space, bioluminescent cyans in a cell). A
domain 3D scene that ships with `neutral` mood is a defect.

## Constraints

- One lesson / one idea. No routing, no backend, no network calls.
- Don't add dependencies unless the lesson genuinely needs them.
- Don't try to fork the runtime. `@faraday-academy/runtime` is a pinned dependency —
  if a primitive seems missing, note it in your summary instead of working around it.

> **Pack `audience`:** installed via `faraday pack add audience`. Authoring guide at `.faraday/packs/audience/audience.md`. Load it when you are pinning who the learner is and choosing how to hand them the concept (audience is a gate in Discover).

> **Pack `lecture-design`:** installed via `faraday pack add lecture-design`. Authoring guide at `.faraday/packs/lecture-design`. Load it when you are designing how a lesson or curriculum teaches — choosing a methodology, sequencing, assessment cadence, or feedback.

> **Pack `map2d`:** installed via `faraday pack add map2d`. Authoring guide at `.faraday/packs/map2d/pack.md`. Load it when a curriculum should be shown as a 2D map / game screen with unlock progression (a <CurriculumHost>), rather than a linear document list.
