# Authoring reference

A lesson is a React component tree assembled from Faraday blocks (which are built
on shadcn / Base UI).

**A lesson is a textbook chapter, not a gadget.** Its goal is that the learner
understands the concept; interactions serve the explanation. A substantial
lesson carries several *different* interactive figures — a manipulable model
(`<Workbench>`), a plotted relationship (`<Chart>` fed by the real model), a
stepped walkthrough or comparison, a runnable `<CodeCell>` where the audience
codes — each set up and then interpreted by real prose, with every symbolic
expression rendered by `<TeX>`. The acceptance rubric is
[docs/quality-bar.md](quality-bar.md); grade yourself against it.

The interactive centerpiece of a section is usually a `<Workbench>` — a live
canvas with a floating control panel of `<ControlGroup>` sections (this is what
the bundled demos use). Canonical *section* shape (a chapter strings several of
these arcs together):

```tsx
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Scrubber, Quiz, Callout } from "@faraday-academy/runtime/blocks";
import { useStepper } from "@faraday-academy/runtime/runtime";

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

## Math, live readouts, runnable code

- **`<TeX>` — all math is LaTeX.** Inline in prose or `block` for display
  equations. Pass the TeX source as a string child; `String.raw` keeps
  backslashes readable:

  ```tsx
  <p>The swept area obeys <TeX>{String.raw`\tfrac{dA}{dt} = \tfrac{L}{2m}`}</TeX>.</p>
  <TeX block>{String.raw`T^2 = \frac{4\pi^2}{GM}\,a^3`}</TeX>
  ```

  Never typeset math as `<code>`, ASCII (`dA/dt = L/2m`), or unicode hacks.

- **`<Derivation>` — derive, don't decree.** A central formula must arrive the
  way a teacher would produce it: one line at a time, each move named. The
  learner presses "Next step"; the newest line slides in highlighted:

  ```tsx
  <Derivation
    title="Where the range formula comes from"
    steps={[
      { tex: String.raw`R = v_x\,T`, note: "range = horizontal speed × time aloft" },
      { tex: String.raw`T = \frac{2v_0\sin\theta}{g}`, note: "vertical motion: up and back down" },
      { tex: String.raw`R = v_0\cos\theta\cdot\frac{2v_0\sin\theta}{g}`, note: "substitute both" },
      { tex: String.raw`R = \frac{v_0^2\sin 2\theta}{g}`, note: "2 sinθ cosθ = sin 2θ" },
    ]}
  />
  ```

  Tie the first line to what the interactive just showed ("you saw the ball
  drift at constant vₓ — so range is vₓ × time"). Secondary results can defer
  their derivation to a `<Reveal>`; a result taken on authority should say so.

- **`<Readout>` + the Workbench `hud` slot — numbers live on the instrument.**
  Live measured values overlay the canvas as compact chips instead of a strip
  of `<Stat>` cards dumped under the figure:

  ```tsx
  <Workbench hud={<><Readout label="Area A" value={areaA.toFixed(3)} />
                    <Readout label="Δ" value={`${pct.toFixed(1)}%`} tone="primary" /></>}
             controls={…}>
    <MyVisual … />
  </Workbench>
  ```

  Reserve `<Stat>` for one deliberate summary moment, if any.

- **`<CodeCell code label? caption?>` — editable, runnable JavaScript.** Runs in
  a sandboxed iframe with `console.*` captured to an output panel; the learner
  edits and re-runs. Use it when the audience codes or the concept is
  algorithmic (verify a law numerically, implement the update rule); skip it
  where code would be noise.

  ```tsx
  <CodeCell
    label="Check Kepler's third law"
    caption="Try other semi-major axes — does T²/a³ stay constant?"
    code={`const T = (a) => Math.sqrt(a ** 3);\nfor (const a of [1, 2, 4]) console.log(a, (T(a) ** 2 / a ** 3).toFixed(3));`}
  />
  ```

## Checks — five forms, matched to the outcome verb

Assessment is not "an MCQ at the end". Match the check's form to what the
learner should be able to DO, and close every section's loop (concept → sim →
check). Chapters typically open with a prediction (pretest), run formative
checks per section, and end with the strongest summative gate the outcome
supports, wired to `complete()`:

| Outcome verb | Check | Component |
|---|---|---|
| recognize / recall | MCQ with misconception distractors | `<Quiz>` |
| calculate / estimate | typed numeric answer with tolerance | `<NumericAnswer answer unit? tolerance?>` |
| predict / visualize | sketch it (pen/Pencil/touch), reveal the true overlay, self-assess | `<SketchPad prompt overlay background?>` |
| do / tune / achieve | mission: reach the goal state inside the sim | `<Challenge goal done onDone>` |
| explain (open text) | tutor-graded conversation (`--tutor` only) | `<Tutor>` |

```tsx
<Challenge
  goal="Land within ±3 m of the 80 m flag."
  done={landed && Math.abs(landingX - 80) <= 3}
  hint="Range rises then falls with angle — bracket the flag from both sides."
  onDone={complete}
>
  <LaunchPad … />   {/* same sim, now with a visible flag at 80 m */}
