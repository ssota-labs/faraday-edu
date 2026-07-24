---
description: Scaffold a fullscreen 3D STEM lesson via the 3d-stem skill
argument-hint: "<topic-or-name>"
---

Scaffold and begin authoring a **fullscreen 3D STEM** lesson with the `3d-stem` skill.

1. Read `skills/3d-stem/SKILL.md` (or the plugin copy under `skills/3d-stem/`).
2. Run intake → learning design → scene spec (references) before heavy codegen.
3. Scaffold:

```bash
node skills/3d-stem/scripts/stem.mjs scaffold "$ARGUMENTS" --json
```

4. Author `src/scene/LessonScene.tsx` through build passes; run `check` before claiming done.
5. Preview with `pnpm dev` in the lesson directory.

Do **not** use `npx @faraday-academy/cli` or pin `@faraday-academy/*` packages.
