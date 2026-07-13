# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Faraday Academy** monorepo (`@faraday-academy/*`): the `@faraday-academy/cli`
scaffolder that stamps out self-contained Vite + React interactive lessons, plus the runtime,
3D, and tutor packages those lessons pin. It is now a **pnpm workspace** (`apps/*`, `packages/*`,
`examples/*`; see `pnpm-workspace.yaml`). The CLI itself runs to completion, but the workspace also
ships a long-running dev app — `apps/labs`, a Vite catalog that renders the runtime blocks live.
See `README.md` for the command reference; notes below cover non-obvious caveats.

### Toolchain / dependencies
- Node **v22** and **pnpm** (`pnpm@11.5.2`, pinned via `packageManager`) are pre-installed on the
  base image. A committed root `pnpm-lock.yaml` + `pnpm-workspace.yaml` drive a single
  `pnpm install` at the repo root that links all nine workspace projects. The `@faraday-academy/*`
  packages are also published on npm at `0.1.0`, so lessons scaffolded standalone resolve pins
  from the registry.
- **No committed `.cursor/environment.json`** — if that file is in git, Cursor disables **Runtime
  Secrets** on the environment dashboard (*"managed by environment.json"*). Configure the **update
  script** and secrets in [Cloud Agents → your environment](https://cursor.com/dashboard?tab=cloud-agents)
  instead; see [`.cursor/README.md`](.cursor/README.md).
- There is **no ESLint/Prettier**; the lint-equivalent gate is `typecheck` (tsc). Run per package,
  e.g. `pnpm --filter @faraday-academy/runtime typecheck` (also `three`, `tutor`, and
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
- Module packs: `pack list [--json]` (catalog) · `pack add <name|source> [--physics] [--dir]`
  (source = official name · `./path` · `owner/repo` · `npm:<spec>`) · `pack remove <name>` ·
  `pack show <name|source>` (print skill guide) · `pack validate <name|source>` ·
  `pack new <name> [--kind skill|copy|runtime]` (scaffold a new pack for authors). `new` is
  batteries-included: all default packs auto-install (`--no-defaults` to skip; `pack remove` to trim).
- Exit codes: `0` ok · `1` check failed · `2` usage error · `4` environment error.

### Labs dev app (`apps/labs`)
- The one long-running service in this repo. Run `pnpm --filter @faraday-academy/labs dev`
  (Vite, fixed port **4200**, `--host`) to preview every runtime block live, then open
  `http://localhost:4200/`. `build`/`preview`/`typecheck` scripts exist too. It previews the
  `packages/runtime` source directly via the `@/faraday` alias, so runtime edits hot-reload here.

### Working inside a generated lesson
- `pnpm check` (structure + SHA-256 integrity gates), `pnpm typecheck`, `pnpm build`,
  `pnpm dev`, `pnpm preview` (fixed port 4173).
- **Non-obvious ports:** a minimal (`--no-defaults`, no tutor) lesson's `pnpm dev` (plain Vite)
  uses **no fixed port** — it auto-selects a free one and prints the URL; pin it with
  `pnpm dev --port <port> --host`. But a batteries-included lesson from `faraday new` includes the
  tutor pack, so `pnpm dev` boots the Vite + Nitro hybrid on the **fixed port 3000** (see below).
- Author in `src/lesson/**`. The runtime is a pinned `@faraday-academy/*` dependency, not
  vendored — there is no `src/faraday/**`; `faraday check` verifies the layout + exact pins.

### Tutor pack (`faraday pack add tutor`)
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
  `ControlGroup` `SlideDeck`), live controls (`ParamSlider` `ParamSwitch` `Segmented` `Scrubber`
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

**Module packs** live in `packages/official-packs/<category>/<name>/` (contract:
`packages/official-packs/pack.schema.json`) and bind the two layers via a declarative
`pack.json` manifest (deps · `cssImports` · `copy` · `appends` · `scaffold` · `skill`).
`faraday pack add <name|source>` resolves the source (official name · `./path` ·
`owner/repo` github · `npm:<spec>`) then installs both halves into a lesson — runtime half
(`package.json`/`app.css`/copied files) **and** skill half (`.faraday/packs/<name>/` + an
`AGENTS.md` pointer), recorded in `.faraday/provenance.json`. Official packs are **bundled
into the CLI at `prepack`** (`scripts/bundle-packs.mjs` → `<cli>/packs`, gitignored); dev
reads `official-packs` directly. Default packs ship today: `three`, `tutor`, `srs`, `lecture-design`, `audience`, `exam`, `slide-view`,
`game2d`, `storybook-game2d`, `notes` (+ opt-in `map2d` course shell). **Default packs** (`"default": true`) — `faraday new` is
batteries-included and auto-installs every pack (skill + runtime), so each lesson carries all
the capabilities and the pedagogy/audience knowledge in `.faraday/packs/`. Use `--no-defaults`
for a minimal lesson, and `faraday pack remove <name>` to trim what a finished lesson doesn't
need (e.g. the heavy `three`/`tutor` runtimes). A pack's skill can be a **folder with an `entry`**
(front-door index, e.g. `lecture-design`/`exam`): `faraday pack show <name>` prints just the entry,
`pack show <name> <file>` a sub-file, `--all` everything — read them at design time, no lesson
needed. Capabilities are packs, not flags — one uniform mechanism for all. See `src/pack.mjs`
(`resolvePack`/`installPack`/`removePack`/`readPackSkill`/
`validateManifest`) and [`specs/module-packs.md`](specs/module-packs.md).
