# map2d — present a curriculum as a 2D map

A **curriculum presentation**: a full-bleed 2D node map rendered as an immersive
game screen (grid floor, vignette, glowing status nodes, dashed locked paths). The
curriculum core (`<CurriculumHost>`) still owns progress and unlock; this pack only
decides *how it looks*.

## Install

```bash
faraday pack add map2d
```

Copies an author-editable component to `src/lesson/map2d/` (no npm deps). It's yours
to tweak — node radius, colors (theme tokens only), the layout.

## Use

```tsx
import { CurriculumHost, useNode, type Curriculum } from "@faraday-academy/runtime/world";
import { map2dPack } from "./map2d";

const curriculum: Curriculum = { title: "…", nodes: [ /* … */ ] };
export default () => <CurriculumHost curriculum={curriculum} pack={map2dPack} />;
```

- Place nodes with `meta.{x,y}` (0..100) to read like a path/tree; omit for an
  auto layout by prerequisite depth.
- Give every node a `summary` + `reward.xp` — the immersive HUD's briefing panel
  shows them (a bare title reads as an empty intel window).
- Swap presentations by swapping the pack: `linearPack` (built into the runtime,
  document-style) or `world3dPack` (from the `three` pack, 3D). The content doesn't
  change — only the pack prop.

## Quality

It's an **immersive** presentation: the host mounts it as a full-viewport game
screen with a HUD. Verify by screenshotting a real, non-zero viewport (test a narrow
width too) — every node, including the current objective, must frame on screen. See
the skill's quality bar.
