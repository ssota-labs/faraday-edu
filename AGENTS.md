# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Faraday Academy** — product surface is the **`3d-stem`** coding-agent
skill that authors fullscreen 3D STEM interactive textbooks, plus an education UI
**shadcn registry** at `apps/ui`. It is a **pnpm workspace** (`apps/*`, `packages/*`,
`docs`; see `pnpm-workspace.yaml`). Legacy CLI/kit/LMS/pack packages are quarantined
— see [`legacy/QUARANTINE.md`](legacy/QUARANTINE.md). Canonical intent lives under
`docs/content/docs` (vision, GTM, PRD/SPEC/PLAN).

### Toolchain / dependencies
- Node **v22** and **pnpm** (`pnpm@11.5.2`, pinned via `packageManager`) are pre-installed.
  A committed root `pnpm-lock.yaml` + `pnpm-workspace.yaml` drive `pnpm install` at the repo root.
- **No committed `.cursor/environment.json`** — if that file is in git, Cursor disables **Runtime
  Secrets** on the environment dashboard (*"managed by environment.json"*). Configure the **update
  script** and secrets in [Cloud Agents → your environment](https://cursor.com/dashboard?tab=cloud-agents)
  instead; see [`.cursor/README.md`](.cursor/README.md).
- There is **no ESLint/Prettier**; the lint-equivalent gate is `typecheck` (tsc) on remaining apps.
  Prefer `pnpm --filter @faraday-academy/edu-ui typecheck`. Skill scripts are plain `.mjs` covered by
  `node --test skills/3d-stem/scripts/*.test.mjs`.

### Secrets → `.env.local` on startup
**Do not commit `.cursor/environment.json`** if you need dashboard Runtime Secrets — Cursor
locks secret editing when install/start are code-managed (see `.cursor/README.md`).

1. **Cursor dashboard** → Cloud Agents → this repo’s environment → **Runtime Secrets**  
   Names must match `.env.example` (`NPM_TOKEN`, `VERCEL_TOKEN`, …).
2. **Update script** in the same environment page:

   ```sh
   pnpm install
   test -f scripts/setup-env-local.mjs && node scripts/setup-env-local.mjs || true
   ```

3. `scripts/setup-env-local.mjs` writes matching `process.env` values into `.env.local`
   (git-ignored, names-only logs). Re-run: `pnpm setup:env`. After adding/changing secrets,
   run **Start Setup Agent → Update Existing Env** so the VM picks them up.

### Product path — `3d-stem` skill
- Canonical skill: `skills/3d-stem/` (`SKILL.md`, `scripts/`, `references/`, `templates/`).
- Mirror into plugins: `pnpm sync:skills` / `pnpm sync:skills:check`.
- Scaffold: `node skills/3d-stem/scripts/stem.mjs scaffold <name> [--json] [--skip-install]`
- Check: `node skills/3d-stem/scripts/stem.mjs check --dir <lesson> [--json]`
- Tests: `node --test skills/3d-stem/scripts/*.test.mjs`
- Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.
- Lessons must **not** depend on published `@faraday-academy/*` runtime packages.
- Optional HUD UI: `pnpm --filter @faraday-academy/edu-ui dev` (port **4300**) + shadcn registry
  under `/r/*.json`.

### Education UI registry (`apps/ui`)
- Long-running browse surface for education components + registry JSON.
- `pnpm --filter @faraday-academy/edu-ui registry:build` regenerates `public/r/`.

### Legacy (not product)
- `packages/cli`, `kit`, `lms`, `official-packs`, `registry`, `apps/platform`, `apps/labs` —
  quarantined. Do not document `npx @faraday-academy/cli` or `faraday pack add` as supported.
- `pnpm publish:packages` refuses (skill-first release, not npm suite).

## Architecture — skill-first

```
skills/3d-stem/          product body
plugins/*/skills/3d-stem marketplace mirrors
apps/ui/                 education UI + shadcn registry
docs/content/docs/       Oh My Docs handbook
```

Dependency direction for changes:

`product vision → PRD → story → specification/ADR → implementation plan → code`

<!-- oh-my-docs:start -->
# Oh My Docs

This repository uses a docs-first workflow. Canonical product intent lives under
`docs/content/docs` (or `apps/docs/content/docs` when present).

## Docs-first gate

1. Classify the change as `product`, `bugfix`, `maintenance`, or docs-only.
2. Product changes require an active PRD, a story, an accepted specification, and a ready plan.
3. Bug fixes require an existing PRD/specification and a ready plan.
4. Maintenance requires a ready plan; add a specification if an observable contract changes.
5. If required documents are missing, create and review a docs-only change first.
6. An implementation PR must reference a plan that already exists on the PR base with `stage: ready|active` and covering `codeAreas`.
7. Docs-only edits under the docs content/templates trees (plus root `README.md` / `CHANGELOG.md`) are exempt. There is no general bypass.

Dependency direction:

`product vision → PRD → story → specification/ADR → implementation plan → code`

Create drafts with `node <skill>/scripts/omd.mjs new <kind> --title "…" --yes`.
Run `node <skill>/scripts/omd.mjs check` before opening an implementation PR.
<!-- oh-my-docs:end -->
