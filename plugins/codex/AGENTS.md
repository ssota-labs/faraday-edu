# 3d-stem — Codex instructions

Install the Faraday Academy Codex plugin (or `npx skills add ssota-labs/faraday-academy`)
to load the **`3d-stem`** skill.

## What it is

A skill that authors **fullscreen 3D interactive STEM textbooks** (Vite + React +
R3F). Scripts under `skills/3d-stem/scripts/` scaffold and gate structure; you
judge pedagogy and visual clarity.

## Loop

1. `node skills/3d-stem/scripts/stem.mjs scaffold <name> --json`
2. Author `src/scene/LessonScene.tsx` (fullscreen canvas first).
3. `node skills/3d-stem/scripts/stem.mjs check --dir <lesson> --json`
4. `pnpm dev` — verify visually. Never claim success from check alone.

Optional education UI: copy from `apps/ui` shadcn registry. Do **not**
`npm install @faraday-academy/ui` or use `npx @faraday-academy/cli`.

## Non-negotiables

- Fullscreen 3D primary surface — no LMS/dashboard chrome.
- No `@faraday-academy/*` product dependencies in the lesson.
- Design (intake → scene spec) before large codegen.
