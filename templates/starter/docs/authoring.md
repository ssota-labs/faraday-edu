# Authoring reference

A lesson is a React component tree assembled from Faraday blocks (which are built
on shadcn / Base UI). Canonical shape:

The interactive centerpiece is usually a `<Workbench>` — a live canvas with a
floating control panel of `<ControlGroup>` sections (this is what the bundled demos
use). Canonical shape:

```tsx
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Scrubber, Quiz, Callout } from "@/faraday/blocks";
import { useStepper } from "@/faraday/runtime";

export default function MyLesson() {
  const [param, setParam] = useState(4);
  const frames = useMemo(() => buildFrames(param), [param]); // your model
  const step = useStepper(frames.length);

  return (
    <Lesson topic="Topic" title="…" lead="one sentence on what the reader learns">
      <Prose><p>Set up the intuition.</p></Prose>

      <Workbench
        title="Canvas"
        panelTitle="Controls"
        onReset={() => { setParam(4); step.reset(); }}  // reset all state, incl. the stepper
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

For a single figure without controls, use `<Stage caption="…">…</Stage>` instead of
`<Workbench>`.

## Two shapes of lesson: stepped vs continuous

**Stepped** — something unfolds over discrete moments (an algorithm, a proof).
Precompute an ordered array of immutable frames and walk it with `useStepper` +
`<Scrubber>`. See `src/lesson/lesson.tsx` (bubble sort).

**Continuous** — the reader turns knobs and the picture responds live (a function
plot, a physics parameter). No `useStepper` needed: hold params in `useState`,
`useMemo` the visualization, drive with `<ParamSlider>` / `<ParamSwitch>` /
`<Segmented>`. See `docs/examples/continuous.tsx` (compound interest + a live chart).

## Visualizations & theme colors

`<Stage>` frames whatever you put inside. Use inline SVG with a fixed `viewBox`
and `width: 100%` (the stylesheet sizes it). Pull colors from theme tokens so
light/dark both work:

| Token | Use |
|---|---|
| `var(--primary)` | primary highlight / active element |
| `var(--destructive)` | error / attention |
| `var(--chart-1..5)` | data-series colors |
| `var(--muted-foreground)` | inert marks, gridlines |
| `var(--border)` | separators |

In SVG: `style={{ fill: "var(--primary)" }}`. In HTML: semantic Tailwind classes
(`text-primary`, `bg-card`, `text-muted-foreground`). Never hardcode `#hex` or
`text-blue-500`.

## Adding a shadcn component you need

The raw primitives already vendored are in `src/faraday/ui/` (button, card, slider,
tabs, accordion, alert, badge, radio-group, toggle-group, switch, progress,
separator, label, tooltip). Compose those. Do **not** run `shadcn add` — it writes
into the locked `src/faraday/` tree and will fail `pnpm check`. If you truly need a
missing primitive, note it in your summary.

## 3D lessons (Three.js) — opt-in

Scaffold with `faraday new <name> --3d` to include a Three.js (React Three Fiber)
block + a solar-system demo. **Without `--3d`, three is never installed or bundled**
— 2D lessons stay light. Import the 3D block from `@/faraday/three`:

- `<Scene3D mood height? camera? controls? autoRotate?>` — a preconfigured R3F
  canvas (perspective camera, OrbitControls). Drop it into a `<Workbench>` center;
  bind panel controls to scene state via React. **`mood` is required for domain
  scenes** — it sets background, fog, lighting, and decor to match the subject:
  `"space"` (dark + starfield), `"cell"` (ethereal teal haze + motes), `"lab"`
  (bright + grid), `"physics"` (dim + grid), `"abstract"` (minimal dark), `"neutral"`
  (transparent, UI demos only). See the MANDATORY rule in AGENTS.md.
- `<Body position? radius? color? emissive? emissiveIntensity?>`,
  `<OrbitPath a e? color? opacity?>`, `<Planet a e? size? speed? color? phase?>`,
  `<Label3D position>` — procedural helpers. Compose these for astronomy, physics,
  chemistry (atoms/molecules), math surfaces, or a stylized cell — **all
  code-generated, no assets.** The orbit ellipse puts its **focus at the origin**,
  so a `<Body>` at `[0,0,0]` sits at the focus. For custom geometry, drop
  `<mesh>`/`<sphereGeometry>` etc. (R3F intrinsics) directly inside `<Scene3D>`.
  - ⚠️ These helpers are **decorations, not simulators** — e.g. `<Planet>` moves at
    a constant rate, not by any physical law. When a lesson's teaching point is the
    quantitative behaviour itself (real dynamics, rates, a specific distribution),
    don't rely on a helper's built-in motion: model the relationship yourself
    (`useFrame`/`useMemo`) and verify it against the concept.

