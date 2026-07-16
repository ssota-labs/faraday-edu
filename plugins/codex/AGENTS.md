# Faraday — Codex instructions

Drop this into a project root as `AGENTS.md` (or append to `~/.codex/AGENTS.md`)
for the zero-dependency path. For the full authoring reference, install the
Faraday Codex plugin (see this folder's README) — it ships the `faraday` skill
with `blocks.md` and `packs.md`.

## What Faraday is

A CLI scaffolder for AI-authored interactive textbooks. `faraday new <name>`
produces a minimal vinext + React app for **one interactive lesson** with kit/ui
pinned and **no packs pre-installed**; add capabilities with `faraday pack add <name>`.
Invoke the CLI as `npx @faraday-academy/cli@latest <args>` (pre-publish local dev:
`node /path/to/faraday-academy/packages/cli/bin/faraday.mjs <args>`).

## The two-zone rule (governs everything)

- **Author zone** `src/lesson/**` — write here. `src/lesson/lesson.tsx` is the
  fixed entry and must `export default` a React component.
- **Runtime dependency** `@faraday-academy/*` — pinned UI/blocks/runtime/styles,
  installed from npm. **You consume it, can't edit it.** `faraday check` (`pnpm check`) fails on
  any drift. Never run `shadcn add` (the UI is in `@faraday-academy/ui`, not your lesson).

## The loop

1. `npx @faraday-academy/cli@latest new <name> --json` → parse JSON, `cd` in.
   Then `faraday pack add <name>` for each pack the topic needs.
2. Read the scaffold's `AGENTS.md` + `docs/authoring.md`; start from a
   `docs/examples/*.tsx` when one fits.
3. Author `src/lesson/lesson.tsx` from `@faraday-academy/kit/blocks` + `@faraday-academy/kit/runtime`:
   a `<Lesson>` frame, a `<Workbench>` (or `<Stage>`) interactive centerpiece, a
   `<Callout>` key idea, a closing `<Quiz>`.
4. `pnpm check` must exit 0 (fix drift by reverting locked-tree edits).
5. `pnpm dev` — read the local URL, drive every control, fix console errors.
   **Never claim success from `check` alone.**

## A whole course (long-running)

Building many lessons is a long-running task — don't hold it all in one context.

1. **Scaffold first:** `faraday init <first-app>` starts a repo (root `AGENTS.md` +
   `apps/<first-app>/`); `faraday new <name>` adds more apps. One app = one independent
   project = one curriculum. Install design-time packs with `faraday pack add`.
2. **Persist the plan** to `apps/<app>/.faraday/plan/<plan-id>/` — a node table in
   `overview.md` + one brief file per node in `nodes/<id>.md` (outcome, interaction,
   check, source, packs, requires, status).
3. **Build lesson-by-lesson**, one file per node at `src/lesson/nodes/<id>.tsx`,
   assembled into the module-scope `curriculum` in `src/lesson/lesson.tsx`. Codex has
   no sub-agents — build **sequentially**, and **resume from the plan folder** (first
   `todo`/`building` node) after any reset. The plan is the memory, not the chat.

See `references/orchestration.md` in the installed skill for the full loop.

## Non-negotiables

- Semantic theme colors only — `text-muted-foreground`, `bg-card`, and in SVG
  `style={{ fill: "var(--primary)" }}`. Never `#hex` or `text-blue-500`.
- One lesson / one idea. No routing/backend/network calls. Don't add dependencies
  unless truly needed.
