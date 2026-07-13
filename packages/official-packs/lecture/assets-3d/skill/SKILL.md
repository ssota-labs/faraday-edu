# Pack: `assets-3d` — 3D models & glTF (index)

Load when a lecture needs **3D assets** for `world3d`, `world3dRpg`, or `<Model>` scenes.
This pack is **skill-only** — models land in the lesson's `public/` folder.

## Lesson paths

```
public/models/           # .glb / .gltf meshes
public/textures/         # optional separate textures
```

Use with the `three` pack:

```tsx
import { Model } from "@faraday-academy/three/model";
<Model url="/models/fox.glb" scale={0.5} />
```

## T0 — Procedural-first (prefer)

Before importing meshes, use the **`three` pack** built-ins:

- `Scene3D` primitives (boxes, spheres, lines)
- `helpers` — grids, axes, labels
- `moods` — lighting presets

Procedural scenes are zero-asset, fast, and agent-friendly. Import GLB only when the
subject needs a specific shape (molecule, anatomy, vehicle).

## T1 — Curated CC0 sources

| Source | What | License |
|---|---|---|
| [Poly Haven](https://polyhaven.com/models) | HDRIs, models | CC0 |
| [Khronos glTF samples](https://github.com/KhronosGroup/glTF-Sample-Assets) | Reference GLBs | mixed; check per asset |
| [Kenney 3D](https://kenney.nl/assets?q=3d) | Low-poly kits | CC0 |
| [NASA 3D Resources](https://nasa3d.arc.nasa.gov) | Spacecraft, planets | public domain |

Place in `public/models/` and record sources in `CREDITS.md`.

## T2 — AI generation (text → GLB)

When CC0 doesn't fit:

| Tool | Use |
|---|---|
| [Meshy](https://meshy.ai) | Text/image → GLB |
| [Tripo](https://tripo3d.ai) | Fast stylized meshes |
| [Sorceress 3D Studio](https://sorceress.studio) | 3D → 2D sprite sheets (pair with `assets-2d`) |

**Workflow:** prompt → export GLB → optimize (gltf-transform) → `public/models/`.

## 2D fallback

For preschool `game-view` lectures, **3D is usually overkill**. Options:

1. Stay on 2D `<GameView>` + `assets-2d`
2. Render a 3D model to a sprite sheet (Sorceress, ai-game-art-pipeline) → `assets-2d`

## Pair with

- **`three`** — runtime for rendering; `world3dRpgPack` for walkable 3D course shells.
- **`assets-2d`** — sprite fallbacks and UI.
- **`game-view`** — 2D lecture presentation; 3D game-view is a v3 template.
