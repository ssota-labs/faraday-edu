# Legacy quarantine (PLAN-001)

These packages and apps are **not** the v1 product path after the 3d-stem pivot.
They remain in the monorepo briefly for history / dogfood migration and will be
deleted or further archived in follow-up PRs.

| Path | Former role | Product status |
|---|---|---|
| `packages/cli` | `@faraday-academy/cli` scaffolder | Retired — use `skills/3d-stem/scripts` |
| `packages/kit` | Lesson blocks / runtime | Retired — greenfield R3F template |
| `packages/ui` | npm UI package | Retired as install path — use `apps/ui` registry |
| `packages/lms` | Progress recorder / dashboard | Out of scope (LMS) |
| `packages/official-packs` | Module pack marketplace | Out of scope |
| `packages/registry` | Pack/block catalog generator | Superseded by shadcn registry |
| `apps/platform` | Pack/block catalog site | Not product core |
| `apps/labs` | Kit block lab | Not 3D showcase (see template + `apps/ui`) |

**Do not** document `npx @faraday-academy/cli`, `faraday pack add`, or npm pins
as the supported author path. Release tagging versions the **skill**, not an npm
suite publish (`scripts/publish-packages.mjs` refuses product publishes).
