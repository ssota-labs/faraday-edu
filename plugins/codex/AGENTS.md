# Faraday — Codex instructions

Drop this into a project root as `AGENTS.md` (or append to `~/.codex/AGENTS.md`)
for the zero-dependency path. For the full authoring reference, install the
Faraday Codex plugin (see this folder's README) — it ships the `faraday` skill
with `blocks.md` / `tutor.md` / `worlds.md`.

## What Faraday is

A CLI scaffolder for AI-authored interactive textbooks. `faraday new <name>`
produces a self-contained Vite + React app for **one interactive lesson**; flags
add a grounded AI tutor (`--tutor`), 3D (`--3d`), and physics (`--physics`).
Invoke the CLI as `npx @faraday-academy/cli@latest <args>` (pre-publish local dev:
`node /path/to/faraday-academy/packages/cli/bin/faraday.mjs <args>`).

## The two-zone rule (governs everything)

- **Author zone** `src/lesson/**` — write here. `src/lesson/lesson.tsx` is the
  fixed entry and must `export default` a React component.
- **Runtime dependency** `@faraday-academy/*` — pinned UI/blocks/runtime/styles/world,
  installed from npm. **You consume it, can't edit it.** `faraday check` (`pnpm check`) fails on
  any drift. Never run `shadcn add` (the UI is in the runtime, not your lesson). Missing primitive →
  note it, don't fork the runtime.

## The loop

1. `npx @faraday-academy/cli@latest new <name> [flags] --json` → parse JSON, `cd` in.
2. Read the scaffold's `AGENTS.md` + `docs/authoring.md`; start from a
   `docs/examples/*.tsx` when one fits.
3. Author `src/lesson/lesson.tsx` from `@faraday-academy/runtime/blocks` + `@faraday-academy/runtime/runtime`:
   a `<Lesson>` frame, a `<Workbench>` (or `<Stage>`) interactive centerpiece, a
   `<Callout>` key idea, a closing `<Quiz>`.
4. `pnpm check` must exit 0 (fix drift by reverting locked-tree edits).
5. `pnpm dev` — read the Local URL, drive every control, fix console errors.
   **Never claim success from `check` alone.**

## Non-negotiables

- Semantic theme colors only — `text-muted-foreground`, `bg-card`, and in SVG
  `style={{ fill: "var(--primary)" }}`. Never `#hex` or `text-blue-500`.
- Domain `<Scene3D>` scenes **must** set a `mood` (`space`/`cell`/`lab`/`physics`/
  `abstract`); shipping `neutral` for a real subject is a defect.
- `--tutor` needs `AI_GATEWAY_API_KEY` in the lesson's `.env.local` (never commit
  it); on Vercel it uses OIDC. Ground the tutor by passing lesson text as
  `context`. Verify `/api/chat` streams with `curl` (preview tools mishandle SSE).
- One lesson / one idea. No routing/backend/network calls (except the author-editable
  `--tutor` server layer). Don't add dependencies unless truly needed.
