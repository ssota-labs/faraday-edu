# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Faraday Academy** monorepo (`@faraday-academy/*`): the `@faraday-academy/cli`
scaffolder that stamps out self-contained Vite + React interactive lessons, plus the runtime,
3D, and tutor packages those lessons pin. There is no long-running service for the repo itself —
the CLI runs to completion. See `README.md` for the command reference; notes below cover
non-obvious caveats.

### Toolchain / dependencies
- Node **v22** and **pnpm** are pre-installed on the base image. The CLI has **zero** runtime
  dependencies (root `package.json` declares none), so the startup update script is a near
  no-op; nothing extra needs installing to run or test the CLI.
- There is no committed lockfile at the repo root, and running `npm install` here creates a
  stray `package-lock.json` — avoid committing it.

### Secrets → `.env.local` on startup
- `scripts/setup-env-local.mjs` runs from the startup update script. It reads the KEY names in
  `.env.example` and writes any matching values found in the environment (where Cursor injects
  saved Secrets) into `.env.local`, preserving keys already present. It logs key **names only**,
  never values, and `.env.local` is git-ignored.
- To materialize a secret, save it as a Cursor Secret whose name **exactly matches** a key in
  `.env.example` (e.g. add `AI_GATEWAY_API_KEY` to `.env.example` + Secrets). With no matching
  Secrets it is a no-op and writes nothing. Re-run manually with `node scripts/setup-env-local.mjs`
  (add `--dir <path>` to target a generated lesson's own `.env.example`, e.g. a `--tutor` lesson).

### Running / testing the CLI (from repo root)
- Tests: `node --test packages/cli/src/*.test.mjs` (Node's built-in runner; no ports, no services).
- Scaffold a lesson: `node packages/cli/bin/faraday.mjs new <name>` — this shells out to `pnpm install`
  inside the generated lesson (needs npm-registry access). Skip installing with
  `--skip-install` or `FARADAY_SKIP_INSTALL=1` (handy in CI / offline).
- Verify a lesson: `node packages/cli/bin/faraday.mjs check --dir <lesson>` (layout + exact pins).
- Module packs: `pack list [--json]` (catalog) · `pack add <name|source> [--physics] [--dir]`
  (source = official name · `./path` · `owner/repo` · `npm:<spec>`) · `pack remove <name>` ·
  `pack show <name|source>` (print skill guide) · `pack validate <name|source>`. Default packs
  (`lecture-design`, `audience`) auto-install at `new` (`--no-defaults` to skip).
- Exit codes: `0` ok · `1` check failed · `2` usage error · `4` environment error.

### Working inside a generated lesson (2D / `--3d` / `--physics`)
- `pnpm check` (structure + SHA-256 integrity gates), `pnpm typecheck`, `pnpm build`,
  `pnpm dev`, `pnpm preview` (fixed port 4173).
- **Non-obvious:** `pnpm dev` (Vite) deliberately uses **no fixed port** — it auto-selects a
  free one and prints the URL. Pin it for testing with `pnpm dev --port <port> --host`.
- Author in `src/lesson/**`. The runtime is a pinned `@faraday-academy/*` dependency, not
  vendored — there is no `src/faraday/**`; `faraday check` verifies the layout + exact pins.

### Tutor mode (`--tutor`)
- Adds a server-backed AI chat tutor: the generated app becomes a Vite + Nitro + Workflow
  hybrid serving on `http://localhost:3000`. It needs an `AI_GATEWAY_API_KEY` in the
  generated lesson's `.env.local` (Vercel AI Gateway) only for live model responses; it boots
  and compiles without one. This key belongs in the generated lesson, not this repo.

## Architecture — two-layer module map

Faraday is modular on **two layers at once**; extending it means adding a **module pack** that
touches both. Keep the two in sync — new runtime code without matching skill knowledge is
invisible to the agent, and vice versa.

**Runtime layer** — `packages/*`, pinned as `@faraday-academy/*` by generated lessons:
- `runtime/blocks/` — ~24 lesson blocks: layout & canvas (`Lesson` `Prose` `Stage` `Workbench`
  `ControlGroup` `Paged`), live controls (`ParamSlider` `ParamSwitch` `Segmented` `Scrubber`
  `Readout` `Chart` `Stat`), assessment (`Quiz` `NumericAnswer` `Challenge` `SketchPad`),
  explanation (`Derivation` `TeX` `CodeCell` `Reveal` `Compare` `Callout`).
- `runtime/world/` — curriculum host + `progression`/`store`/`hud`; swappable `packs/`
  (`linear`, `map2d`; the 3D pack lives in `three`). This is the reskin seam.
- `runtime/lms/` — `recorder` + `dashboard`. `runtime/runtime/` — `course`, `stepper`,
  `motion`, `theme-provider`.
- `three/` (via the `three` pack) — `scene`, `helpers`, `moods`, `model`, `world3d`,
  `physics/world3d-rpg`. `tutor/` (via the `tutor` pack) — docked `<Tutor>` + durable workflow agent.

**Skill layer** — `plugins/claude-code/skills/faraday/` (mirrored under `plugins/codex/`):
- `SKILL.md` front door (Discover → Design → Build → Verify → Ship) pulls in `references/*.md`
  per phase: `discovery` `audience` `curriculum` `learning-design` `interactive-design`
  `assessment` `pedagogy` `design` `quality-bar` `blocks` `worlds` `tutor`.

**Module packs** live in `packages/official-packs/<name>/` (contract:
`packages/official-packs/pack.schema.json`) and bind the two layers via a declarative
`pack.json` manifest (deps · `cssImports` · `copy` · `appends` · `scaffold` · `skill`).
`faraday pack add <name|source>` resolves the source (official name · `./path` ·
`owner/repo` github · `npm:<spec>`) then installs both halves into a lesson — runtime half
(`package.json`/`app.css`/copied files) **and** skill half (`.faraday/packs/<name>/` + an
`AGENTS.md` pointer), recorded in `.faraday/provenance.json`. Official packs are **bundled
into the CLI at `prepack`** (`scripts/bundle-packs.mjs` → `<cli>/packs`, gitignored); dev
reads `official-packs` directly. Five ship today: `three`, `tutor`, `srs`, `lecture-design`, `audience`. The last two are
**default packs** (`"default": true`) — `faraday new` auto-installs their skill halves so
every lesson carries the pedagogy + audience knowledge in `.faraday/packs/`; read them at
design time with `faraday pack show <name>`. `new --3d`/`--physics`/`--tutor` are thin aliases
over `installPack`. See `src/pack.mjs` (`resolvePack`/`installPack`/`removePack`/`readPackSkill`/
`validateManifest`) and [`specs/module-packs.md`](specs/module-packs.md).
