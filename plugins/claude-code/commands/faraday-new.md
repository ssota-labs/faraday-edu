---
description: Scaffold a new Faraday interactive lesson and set up authoring.
argument-hint: "<topic or lesson name>"
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

The user wants to scaffold a new Faraday interactive lesson: **$ARGUMENTS**

Follow the `faraday` skill. Steps:

1. **Pick a name.** Derive a short kebab-case `<name>` from the topic. `faraday new`
   always scaffolds a plain 2D lesson — capabilities are module packs you add after
   scaffolding. Decide which packs the topic needs (skill's decision guide):
   - `three` if the subject is inherently spatial (astronomy, molecules, geometry, anatomy).
   - `three --physics` only for genuine dynamics (collisions, gravity, stacking).
   - `tutor` if the reader should be able to ask questions.
   If the request is ambiguous, make the reasonable default (plain 2D, no tutor) and say so.

2. **Scaffold** (installs deps):
   ```bash
   npx @faraday-academy/cli@latest new <name> --json
   ```
   (Pre-publish local dev: `node <faraday-academy>/packages/cli/bin/faraday.mjs new <name> --json`.)
   Parse the `--json` result for the created dir and next steps, then `cd` in. Then add
   any capabilities the topic needs, e.g. `faraday pack add three`,
   `faraday pack add three --physics`, or `faraday pack add tutor`.

3. **Read the in-project guide** (`AGENTS.md`, `docs/authoring.md`) and the skill's
   `references/blocks.md` before writing any lesson code. If a `docs/examples/*.tsx`
   fits the topic, copy it to `src/lesson/lesson.tsx` as a starting point.

4. **Author** `src/lesson/lesson.tsx`: one interactive idea, a `<Workbench>` (or
   `<Stage>`) centerpiece, semantic theme colors only, ending in a `<Quiz>`.

5. **Verify**: `pnpm check` (must exit 0), then `pnpm dev` and drive every control;
   fix console errors. If you added the `tutor` pack, remind the user to add
   `AI_GATEWAY_API_KEY` to `.env.local` (see the `/faraday-tutor` command).

6. **Summarize** what you built, the dev URL, and any missing-primitive notes.

For a fully hands-off pass, delegate to the **faraday-author** subagent instead.
