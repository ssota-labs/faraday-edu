# AGENTS.md — authoring a Faraday lesson

You are building **one interactive lesson**: a single-page, self-contained Vite +
React app that teaches one idea by letting the reader *do* something. The UI is
**shadcn-based** (Base UI primitives + an externalized CSS style layer).

## Two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | Write your lesson here. `src/lesson/lesson.tsx` is the fixed entry and must `export default` a React component. Add sibling files freely. |
| **Protected area** | `src/faraday/**` | The vendored shadcn UI, lesson blocks, runtime, and styles. **Do not edit.** Locked by a SHA-256 manifest; `pnpm check` fails if it drifts. |

`src/main.tsx`, `index.html`, and the config files are the app shell — you rarely touch them.

## How the styling works (important)

This uses the shadcn **CSS-style** convention, not inline utility soup:

- Components carry semantic `.cn-*` class names; all their styling lives in
  `src/faraday/styles/style-faraday.css` (the component style layer).
- **Theme tokens** (semantic colors, light/dark) → `src/faraday/styles/theme.css`.
- **Design tokens** (Tailwind namespace mapping + radius/density) → `src/faraday/styles/design-tokens.css`.
- In your lesson, use **semantic Tailwind classes** (`text-muted-foreground`,
  `bg-card`, `text-primary`) and the blocks below. Never hardcode colors like
  `text-blue-500`. In SVG, pull theme colors with `style={{ fill: "var(--primary)" }}`.

## Blocks you assemble

Import from `@/faraday/blocks`; raw shadcn primitives are in `@/faraday/ui/*`.

- `<Lesson title lead topic?>` — page frame. Put everything inside it.
- `<Prose heading?>` — a text section.
- `<Stage caption?>` — a Card-framed host for a single visualization (SVG/canvas/DOM).
- `<Workbench title? panelTitle? onReset? controls>` — the **live canvas + floating
  control panel** layout (mirror-dimension style). Put the visualization in `children`,
  the controls in `controls`. The panel floats (elevated), sticks while scrolling, and
  stacks on mobile. `onReset` adds a reset button to the panel title bar. Embed it
  anywhere in the lesson flow.
- `<ControlGroup label defaultOpen? onReset?>` — a collapsible, labeled section for the
  panel's `controls`. Group controls semantically (e.g. "Playback", "Appearance",
  "Physics"); each group collapses independently and can have its own reset.
- `<Chart type data x series yAxis?>` — a shadcn/Recharts chart (`type`: line | bar | area).
  `series: {key, label?, color?}[]`; colours default to `--chart-1..5` theme tokens.
- `<ParamSlider label value min max step? onChange format?>` — numeric control.
- `<ParamSwitch label checked onChange>` — on/off control.
- `<Segmented label? value onChange options>` — single-select segmented control.
- `<Scrubber ...>` — transport controls for a stepped visualization (wire to `useStepper`).
- `<Quiz question options onCorrect? onChecked?>` — self-check MCQ (`options: {label,
  correct?, hint?}[]`). `onCorrect` fires on a passed answer — wire it to
  `useNode().complete()` in a curriculum to unlock the next node.
- `<Callout title? variant?>` — highlighted note. `variant`: `"default"` | `"destructive"`.
- `<Reveal label?>` — collapsible hint/spoiler.
- `<Compare items defaultValue?>` — tabbed side-by-side cases. `items: {value,
  label, content}[]` — `value` keys each tab (required); `defaultValue` opens one.
- `<Stat label value delta?>` — compact metric read-out.
- `useStepper(total, { fps? })` — cursor + autoplay over an ordered list of frames.
- `<Course title chapters>` (from `@/faraday/runtime`) — bundle several lessons into a
  navigable textbook (chapter nav, prev/next, #hash routing). Use it as the default export.

Light/dark toggle and the reading column come from the runtime — you don't add them.

## Workflow

1. Decide what the reader manipulates and what they should *see change*.
2. Write it in `src/lesson/` using the blocks above.
3. `pnpm check` — structure + integrity gates must pass (exit 0).
4. `pnpm dev` — Vite prints a local URL on a free port (read it from the output; run
   several lessons side by side). Open it, drive the controls, fix any console errors.
5. End with a `<Quiz>` so the reader can test their understanding.

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
- Don't edit anything under `src/faraday/`. If a primitive seems missing, note it
  in your summary instead of working around the lock.
