# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Faraday Academy** monorepo (`@faraday-academy/*`): the `@faraday-academy/cli`
scaffolder that stamps out minimal vinext + React interactive lessons, plus the runtime packages
those lessons pin. It is a **pnpm workspace** (`apps/*`, `packages/*`; see
`pnpm-workspace.yaml`). The workspace ships `apps/platform` (Next.js pack/block catalog) and
`apps/labs` (internal Vite block dev surface). See `README.md` for the command reference.

### Toolchain / dependencies
- Node **v22** and **pnpm** (`pnpm@11.5.2`, pinned via `packageManager`) are pre-installed on the
  base image. A committed root `pnpm-lock.yaml` + `pnpm-workspace.yaml` drive a single
  `pnpm install` at the repo root that links all workspace projects. The `@faraday-academy/*`
  packages are published on npm (currently `0.3.0` for the simplified surface).
- **No committed `.cursor/environment.json`** — if that file is in git, Cursor disables **Runtime
  Secrets** on the environment dashboard (*"managed by environment.json"*). Configure the **update
  script** and secrets in [Cloud Agents → your environment](https://cursor.com/dashboard?tab=cloud-agents)
  instead; see [`.cursor/README.md`](.cursor/README.md).
- There is **no ESLint/Prettier**; the lint-equivalent gate is `typecheck` (tsc). Run per package,
  e.g. `pnpm --filter @faraday-academy/kit typecheck` (also `lms`, `ui`, `platform`, and
  `@faraday-academy/labs`). The CLI is plain `.mjs` — no typecheck, covered by its unit tests.

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

### Running / testing the CLI (from repo root)
- Tests: `node --test packages/cli/src/*.test.mjs` (Node's built-in runner; no ports, no services).
- Scaffold a lesson: `node packages/cli/bin/faraday.mjs new <name>` — this shells out to `pnpm install`
  inside the generated lesson (needs npm-registry access). Skip installing with
  `--skip-install` or `FARADAY_SKIP_INSTALL=1` (handy in CI / offline).
- Verify a lesson: `node packages/cli/bin/faraday.mjs check --dir <lesson>` (layout + exact pins).
- Module packs: `pack list [--json]` · `block list [--json]` · `pack add <name|source> [--dir]`
  (source = official name · `./path` · `owner/repo` · `npm:<spec>`) · `pack remove <name>` ·
  `pack show <name|source>` · `pack validate <name|source>` ·
  `pack new <name> [--kind skill|copy|runtime]`. `faraday new` scaffolds a minimal vinext lesson
  with **no packs pre-installed** — install explicitly with `faraday pack add`.
- Exit codes: `0` ok · `1` check failed · `2` usage error · `4` environment error.

### Labs dev app (`apps/labs`)
- The one long-running service in this repo. Run `pnpm --filter @faraday-academy/labs dev`
  (Vite, fixed port **4200**, `--host`) to preview every runtime block live, then open
  `http://localhost:4200/`. `build`/`preview`/`typecheck` scripts exist too. It previews the
  `packages/kit` source directly via the `@/faraday` alias, so runtime edits hot-reload here.

### Working inside a generated lesson
- `pnpm check` (structure + pin gates), `pnpm typecheck`, `pnpm build`, `pnpm dev`.
- Author in `src/lesson/**`. The runtime is pinned `@faraday-academy/kit` + `@faraday-academy/ui`,
  not vendored — `faraday check` verifies the layout + exact pins.

## Architecture — two-layer module map

Faraday is modular on **two layers at once**; extending it means adding a **module pack** that
touches both. Keep the two in sync — new runtime code without matching skill knowledge is
invisible to the agent, and vice versa.

**Runtime layer** — `packages/*`, pinned as `@faraday-academy/*` by generated lessons:
- `kit/blocks/` — lesson blocks (layout, controls, assessment, explanation).
- `kit/runtime/` — `course`, `stepper`, `theme-provider`.
- `ui/` — shadcn/Base UI primitives and theme CSS.
- `lms/` — optional recorder + dashboard (separate package).
- `registry/` — generated pack/block catalog for CLI and `apps/platform`.

**Skill layer** — `plugins/claude-code/skills/faraday/` (mirrored under `plugins/codex/`):
- `SKILL.md` front door pulls in `references/*.md` per phase: `discovery` `curriculum`
  `learning-design` `interactive-design` `assessment` `design` `quality-bar` `blocks` `packs`.

**Module packs** live in `packages/official-packs/<category>/<name>/` (contract:
`packages/official-packs/pack.schema.json`) and bind the two layers via `pack.json`.
`faraday pack add <name|source>` installs both halves into a lesson. Official packs are
bundled into the CLI at `prepack` and catalogued in `@faraday-academy/registry`. Install
explicitly — `faraday new` ships none by default. See [`specs/module-packs.md`](specs/module-packs.md).

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
