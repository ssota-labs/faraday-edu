# map2d — course shell: 2D lecture map

A **course shell**: a full-bleed 2D lecture map rendered as an immersive
game screen (grid floor, vignette, glowing status nodes, dashed locked paths). The
course core (`<CourseHost>`) still owns progress and unlock; this pack only
decides *how lectures are navigated*.

## Install

```bash
faraday pack add map2d
```

Copies an author-editable component to `src/lesson/map2d/` (no npm deps). It's yours
to tweak — node radius, colors (theme tokens only), the layout.

## Use

```tsx
import { CourseHost, useNode, type Course } from "@faraday-academy/runtime/world";
import { map2dPack } from "./map2d";

const course: Course = { title: "…", nodes: [ /* … */ ] };
export default () => <CourseHost course={course} pack={map2dPack} />;
```

- Place lectures with `meta.{x,y}` (0..100) to read like a path/tree; omit for an
  auto layout by prerequisite depth.
- Give every lecture a `summary` + `reward.xp` — the immersive HUD's briefing panel
  shows them (a bare title reads as an empty intel window).
- Swap course shells by swapping the pack: `linearPack` (built into the runtime,
  document-style) or `world3dPack` (from the `three` pack, 3D). The content doesn't
  change — only the pack prop.

## Quality

It's an **immersive** course shell: the host mounts it as a full-viewport game
screen with a HUD. Verify by screenshotting a real, non-zero viewport (test a narrow
width too) — every lecture, including the current objective, must frame on screen. See
the skill's quality bar.
