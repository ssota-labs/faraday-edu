# 3d-stem — Codex plugin

Author **fullscreen 3D interactive STEM textbooks** from Codex. Skill-first:
bundled scripts gate structure; you judge pedagogy and visual clarity.

## Install

```
codex plugin marketplace add ssota-labs/faraday-academy
```

Or: `npx skills add ssota-labs/faraday-academy` (loads **`3d-stem`**).

## Loop

1. Read `skills/3d-stem/SKILL.md`.
2. `node skills/3d-stem/scripts/stem.mjs scaffold <name> --json`
3. Author the fullscreen R3F scene; consult `references/` as needed.
4. `node skills/3d-stem/scripts/stem.mjs check --dir <lesson> --json`
5. `pnpm dev` — verify visually.

Optional HUD components: `apps/ui` shadcn registry (see skill `references/registry-ui.md`).

## Not in v1

`npx @faraday-academy/cli`, LMS, pack add, platform payments.
