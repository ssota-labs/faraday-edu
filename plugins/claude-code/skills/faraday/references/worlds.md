# Courses, worlds, 3D, LMS

## `<Course>` — linear textbook

Bundle several lessons into a navigable textbook (chapter nav, prev/next, `#hash`
deep links). Make it your default export; keep chapter components in
`src/lesson/chapters/`. Each chapter **remounts when you switch to it** (keyed by
slug), so per-chapter `useState` / `useStepper` resets cleanly — no stale state
leaks across chapters. You can freely mix stepped and continuous chapters.

```tsx
import { Course } from "@faraday-academy/runtime/runtime";
export default function MyCourse() {
  return <Course title="…" chapters={[
    { slug: "intro", title: "Intro", element: <IntroChapter /> },   // each is a normal <Lesson>
    { slug: "next",  title: "Next",  element: <NextChapter /> },
  ]} />;
}
```

## `<CurriculumHost>` — graph / world with unlock progression

For a graph of lessons with **unlock progression** (not just linear chapters).
You declare a `Curriculum` (nodes with `requires` + a per-node `lesson`); the host
owns progress, the world↔lesson toggle, the HUD, and an event stream for
LMS/tutor hooks. The *shape* of the world is a swappable **pack**
(ports-and-adapters) — change one prop, keep the content:

- `linearPack` — status list (doc-style, renders inline). `@faraday-academy/runtime/world`
- `map2dPack` — 2D tactical node map (**game screen**). `@faraday-academy/runtime/world`
- `world3dPack` — 3D open-world constellation (**game screen**, needs the `three` pack). `@faraday-academy/three`

**Game packs are immersive.** The host mounts the world as a full-viewport game
screen — no page header, no reading column — and overlays a game HUD: a status
plate (curriculum title, per-node progress ticks, XP), a briefing panel for the
focused node, and a control hint. The briefing panel is fed by node data, so
**give every node a `summary` and a `reward.xp`** — a bare title reads as an
empty intel window. Entering a node switches to the doc-style lesson view (the
textbook); leaving returns to the world. `immersive={false}` forces a game pack
inline (small map embedded in a page); `hint="…"` overrides the HUD hint. Do
**not** wrap an immersive world in `<Lesson>`/prose — the world IS the screen.

```tsx
import { CurriculumHost, map2dPack, type Curriculum } from "@faraday-academy/runtime/world";
// Module scope — REQUIRED. Recreating this object inside the component resets progress.
const curriculum: Curriculum = { title: "…", nodes: [
  { id: "a", title: "A", meta: { x: 15, y: 50 }, lesson: <LessonA /> },
  { id: "b", title: "B", requires: ["a"], meta: { x: 55, y: 50 }, lesson: <LessonB /> },
]};
export default () => <CurriculumHost curriculum={curriculum} pack={map2dPack} />;
```

`meta.{x,y}` (0..100) place nodes on the map/world — percentages of the pack's
canvas (`map2dPack` is a fixed 720×440 SVG, so `y:50` centres and extreme `x` can
clip labels); omit for auto layout. A lesson self-completes via
`useNode().complete()`; the idiomatic wiring is **`<Quiz onCorrect={complete} />`**
(answer correctly → node done → dependents unlock). The learner can also press
Finish. See `docs/examples/curriculum.tsx` (+ `curriculum3d.tsx` with the `three` pack).

> **Progress footgun:** keep `curriculum` at **module scope**. Defining it inside
> the component creates a new object every render and wipes unlock state.
> `CurriculumHost` warns in dev when identity flips with the same title.

## 3D lessons (`three` pack) — Three.js / R3F

Import from `@faraday-academy/three`. `three` is only installed/bundled with the `three` pack (`faraday pack add three`).

