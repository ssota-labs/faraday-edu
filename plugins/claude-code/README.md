# 3d-stem — Claude Code plugin

Author **fullscreen 3D interactive STEM textbooks** from Claude Code. Skill-first:
bundled scripts gate structure; you judge pedagogy and visual clarity.

## Install

```
/plugin marketplace add ssota-labs/faraday-academy
/plugin install 3d-stem@faraday-academy
```

Local checkout:

```
/plugin marketplace add /path/to/faraday-academy
/plugin install 3d-stem@faraday-academy
```

Or via skills: `npx skills add ssota-labs/faraday-academy` (loads **`3d-stem`**).

## What you get

- **Skill `3d-stem`** — intake → learning design → scene spec → scaffold → build
  passes → check → preview. Pedagogy references load on demand (no LMS).
- **Slash commands** — `/stem-new`, `/stem-check` (legacy `/faraday-*` redirect).
- **Education UI** — optional shadcn registry at `apps/ui` (not npm `@faraday-academy/ui`).

## Scripts

```bash
node skills/3d-stem/scripts/stem.mjs scaffold <name> --json
node skills/3d-stem/scripts/stem.mjs check --dir <lesson> --json
```

## Not in v1

Public npm CLI, LMS, pack marketplace, hosted platform payments.
