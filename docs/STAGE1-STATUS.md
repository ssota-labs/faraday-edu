# Stage 1 Soft Launch — execution status

> Updated by the soft-launch implementation branch. Pair with [LAUNCH-STAGE1.md](LAUNCH-STAGE1.md).

## Gates

| Gate | Status | Notes |
|---|---|---|
| Phase 0 — MIT license on `@faraday-academy/*` + root `LICENSE` | Done | |
| Phase 0 — npm `@faraday-academy` auth | **Blocked** | No `NPM_TOKEN` in Cursor Secrets. Add secret named `NPM_TOKEN`, then `node scripts/setup-env-local.mjs` + `pnpm publish:packages`. |
| A1 — publish prep (`private` removed, `files`, peers `0.1.0`, `publishConfig`) | Done | `pnpm publish:packages:dry` packs OK |
| A1 — live `npm publish` + clean `npx` | **Blocked** | Needs `NPM_TOKEN` + org publish rights. CI: `.github/workflows/publish-npm.yml` |
| A2 — marketplace → `ssota-labs/faraday-academy` | Done | `.claude-plugin/marketplace.json` + plugin READMEs/JSON |
| A2 — human Claude/Codex install smoke | **Human** | Run `/plugin marketplace add ssota-labs/faraday-academy` in a clean session |
| B — S1 `examples/compound-interest` | Done | Lesson authored + `vercel.json` |
| B — C★ `examples/voyage-log` | Done | Prior art; CTA added |
| B — live demo URLs | **Vercel (preferred)** | See [VERCEL-DEMOS.md](VERCEL-DEMOS.md). |
| A3 — local cold E2E (`scripts/stage1-cold-e2e.mjs`) | Done | CLI tests + scaffold 2D/3D + example builds passed |
| A3 — agent cold E2E | **Human** | Claude 2D/3D + Codex after npm publish |
| A5 Go/No-Go | **No-Go for public content** | Blocked on live npm + Vercel demos. Checklist below. |
| C — content drafts #1–#3 | Done | [CONTENT-STAGE1.md](CONTENT-STAGE1.md) — social publish after Go |

## Expected demo URLs

**Preferred: Vercel** — import the repo twice with Root Directory
`examples/compound-interest` and `examples/voyage-log`. Step-by-step:
[VERCEL-DEMOS.md](VERCEL-DEMOS.md).

After deploy (names are suggestions):

- S1: `https://faraday-demo-interest.vercel.app`
- C★: `https://faraday-demo-voyage.vercel.app`

## Commands

```bash
# pack-only validation
pnpm publish:packages:dry

# real publish (needs NPM_TOKEN)
pnpm publish:packages

# local cold path
node scripts/stage1-cold-e2e.mjs
```

## Go / No-Go checklist

- [ ] `npx @faraday-academy/cli@latest new …` works from registry
- [x] marketplace docs use `ssota-labs/faraday-academy`
- [ ] Claude ≥2 + Codex ≥1 cold E2E (human)
- [ ] Live demos ≥2 (Pages or Vercel)
- [x] Content drafts + fixed CTA ready
