# Stage 1 Soft Launch — execution status

> **Historical (npm `0.3.0` era).** Superseded by the
> [3d-stem pivot vision](content/docs/vision.mdx)
> ([PRD-001](content/docs/planning/prds/prd-3d-stem-interactive-textbook-skill.mdx)).
> Kept for audit trail only.
>
> Updated after Phase 1 registry reset (`0.3.0`). Pair with [LAUNCH-STAGE1.md](LAUNCH-STAGE1.md).

## Gates

| Gate | Status | Notes |
|---|---|---|
| Phase 0 — fair-code license on `@faraday-academy/*` + root `LICENSE` | Done | |
| Phase 0 — npm `@faraday-academy` auth | Done | `NPM_TOKEN` in CI secrets; tag `v0.3.0` published |
| A1 — publish prep (`files`, peers, `publishConfig`) | Done | `pnpm publish:packages:dry` packs OK |
| A1 — live `npm publish` + clean `npx` | Done | `@faraday-academy/{ui,kit,lms,cli}@0.3.0` on registry (tag `v0.3.0`) |
| A2 — marketplace → `ssota-labs/faraday-academy` | Done | `.claude-plugin/marketplace.json` + plugin READMEs/JSON |
| A2 — human Claude/Codex install smoke | **Human** | Run `/plugin marketplace add ssota-labs/faraday-academy` in a clean session |
| B — workspace examples | **Deferred** | `examples/` cleared; new reference lessons TBD |
| B — live demo URLs | **Deferred** | Platform catalog + fresh examples not deployed yet. See [VERCEL-DEMOS.md](VERCEL-DEMOS.md). |
| A3 — local cold E2E (`scripts/stage1-cold-e2e.mjs`) | Done | CLI tests + vinext scaffold check/typecheck/build |
| A3 — agent cold E2E | **Human** | Claude/Codex after confirming `npx @faraday-academy/cli@0.3.0` |
| A5 Go/No-Go | **No-Go for public content** | npm `0.3.0` live; platform + demo URLs still missing |
| C — content drafts #1–#3 | Done | [CONTENT-STAGE1.md](CONTENT-STAGE1.md) — social publish after Go |

## Expected demo URLs

Deferred until new workspace examples and/or `apps/platform` are deployed.

Historical Vercel notes (pre-`examples/` removal): [VERCEL-DEMOS.md](VERCEL-DEMOS.md).

## Commands

```bash
# pack-only validation
pnpm publish:packages:dry

# real publish (needs NPM_TOKEN; or push a v* tag)
pnpm publish:packages

# local cold path
pnpm stage1:cold-e2e
```

## Go / No-Go checklist

- [x] `npx @faraday-academy/cli@0.3.0 new …` works from registry
- [x] marketplace docs use `ssota-labs/faraday-academy`
- [ ] Claude ≥2 + Codex ≥1 cold E2E (human)
- [ ] Live catalog or lesson demos deployed (Vercel)
- [x] Content drafts + fixed CTA ready