**Colour split:** DOM/SVG/Tailwind → semantic tokens (never raw `#hex`). three.js
material `color` props → **hex required** (three can't parse `oklch`). `<Label3D>`
is the exception (DOM overlay → theme text).

- `<Scene3D mood height? camera? controls? autoRotate?>` — preconfigured R3F
  canvas (perspective camera, OrbitControls). Drop into a `<Workbench>` center;
  bind panel controls to scene state via React. **`mood` is required for domain
  scenes** — omitting it defaults to `"neutral"` and logs a **dev warning**.
- Procedural helpers (compose for astronomy, physics, chemistry, math surfaces, a
  stylized cell — **all code-generated, no assets**):
  - `<Body position? radius? color? emissive? emissiveIntensity?>` — a stationary
    sphere (star, nucleus, moon).
  - `<OrbitPath a e? color? opacity?>` — the elliptical orbit line. The ellipse is
    offset so its **focus sits at the origin** — put a `<Body>` at `[0,0,0]` and it
    lands at the focus (exactly what a Kepler/orbit scene wants).
  - `<Planet a e? size? speed? color? phase?>` — a sphere orbiting the origin at a
    constant parametric rate.
  - `<Label3D position>{…}</Label3D>` — an HTML label. Being a drei `<Html>`
    overlay it **does** use theme text color — the one exception to "3D = hex only".

  For custom geometry, drop R3F intrinsics (`<mesh>`/`<sphereGeometry>`) directly
  inside `<Scene3D>`. Bind panel controls by holding state in the **lesson**
  component (not inside the Canvas) and passing it as props to components rendered
  under `<Scene3D>`; a `useFrame` reads the latest prop each frame.

> **Helpers are decorations, not simulators.** `<Planet>` moves at a constant
> parametric rate — fine for atmosphere, wrong for teaching Kepler. When the
> teaching point **is** equal areas / real dynamics, integrate yourself
> (`useFrame` + `M = E − e·sinE`); `examples/voyage-log/src/lesson/nodes/kepler.tsx`
> shows the integration *technique* (Newton-solve Kepler's equation, wedge
> areas) — copy the math, **not** the page structure: that file predates the
> quality bar (ASCII math in `<code>`, a `<Stat>` strip under the figure, a
> single interactive) and fails it as a lesson. Always verify quantitative
> claims against the concept (see SKILL.md).

### MANDATORY: domain scenes must carry a `mood`

A `<Scene3D>` for a real subject **must** set `mood` to match — a domain scene
shipping `neutral` is a defect.

| Subject | `mood` | Look |
|---|---|---|
| astronomy, space, gravity | `"space"` | deep-black + starfield |
| biology, cells, microscopy | `"cell"` | ethereal teal haze + drifting motes |
| chemistry, molecules | `"lab"` | clean bright lab + grid |
| mechanics, forces | `"physics"` | dim studio + reference grid |
| math, abstract geometry | `"abstract"` | minimal dark |
| UI/plumbing demo only | `"neutral"` | transparent (rare) |

Match procedural object palettes to the mood too (glowing bodies in space,
bioluminescent cyans in a cell). Note: three uses fixed hex colors, not theme CSS
vars (it can't parse `oklch`). Pass hex to 3D objects.

`docs/examples/` holds ready-to-copy 3D lessons (e.g. `cell.tsx`). Copy one into
`src/lesson/lesson.tsx` as a starting point.

### Detailed models → `<Model>` (glTF)

For photoreal/organic shapes not practical to code-generate:

```tsx
import { Scene3D, Model } from "@faraday-academy/three";
<Scene3D mood="lab"><Model url="/models/fox.glb" scale={0.05} animation="Walk" /></Scene3D>
```

Drop `.glb` in `public/models/`. Curated open-license sources: NASA 3D Resources,
Smithsonian 3D, NIH 3D / BioModels, Poly Haven (CC0), Khronos glTF samples (CC0),
CC-licensed Sketchfab. Prefer procedural when it's clear enough.

### Physics (`three --physics`)

Rapier engine (the `--physics` variant of the `three` pack). Wrap scene bodies in
`<Physics>` from `@react-three/rapier`:

```tsx
import { Physics, RigidBody } from "@react-three/rapier";
<Scene3D mood="physics"><Physics gravity={[0,-9.8,0]}>
  <RigidBody type="fixed"><mesh><boxGeometry args={[16,0.5,16]} /></mesh></RigidBody>
  <RigidBody colliders="ball" restitution={0.7} position={[0,9,0]}><mesh><sphereGeometry args={[0.6]} /></mesh></RigidBody>
</Physics></Scene3D>
```

Use physics only for genuine dynamics (collisions, joints, stacking). For scripted
motion (orbits, pendulums-as-math), integrate in the render loop — it's lighter.

**Your scaffolded `src/lesson/lesson.tsx` is already a working Rapier demo** — the
fastest physics starter is to adapt it, not a `docs/examples/` file. Two things
every non-trivial physics lesson needs that Rapier provides (not Faraday-specific,
but you'll reach for them immediately):

- **Constrain the process to the dimensions it lives in.** A planar process (a
  Galton board, Plinko, 2D collisions) will drift and scatter in the third axis
  unless you lock it — pass `enabledTranslations={[true, true, false]}` (and/or
  lock rotations) on the moving bodies. Decide the real degrees of freedom before
  spawning many bodies.
- **Read simulation state back out to teach with it.** A sim is only a *demo* until
  you measure it. To drive a `<Chart>`, a `<Stat>`, a `<Quiz>`, or `complete()`
  from what actually happened, keep a `ref` to each `RigidBody` and sample
  `ref.current.translation()` in a `useFrame` (throttled), then feed those numbers
  into a block. This is the bridge from "genuine dynamics" to an assessable lesson —
  and the thing to **verify**: confirm the measured result matches the concept (a
  Galton board should approach a binomial/normal shape, not an arbitrary pile).

## LMS — progress tracking

The `@faraday-academy/runtime/lms` module exposes a progress recorder + dashboard components
that attach to a lesson or a whole curriculum. Wire it to the `CurriculumHost`
event stream:

```tsx
import { CurriculumHost } from "@faraday-academy/runtime/world";
import { useLmsRecorder, ProgressDashboard } from "@faraday-academy/runtime/lms";
const rec = useLmsRecorder("my-course");           // → { onEvent, events, clear }
<CurriculumHost curriculum={c} pack={map2dPack} onEvent={rec.onEvent} />
<ProgressDashboard events={rec.events} />          // summarizes internally
```

For a cohort read-out pass `learners={[{ id, name, summary: summarize(rec.events) }]}`
(`summarize` builds the `LmsSummary`, incl. `perNode`). Use for roster/progress.
Like everything in the runtime, it's a pinned dependency — compose it, don't edit it.

## Rendering gotcha (3D & charts)

A `<Scene3D>` or `<Chart>` only paints once its container has non-zero width (both
watch an **element** `ResizeObserver` so they never mount at 0px). On a normal page
load this is instant. In a headless/collapsed harness it can stay blank until first
layout — and note a **window** `resize` event may not rescue it (the observer is on
the element, not `window`). The reliable fix is to give the container a real width
**before mount**: verify at a non-zero viewport, and if you loaded collapsed,
(re)navigate/relayout so the element gets measured. Expected, not a bug — but see
the verification note: a chart/scene that never gets width reads as "broken" when
it's only unmeasured.
