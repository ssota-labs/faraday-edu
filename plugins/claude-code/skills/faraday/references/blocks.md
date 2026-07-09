# Faraday blocks — API reference

Import blocks from `@/faraday/blocks`, runtime helpers from `@/faraday/runtime`,
raw shadcn primitives from `@/faraday/ui/*`. The scaffolded project's
`docs/authoring.md` is the source of truth; this is the working summary.

## Canonical lesson shape

```tsx
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Scrubber, Quiz, Callout } from "@/faraday/blocks";
import { useStepper } from "@/faraday/runtime";

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

## Block catalog

| Block | Purpose |
|---|---|
| `<Lesson title lead topic?>` | Page frame. Everything goes inside it. |
| `<Prose heading?>` | A text section. |
| `<Stage caption?>` | Card-framed host for a single visualization (SVG/canvas/DOM). |
| `<Workbench title? panelTitle? onReset? controls>` | Live canvas (`children`) + floating, sticky control panel (`controls`). The interactive centerpiece. |
| `<ControlGroup label defaultOpen? onReset?>` | Collapsible labeled section for the panel's `controls`. Group controls semantically. |
| `<Chart type data x series yAxis?>` | shadcn/Recharts chart. `type`: line \| bar \| area. `series: {key,label?,color?}[]` (defaults to `--chart-1..5`). Needs **non-zero container width to paint** (element `ResizeObserver`; a `window` resize may not rescue it) — see the Rendering gotcha in worlds.md. |
| `<ParamSlider label value min max step? onChange format?>` | Numeric control. |
| `<ParamSwitch label checked onChange>` | On/off control. |
| `<Segmented label? value onChange options>` | Single-select segmented control. |
| `<Scrubber index total playing atStart atEnd onPrev onNext onTogglePlay onSeek>` | Transport controls; wire to `useStepper`. |
| `<Quiz question options onCorrect? onChecked?>` | Self-check MCQ. `options: {label, correct?, hint?}[]`. `onCorrect()` fires on a passed answer — wire to `useNode().complete()` for curriculum unlock; `onChecked(correct)` fires on every check. |
| `<Callout title? variant?>` | Highlighted note. `variant`: `"default"` \| `"destructive"`. |
| `<Reveal label?>` | Collapsible hint/spoiler. |
| `<Compare items defaultValue?>` | Tabbed side-by-side cases. `items: {value, label, content}[]` — `value` keys each tab (**required**); `defaultValue` picks the open tab (defaults to the first item's `value`). |
| `<Stat label value delta?>` | Compact metric read-out. `delta` is an object `{text, tone?}` (not a bare string). |
| `useStepper(total, { fps? })` | Cursor + autoplay over ordered frames. From `@/faraday/runtime`. |

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

## Adding a shadcn primitive

Already vendored under `src/faraday/ui/`: button, card, slider, tabs, accordion,
alert, badge, radio-group, toggle-group, switch, progress, separator, label,
tooltip, collapsible, chart. Compose those. Do **not** run `shadcn add` (writes
into the locked tree → `check` fails). Truly missing primitive → note it in your
summary.

## Constraints

- One lesson / one idea. No routing, no backend, no network calls (except the
  `--tutor` server layer, which is vendored).
- Don't add dependencies unless the lesson genuinely needs them.
- Don't edit anything under `src/faraday/`.