</Challenge>
```

All hints are feed-forward (point back into the model, never just "wrong").

## Lesson layouts: book scroll (default) vs paged

The default lesson is a **book-like vertical scroll** (the reading column). For
audiences/contexts that want **one idea per screen** — young learners, tablet or
kiosk use — wrap the content in `<SlideDeck>`: each page fills the viewport height,
one shows at a time (prev/next, dot rail, arrow keys), and only the active page
stays mounted (per-page state resets on return, like `<Course>` chapters):

```tsx
<Lesson title="…" lead="…">
  <SlideDeck slides={[
    { id: "push",    title: "Push",    content: <PushPage /> },     // one idea
    { id: "squeeze", title: "Squeeze", content: <SqueezePage /> },  // per page
    { id: "check",   title: "Check",   content: <CheckPage /> },
  ]} />
</Lesson>
```

Inside a page, split canvas/prose for landscape with
`<div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">…</div>`. Layout is a
per-request choice (audience sets the default, the ask overrides); the quality
bar applies to the lesson as a whole regardless of layout.

## Interaction craft — direct, alive, never snapping

The feel of an interactive is graded ([docs/quality-bar.md](quality-bar.md),
Surface 3). Three motion hooks from `@faraday-academy/runtime/runtime` do the heavy lifting:

- **Drag the object, not a detached slider** — when the variable lives on an
  object (a position, angle, vector, boundary), make the object grabbable:

  ```tsx
  const drag = useSvgDrag((x, y) => setTip(clampToRange({ x, y })));
  <circle {...drag} cx={tip.x} cy={tip.y} r={9} cursor="grab"
          className="transition-[r] hover:r-11" style={{ fill: "var(--primary)" }} />
  ```

  Keep sliders for handle-less quantities (counts, rates). A `<Workbench>`
  whose interactions all live on the canvas needs no panel — omit `controls`.

- **Discrete changes ease, never teleport** — render positions from
  `useAnimatedValue`; changing the target animates there with a spring:

  ```tsx
  const cx = useAnimatedValue(selected === "A" ? 80 : 240);  // eases on switch
  <circle cx={cx} … />
  ```

- **Dynamic concepts keep moving** — if the concept has time in it, run it:

  ```tsx
  const [playing, setPlaying] = useState(true);
  useRafLoop((dt) => setAngle((a) => a + omega * dt), playing);
  // Play/Pause lives ON the canvas:
  <Workbench hud={<Button size="sm" onClick={() => setPlaying(p => !p)}>
    {playing ? <PauseIcon /> : <PlayIcon />}</Button>} …>
  ```

Emphasize what changed (highlight/trail/pulse), and make grabbable things look
grabbable (handle, `cursor-grab`, hover response).

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

The runtime ships these shadcn primitives at `@faraday-academy/runtime/ui/*` (button, card, slider,
tabs, accordion, alert, badge, radio-group, toggle-group, switch, progress,
separator, label, tooltip). Compose those. Do **not** run `shadcn add` — it writes
— the UI lives in the pinned `@faraday-academy/runtime` package, not your lesson. If you truly need a
missing primitive, note it in your summary.

## 3D lessons (Three.js) — opt-in

Scaffold with `faraday new <name> --3d` to include a Three.js (React Three Fiber)
block + a solar-system demo. **Without `--3d`, three is never installed or bundled**
— 2D lessons stay light. Import the 3D block from `@faraday-academy/three`:

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

**Colour split:** DOM/SVG/Tailwind → semantic tokens (never raw `#hex`). three.js
material colours → **hex required** (three can't parse `oklch`). Exception:
`<Label3D>` is a drei `<Html>` overlay and uses theme text like the rest of the DOM.

`<Scene3D>` defaults to `mood="neutral"` and logs a **dev warning** — domain scenes
must set `space`/`cell`/`lab`/`physics`/`abstract`.

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
import { Scene3D, Model } from "@faraday-academy/three";
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

`<Course>` (from `@faraday-academy/runtime/runtime`) turns several lessons into a navigable textbook
with chapter nav, prev/next, and `#hash` deep links. Make it your default export:

```tsx
import { Course } from "@faraday-academy/runtime/runtime";
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
`<CourseHost>` from `@faraday-academy/runtime/world`. You declare a `Course` (nodes with
`requires` + per-node `lesson`); the host owns progress, the world↔lesson toggle,
the HUD, and an event stream for LMS/tutor hooks. The *shape* of the world is a
swappable **pack** (ports-and-adapters) — change one prop, keep the content:

- `linearPack` — a status list (doc-style, renders inline). `@faraday-academy/runtime/world`
- `map2dPack` — a 2D tactical node map (game screen). `@faraday-academy/runtime/world`
- `world3dPack` — a 3D open-world constellation (game screen, needs `--3d`). `@faraday-academy/three`

Game packs are **immersive**: the host mounts the world as a full-viewport game
screen (no page header, no reading column) and overlays a game HUD — a status
plate (title, per-node progress ticks, XP), a briefing panel for the focused
node (summary, reward, Enter — so give every node a `summary` and a
`reward.xp`), and a control hint. Entering a node switches to the doc-style
lesson view (the textbook); leaving returns to the world. Pass
`immersive={false}` to force a game pack inline (e.g. a small map embedded in a
course page), or `hint="…"` to override the HUD hint.

```tsx
import { CourseHost, map2dPack, type Course } from "@faraday-academy/runtime/world";
const course: Course = { title: "…", nodes: [
  { id: "a", title: "A", meta: { x: 15, y: 50 }, lesson: <LessonA /> },
  { id: "b", title: "B", requires: ["a"], meta: { x: 55, y: 50 }, lesson: <LessonB /> },
]};
export default () => <CourseHost course={curriculum} pack={map2dPack} />;
```

Keep `curriculum` at **module scope** (stable identity). Defining it inside the
component recreates the object every render and wipes progress — `CourseHost`
warns in dev when that happens.

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
