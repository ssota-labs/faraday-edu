# Faraday blocks — API reference

Import blocks from `@faraday-academy/runtime/blocks`, runtime helpers from `@faraday-academy/runtime/runtime`,
raw shadcn primitives from `@faraday-academy/runtime/ui/*`. The scaffolded project's
`docs/authoring.md` is the source of truth; this is the working summary.

**A lesson is a chapter, not a gadget.** A substantial concept gets several
*different* interactive figures — a manipulable model, a `<Chart>` of the real
relationship, a stepped walkthrough or `<Compare>`, a `<CodeCell>` where the
audience codes — each set up and interpreted by real prose, all math in
`<TeX>`. The canonical shape below is one *section's* arc; a chapter strings
several together. Rubric: [quality-bar.md](quality-bar.md).

## Canonical section shape

```tsx
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Scrubber, Quiz, Callout } from "@faraday-academy/runtime/blocks";
import { useStepper } from "@faraday-academy/runtime/runtime";

export default function MyLesson() {
  const [param, setParam] = useState(4);
  const frames = useMemo(() => buildFrames(param), [param]);   // your model
  const step = useStepper(frames.length);

  return (
    <Lesson topic="Topic" title="…" lead="one sentence on what the reader learns">
      <Prose><p>Set up the intuition.</p></Prose>

      <Workbench
        title="Canvas" panelTitle="Controls"
        onReset={() => { setParam(4); step.reset(); }}   // reset ALL lesson state, incl. the stepper
        controls={
          <>
            <ControlGroup label="Playback">
              <Scrubber
                index={step.index} total={step.total} playing={step.playing}
                atStart={step.atStart} atEnd={step.atEnd}
                onPrev={step.prev} onNext={step.next}
                onTogglePlay={step.togglePlay} onSeek={step.setIndex}
              />
            </ControlGroup>
            <ControlGroup label="Parameters">
              <ParamSlider label="A parameter" value={param} min={2} max={12} onChange={setParam} />
            </ControlGroup>
          </>
        }
      >
        <MyVisual frame={frames[step.index]} />   {/* an <svg> etc. */}
      </Workbench>

      <Callout title="Key idea">The one thing to remember.</Callout>

      <Quiz question="…" options={[
        { label: "wrong", hint: "why not" },
        { label: "right", correct: true },
      ]} />
    </Lesson>
  );
}
```

For a single figure without controls, use `<Stage caption="…">…</Stage>` instead
of `<Workbench>`.

## Two shapes of lesson

- **Stepped** — an algorithm/proof unfolds over discrete moments. Precompute an
  ordered array of immutable frames; walk it with `useStepper` + `<Scrubber>`. The
  scaffolded `src/lesson/lesson.tsx` (bubble sort) is a stepped starter.
- **Continuous** — the reader turns knobs and the picture responds live. Hold
  params in `useState`, `useMemo` the visualization, drive with `<ParamSlider>` /
  `<ParamSwitch>` / `<Segmented>`. No `useStepper` needed. Copy
  `docs/examples/continuous.tsx` (live-knobs + `<Chart>`) as a starter.
- **Aim-then-run (hybrid)** — common third shape: continuous setup + a discrete
  timed run. The learner aims by direct manipulation (`useSvgDrag` on the object,
  a live dashed preview), then an on-canvas button (in the Workbench `hud`) fires
  a `useRafLoop` simulation that flies/settles with a visible trail. Projectiles,
  reaction runs, races, launches — anything with a "set it up, let it go" beat.

## Block catalog

