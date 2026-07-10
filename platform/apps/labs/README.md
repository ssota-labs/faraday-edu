# Faraday Labs

An **internal** Vite lab for the dev team that does two things:

- **Components** — renders the `@faraday/runtime` blocks **live** from demo stories, grouped
  (Blocks, UI, Runtime, World, LMS), with each block's header doc, exported symbols, source path,
  and a usage snippet. Click a block in the sidebar to preview it.
- **Skills & Packs** — catalogs what the agent plugins expose: the `faraday` skill + its phase
  references, the slash commands, the authoring subagent, plus the world packs and feature packs
  (`--3d` / `--tutor`) the CLI overlays.

## Why Vite (not Next)

Previews must match production. A generated lesson is a **Vite + React 19** app where components
import via the `@/faraday/*` alias and are themed by `faraday.css`. This lab recreates exactly that
environment — same alias (pointed at `packages/runtime`), same stylesheet, wrapped in
`ThemeProvider` + `.style-faraday` like `LessonHost` — so a block renders here identically to how it
renders in a real lesson.

## Run it

```bash
pnpm install                       # from platform/ (workspace)
pnpm --filter @faraday/labs dev    # → http://localhost:4200
```

## How it works

- **Live previews** — `src/stories.tsx` holds one demo per block (real components, real props). The
  preview canvas renders them inside the same theme + style wrapper a lesson uses. Stories live in
  the labs app, **not** in `packages/runtime`, so the vendored runtime stays clean + SHA-lockable.
- **Catalog metadata** — `src/catalog.ts` parses raw source via Vite `import.meta.glob`: runtime
  component groups (header docs + exports), the skill/commands/agents/plugins under `plugins/`, and
  the world/feature packs. No server needed.

## Adding a preview

A new block has a card but no live render until you add a story. Add an entry to `DEMOS` in
`src/stories.tsx` keyed by the component name, with a `render()` and a `source` snippet.