Note: three uses fixed hex colors, not theme CSS vars (three can't parse `oklch`) —
pass hex to 3D objects. Exception: `<Label3D>` is a drei `<Html>` overlay, so it
uses theme text color like the rest of your DOM.

Note: a `<Scene3D>` (or `<Chart>`) only paints once its container has a non-zero
width — both defer rendering via a ResizeObserver so they never mount at 0px. On a
normal page load this is instant; in a headless/embedded harness that starts
collapsed, the canvas can look blank until the first layout — dispatching a window
`resize` forces it. This is expected, not a bug.

**Examples**: `docs/examples/` holds ready-to-copy 3D lessons (e.g. `cell.tsx` — a
procedural animal cell with the `"cell"` mood). Copy one into `src/lesson/lesson.tsx`
as a starting point.

### Detailed models → load an asset (`<Model>`)

For photoreal/organic shapes (anatomy, animals, machinery) that aren't practical to
code-generate, use the `<Model>` block — it wraps `useGLTF` + animation playback:

```tsx
import { Scene3D, Model } from "@/faraday/three";
<Scene3D mood="lab"><Model url="/models/fox.glb" scale={0.05} animation="Walk" /></Scene3D>
```

Drop the `.glb` in `public/models/`. Curated open-license sources: **NASA 3D
Resources**, **Smithsonian 3D**, **NIH 3D / BioModels**, **Poly Haven** (CC0),
Khronos glTF sample assets (CC0), and CC-licensed **Sketchfab**. Keep files small;
prefer procedural when it's clear enough. See `docs/examples/model.tsx` (a CC0 fox).

### Physics (`--physics`)

Scaffold with `faraday new --physics` for the Rapier engine (implies `--3d`). Wrap
scene bodies in `<Physics>` from `@react-three/rapier`:

```tsx
import { Physics, RigidBody } from "@react-three/rapier";
<Scene3D mood="physics"><Physics gravity={[0,-9.8,0]}>
  <RigidBody type="fixed"><mesh><boxGeometry args={[16,0.5,16]} /></mesh></RigidBody>
  <RigidBody colliders="ball" restitution={0.7} position={[0,9,0]}><mesh><sphereGeometry args={[0.6]} /></mesh></RigidBody>
</Physics></Scene3D>
```

Use physics only for genuine dynamics (collisions, joints, stacking). For scripted
motion (orbits, pendulums-as-math), integrate in the render loop instead — it's lighter.

## Courses — bundle lessons into a textbook

`<Course>` (from `@/faraday/runtime`) turns several lessons into a navigable textbook
with chapter nav, prev/next, and `#hash` deep links. Make it your default export:

```tsx
import { Course } from "@/faraday/runtime";
export default function MyCourse() {
  return <Course title="…" chapters={[
    { slug: "intro", title: "Intro", element: <IntroChapter /> },   // each chapter is a normal <Lesson>
    { slug: "next",  title: "Next",  element: <NextChapter /> },
  ]} />;
}
```

Keep chapter components in `src/lesson/chapters/`. See `docs/examples/course.tsx`.

### Curricula & worlds (unlock progression, swappable packs)

For a graph of lessons with **unlock progression** (not just linear chapters), use
`<CurriculumHost>` from `@/faraday/world`. You declare a `Curriculum` (nodes with
`requires` + per-node `lesson`); the host owns progress, the world↔lesson toggle,
the HUD, and an event stream for LMS/tutor hooks. The *shape* of the world is a
swappable **pack** (ports-and-adapters) — change one prop, keep the content:

- `linearPack` — a status list (baseline, no deps). `@/faraday/world`
- `map2dPack` — a 2D SVG node map (game-like). `@/faraday/world`
- `world3dPack` — a 3D open-world constellation (needs `--3d`). `@/faraday/three`

```tsx
import { CurriculumHost, map2dPack, type Curriculum } from "@/faraday/world";
const curriculum: Curriculum = { title: "…", nodes: [
  { id: "a", title: "A", meta: { x: 15, y: 50 }, lesson: <LessonA /> },
  { id: "b", title: "B", requires: ["a"], meta: { x: 55, y: 50 }, lesson: <LessonB /> },
]};
export default () => <CurriculumHost curriculum={curriculum} pack={map2dPack} />;
```

`meta.{x,y}` (0..100) place nodes on the map/world (percentages of the pack's
canvas — `map2dPack` is a fixed 720×440 SVG, so `y:50` centres and extreme `x`
can clip labels); omit them for an auto layout. A lesson self-completes via
`useNode().complete()` — the idiomatic wiring is `<Quiz onCorrect={complete} />`
(answer correctly → node done → dependents unlock); the learner can also press
Finish. See `docs/examples/curriculum.tsx` (+ `curriculum3d.tsx` with `--3d`).

## Checking your work

- `pnpm check` — structure + integrity gates.
- `pnpm dev` — serve and drive the controls.
- `pnpm build` — static bundle in `dist/` (what a future platform would deploy).
- `pnpm typecheck` — optional TypeScript check.
