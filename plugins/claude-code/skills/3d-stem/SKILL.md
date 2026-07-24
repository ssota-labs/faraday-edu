---
name: 3d-stem
description: Author fullscreen 3D interactive STEM textbooks — science, engineering, math, and CS concepts learners can orbit, scrub, and break until they click. Use when someone wants a 3D STEM lesson, visual concept explainer, orbital/mechanics/geometry/algorithm visualization, or to replace slides with a manipulable 3D scene. Triggers on "3d-stem", "3D lesson", "fullscreen 3D", "STEM interactive textbook", "teach X in 3D".
---

# 3d-stem — fullscreen 3D STEM textbooks

You author **one job**: a **fullscreen 3D interactive textbook** for a STEM
concept. Scripts enforce structure and gates; you judge visual clarity and
pedagogy.

**Not in scope (v1):** LMS, rosters, grades, hosted platform, payments,
marketplace, npm `@faraday-academy/*` runtime pins, multi-view course shells.

## When to use

- The concept is spatial, geometric, mechanical, algorithmic, or otherwise
  clearer when manipulated in 3D.
- The learner should *see and change* the idea — not watch a canned video.

If the topic is not suitable for 3D visual explanation, reframe or refuse with
a short reason.

## Hard rules

1. **Fullscreen 3D first** — primary viewport is the scene. HUD/controls may
   overlay; no dashboard or LMS chrome.
2. **No `@faraday-academy/*` product deps** — lessons use open stack
   (Vite + React + R3F/Three). Optional education UI via **shadcn registry**
   copy, not npm pins.
3. **Design before codegen** — intake → learning design → scene/interaction
   spec → scaffold → build passes → verify.
4. **Fail closed** — never claim done if `check` fails.
5. **Pedagogy without LMS** — load references for learning design / assessment
   / quality; never reintroduce roster or grades.

## Authoring loop

| Step | Do | Reference / script |
|---|---|---|
| 1. Intake | Topic, learner level, “what should click?”, constraints | [references/intake.md](references/intake.md) |
| 2. Learning design | Outcomes, misconceptions, interaction thesis | [references/learning-design.md](references/learning-design.md) |
| 3. Scene spec | What is modeled, controls, camera, feedback | [references/scene-spec.md](references/scene-spec.md) · [references/interactive-design.md](references/interactive-design.md) |
| 4. Scaffold | Stamp the lesson template | `node <skill>/scripts/stem.mjs scaffold <name> --json` |
| 5. Build passes | blockout → structure → interaction → readability → polish | Unlock next only after gate + review |
| 6. Verify | Deterministic check + preview judgment | `node <skill>/scripts/stem.mjs check --dir <lesson> --json` · [references/quality-bar.md](references/quality-bar.md) |
| 7. Preview | Local Vite server | `pnpm dev` in the lesson |

### Scripts (agents drive these)

```bash
node <skill>/scripts/stem.mjs scaffold <name> [--dir <path>] [--json] [--skip-install] [--force]
node <skill>/scripts/stem.mjs check [--dir <path>] [--json]
```

Prefer `--json` for machine steps. Exit codes: `0` ok · `1` check failed ·
`2` usage · `4` environment.

`<skill>` is this skill root (e.g. `skills/3d-stem` in the repo, or the
installed skill path).

## Division of labor

| Layer | Owns |
|---|---|
| Skill scripts | Scaffold, required-file gates, unlock/check JSON |
| You (agent) | Topic framing, pedagogy, 3D clarity, code authorship |
| shadcn registry | Optional HUD controls / readouts copied into the lesson |
| Lesson toolchain | Vite preview / static deploy (not a Faraday platform) |

## Education UI (optional)

When a lesson needs a param control, numeric readout, or light overlay chrome:

1. Browse the in-repo library: `apps/ui` (`pnpm --filter @faraday-academy/edu-ui dev`).
2. Install via shadcn registry (copy into the lesson) — see
   [references/registry-ui.md](references/registry-ui.md).
3. **Do not** `npm install @faraday-academy/ui`.

If a registry piece is missing, inline a minimal control rather than pinning a
legacy npm package.

## Build passes (strict)

Do not dump a finished lesson in one shot. Stage work:

1. **Blockout** — camera, ground/axis, placeholder meshes, empty HUD.
2. **Structure** — concept geometry / data model visible.
3. **Interaction** — primary manipulable variable wired; scene responds.
4. **Readability** — labels, contrast, reduced-motion path.
5. **Polish** — materials, motion restraint, assessment feedback.

Run `check` before declaring a pass complete. Spec too shallow → stop and
deepen the scene/interaction spec first.

## Pedagogy references (load on demand)

| Need | File |
|---|---|
| Progression / mastery intent (no LMS) | [learning-design.md](references/learning-design.md) |
| Interaction thesis | [interactive-design.md](references/interactive-design.md) |
| Check form vs outcome verb | [assessment.md](references/assessment.md) |
| Acceptance rubric | [quality-bar.md](references/quality-bar.md) |
| 3D craft notes | [craft-3d.md](references/craft-3d.md) |

## Legacy note

The old skill name `faraday` and `npx @faraday-academy/cli` are **retired**.
Redirect authors to this skill. Do not scaffold vinext + kit/ui pin lessons.
