# Pack: `three` — 3D scenes (agent guide)

Load this when the lesson needs a **3D scene**, an orbital/spatial model, or a **3D
curriculum world**. It is the skill half of the `three` pack; the runtime half is
the pinned `@faraday-academy/three` package.

## When to reach for 3D

3D earns its cost only when the *idea is spatial* — orbits, fields, molecules,
forces, anatomy, geometry in space. If the concept reads fine in 2D (a chart, a
number line, a stepped list), stay 2D. A 3D scene that could have been a diagram
fails the quality bar.

## API surface

Import from `@faraday-academy/three`:

- `<Scene3D mood={…}>` — the R3F canvas. **Every scene must carry a `mood`**:
  `space` · `cell` · `lab` · `physics` · `abstract`. The mood sets lighting,
  background, and palette so the world reads as one place.
- Procedural helpers (prefer these over assets): `<Body>`, `<Planet>`,
  `<OrbitPath>`, `<Label3D>`.
- `<Model src="/models/x.glb" />` — glTF loader, **asset fallback** only when a
  procedural helper can't express it.

**Procedural-first, asset-fallback.** Reach for a `.glb` only when the shape is
genuinely irreducible to the helpers.

## Physics variant (`--physics` / `pack add three --physics`)

Adds `@react-three/rapier`. Use for gravity/collision that the learner *feels* —
a Galton board, a pendulum, orbital capture. Don't fake with physics what a
closed-form curve shows more clearly.

## Composing with the rest of the lesson

- 3D is a block inside the normal lesson — wrap it in `<Workbench>` with live
  `<ControlGroup>` knobs so the reader manipulates the scene, not just watches it.
- For a 3D *curriculum world* (nodes as a navigable constellation), use the
  `world3dPack` from `@faraday-academy/three` with `<CourseHost>`.

## Quality gate

See `quality.md` in this pack. The key rules: every scene carries a `mood`, the
reader can *manipulate* the scene, and 3D is chosen because the idea is spatial.
