# Faraday Labs

An **internal** Vite lab for the dev team that does two things:

- **Components** — renders the `@faraday-academy/runtime` blocks **live** from demo stories, grouped
  (Blocks, UI, Runtime, World, LMS), with each block's header doc, exported symbols, source path,
  and a usage snippet. Click a block in the sidebar to preview it.
- **Skills & Packs** — catalogs what the agent plugins expose: the `faraday` skill + its phase
  references, the slash commands, the authoring subagent, **official module packs** (auto from
  `packages/official-packs/**/pack.json`), plus the world packs and legacy feature-pack
  templates (`--3d` / `--tutor`) the CLI overlays.

## Why Vite (not Next)

Previews must match production. A generated lesson is a **Vite + React 19** app where components
import via the `@/faraday/*` alias and are themed by `faraday.css`. This lab recreates exactly that
environment — same alias (pointed at `packages/runtime`), same stylesheet, wrapped in
`ThemeProvider` + `.style-faraday` like `LessonHost` — so a block renders here identically to how it
renders in a real lesson.

## Run it

```bash
pnpm install                       # from the repo root (workspace)
pnpm --filter @faraday-academy/labs dev    # → http://localhost:4200
```

## How it works

- **Live previews** — `src/stories.tsx` holds one demo per block (real components, real props). The
  preview canvas renders them inside the same theme + style wrapper a lesson uses. Stories live in
  the labs app, **not** in `packages/runtime`, so the vendored runtime stays clean + SHA-lockable.
- **Catalog metadata** — `src/catalog.ts` parses raw source via Vite `import.meta.glob`: runtime
  component groups (header docs + exports), the skill/commands/agents/plugins under `plugins/`,
  official module packs (`packages/official-packs/**/pack.json`), and the world/legacy feature
  packs. No server needed.

## Adding a preview

A new **runtime block** has a card but no live render until you add a story. Add an entry to `DEMOS` in
`src/stories.tsx` keyed by the component name, with a `render()` and a `source` snippet.

A new **official module pack** auto-appears under **Skills & Packs → Official packs** once its
`pack.json` lands in `packages/official-packs/`. For `copy`/`runtime` packs that ship UI, also wire a
live demo — import from `packages/official-packs/<category>/<name>/runtime/…` in `stories.tsx`, or
vendored copy for world renderers (`src/pack-map2d.tsx`). See `plugins/claude-code/agents/faraday-pack-author.md`
step 7 (labs wire-up). `skill`-only packs need no preview.