| Block | Purpose |
|---|---|
| `<Lesson title lead topic?>` | Page frame. Everything goes inside it. |
| `<Prose heading?>` | A text section. |
| `<Stage caption?>` | Card-framed host for a single visualization (SVG/canvas/DOM). |
| `<Workbench title? panelTitle? onReset? hud? controls?>` | Live canvas (`children`) + optional floating control panel (`controls`). **The panel is not mandatory** — omit `controls` and the canvas takes full width (right when all interaction lives on the canvas: drag handles, overlay buttons). `hud` overlays top-right and is interactive: live `<Readout>` chips AND on-canvas actions (Play/Pause, presets as `<Button size="sm">`). Measured numbers belong there, **not** in a card strip under the figure. |
| `<ControlGroup label defaultOpen? onReset?>` | Collapsible labeled section for the panel's `controls`. Group controls semantically. |
| `<Chart type data x series yAxis? xType? tooltip? legend?>` | shadcn/Recharts chart. `type`: line \| bar \| area \| radar \| pie \| donut \| radial. `series: {key,label?,color?}[]` (defaults to `--chart-1..5`). A hover **tooltip** is on by default; add **`legend`** for a series/slice legend (handy with multiple series). **Slice charts** (pie/donut/radial) treat each ROW as a slice — `x` names the slice, `series[0].key` is the value, colours cycle `--chart-1..5`. For **function graphs / uneven samples** (line/area) set `xType="number"` so x plots at its true position (default `"category"` spaces rows evenly). `data` values may be `null` (gap); a point with nulls on both sides renders as a visible dot — use a mostly-null series for a "you are here" marker on a model curve. Needs **non-zero container width to paint** (element `ResizeObserver`; a `window` resize may not rescue it) — see the Rendering gotcha in worlds.md. Prefer `height ≥ 260` for area/pie/radar charts. |
| `<Segmented label? value onChange options>` | Single-select segmented control. Generic over `T extends string` — `value`/`onChange`/`options[].value` share `T` (no cast). |
| `<ParamSlider label value min max step? onChange format?>` | Numeric control. |
| `<ParamSwitch label checked onChange>` | On/off control. |
| `<Scrubber index total playing atStart atEnd onPrev onNext onTogglePlay onSeek>` | Transport controls; wire to `useStepper`. |
| `<Quiz question options onCorrect? onChecked?>` | Recognition MCQ — distractors should be documented misconceptions. `options: {label, correct?, hint?}[]`. `onCorrect()` fires on a passed answer — wire to `useNode().complete()` for curriculum unlock. One of FIVE check forms — pick by outcome verb ([assessment.md](assessment.md)). Correct answers celebrate automatically (confetti — also on NumericAnswer/Challenge/SketchPad success; `celebrate(el)` is exported for custom gameplay moments). |
| `<NumericAnswer question answer tolerance? unit? hint? onCorrect?>` | Free numeric response — the learner computes and TYPES the answer (Enter or Check grades; default tolerance 2%). For compute/derive/estimate outcomes. |
| `<SketchPad prompt background? overlay onSelfAssess? viewBox?>` | Pen/touch sketch-predict (Apple Pencil pressure honored): draw the prediction, reveal the true `overlay`, self-assess against it. For predict/visualize/construct outcomes. |
| `<Challenge goal done hint? onDone title?>` | Mission-style performance check wrapping an interactive: author computes the win condition (`done`) from sim state; latches on first success, `onDone` fires once. Put a visible target INTO the scene. For do/tune/achieve outcomes. |
| `<Callout title? variant?>` | Highlighted note. `variant`: `"default"` \| `"destructive"`. |
| `<Reveal label?>` | Collapsible hint/spoiler. |
| `<Compare items defaultValue?>` | Tabbed side-by-side cases. `items: {value, label, content}[]` — `value` keys each tab (**required**); `defaultValue` picks the open tab (defaults to the first item's `value`). |
| `<Stat label value delta?>` | Compact metric card. `delta` is an object `{text, tone?}` (not a bare string). Use for one deliberate summary row at most — live values go in the Workbench `hud`. |
| `<TeX block? stream?>` | KaTeX math. **All symbolic expressions** render through this — inline in prose, or `block` for display equations. Child is the TeX source string: `<TeX>{String.raw`\frac{dA}{dt}`}</TeX>`. Never `<code>`/ASCII math. `stream` (block only) writes the equation out left→right with a pen caret, professor-style — `<Derivation>` streams its newest line automatically. |
| `<Derivation steps title? defaultOpen?>` | A formula derived LIVE, one justified line at a time (Next step / Show all / Restart; newest line animates in). `steps: {tex, note?}[]` — the note names the move ("substitute T", "2 sinθcosθ = sin 2θ"). **Central results must arrive as the last line of one of these**, not as a bare boxed formula (quality-bar). Secondary results → `<Reveal>`. |
| `<CodeCell code label? caption?>` | Editable, runnable JavaScript cell — syntax-highlighted editor (dep-free), sandboxed iframe execution, console output on a contrasting inset panel, Run/Reset. Use when the audience codes or the concept is algorithmic; the learner edits + re-runs to test the idea. |
| `<Readout label value tone?>` | Compact label:value chip for live numbers — designed for the Workbench `hud` slot. |
| `<Paged pages height? onLastPage?>` | Tablet-style screen-at-a-time layout: each page fills the viewport height, one shows at a time (prev/next, dot rail, arrow keys). `pages: {id, title?, content}[]`. Only the active page is mounted (per-page state resets on return). Use for "one idea per screen" audiences/contexts (see the audience pack "Layout"); default remains the book-like vertical scroll. Inside a page, landscape-split with `grid h-full lg:grid-cols-[3fr_2fr]`. |
| `useStepper(total, { fps? })` | Cursor + autoplay over ordered frames. From `@faraday-academy/runtime/runtime`. |
| `useAnimatedValue(target, {stiffness?})` | Returns a value that spring-chases `target` — render from it and discrete changes (selection, step, reset) EASE instead of teleporting. From `@faraday-academy/runtime/runtime`. |
| `useRafLoop(cb, playing?)` | Simulation loop: `cb(dt, t)` each frame while playing. Keeps dynamic concepts moving on screen (orbit orbits, wave travels) with Play/Pause in the `hud`. From `@faraday-academy/runtime/runtime`. |
| `useSvgDrag(onDrag)` | Direct manipulation: spread on any SVG element → drag positions in viewBox coords (`onDrag(x, y, phase)`), pointer-captured. Drag the object itself instead of a detached slider. From `@faraday-academy/runtime/runtime`. |

Light/dark toggle and the reading column come from the runtime — don't add them.

## Visualizations & theme colors

`<Stage>`/`<Workbench>` frame whatever you put inside. Use inline SVG with a fixed
`viewBox` and `width: 100%` (the stylesheet sizes it). Pull colors from tokens:

| Token | Use |
|---|---|
| `var(--primary)` | primary highlight / active element |
| `var(--destructive)` | error / attention |
| `var(--chart-1..5)` | data-series colors |
| `var(--muted-foreground)` | inert marks, gridlines |
| `var(--border)` | separators |

In SVG: `style={{ fill: "var(--primary)" }}`. In HTML: semantic Tailwind classes.
Never hardcode `#hex` or `text-blue-500`.

## Styling gotcha: utilities lose to the component layer

`.style-faraday .cn-*` component styles outrank single Tailwind utilities, so
`className="py-0"` on a `<Card>` (etc.) silently does nothing. To build a card
with your own header bar (like Workbench/CodeCell), set **`data-flush`** on the
`<Card>` — it zeroes the card's built-in padding+gap so your bar and sections
space themselves. For other density changes, adjust the token values, don't
fight the layer with utilities.

## Adding a shadcn primitive

The runtime ships these shadcn primitives at `@faraday-academy/runtime/ui/*`: button, card, slider, tabs, accordion,
alert, badge, radio-group, toggle-group, switch, progress, separator, label,
tooltip, collapsible, chart. Compose those. Do **not** run `shadcn add` (writes
— the UI is in the pinned runtime, not your lesson). Truly missing primitive → note it in your
summary.

## Constraints

- One lesson / one idea. No routing, no backend, no network calls (except the
  `tutor` pack server layer, which is author-editable).
- Don't add dependencies unless the lesson genuinely needs them.
- Don't try to fork the runtime — it's a pinned dependency.
