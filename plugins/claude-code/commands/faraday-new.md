---
description: Scaffold a new Faraday interactive lesson and set up authoring.
argument-hint: "<topic or lesson name>"
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

The user wants to scaffold a new Faraday interactive lesson: **$ARGUMENTS**

Follow the `faraday` skill. Steps:

1. **Pick a name.** Derive a short kebab-case `<name>` from the topic. `faraday new`
   scaffolds a minimal vinext lesson with **no packs pre-installed**. Decide which
   packs the topic needs (skill's decision guide), then install them explicitly:
   - `faraday pack add audience` / `lecture-design` / `stem-methods` when pedagogy matters.
   - `faraday pack add sim2d` for SVG formula simulations.
   - `faraday pack add game2d` or `storybook-game2d` for game-style delivery.
   If the request is ambiguous, keep it simple (plain 2D, no extra packs) and say so.

2. **Scaffold** (installs deps):
   ```bash
   npx @faraday-academy/cli@latest new <name> --json
   ```
   (Pre-publish local dev: `node <faraday-academy>/packages/cli/bin/faraday.mjs new <name> --json`.)
   Parse the `--json` result for the created dir and next steps, then `cd` in.
   Run `faraday pack add <name>` for each pack the topic needs.

3. **Read the in-project guide** (`AGENTS.md`, `docs/authoring.md`) and the skill's
   `references/blocks.md` before writing any lesson code. If a `docs/examples/*.tsx`
   fits the topic, copy it to `src/lesson/lesson.tsx` as a starting point.

4. **Author** `src/lesson/lesson.tsx`: one interactive idea, a `<Workbench>` (or
   `<Stage>`) centerpiece, semantic theme colors only, ending in a `<Quiz>`.

5. **Verify**: `pnpm check` (must exit 0), then `pnpm dev` and drive every control;
   fix console errors.

6. **Summarize** what you built, the dev URL, and any missing-primitive notes.

For a fully hands-off pass, delegate to the **faraday-author** subagent instead.
