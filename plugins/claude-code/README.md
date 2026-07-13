# Faraday — Claude Code plugin

Drive Faraday from your Claude Code session: scaffold interactive textbook
lessons, author them against the locked-tree + blocks contract, pass the quality
gates, embed a durable grounded AI tutor, and deploy — without leaving the chat.

## Install

The `faraday-academy` repo is itself a Claude Code marketplace. In Claude Code:

```
/plugin marketplace add ssota-labs/faraday-academy
/plugin install faraday@faraday
```

Local checkout instead of GitHub:

```
/plugin marketplace add /path/to/faraday-academy
/plugin install faraday@faraday
```

Then restart or reload plugins. Verify with `/plugin list` (or `claude plugin
validate .` from the repo root before publishing).

## What you get

- **Skill `faraday`** — a courseware **design partner**, not just a scaffolder.
  Auto-activates when you talk about interactive lessons/textbooks/courses/tutors —
  including "turn my slides/notes into a lesson." A lean `SKILL.md` front door walks
  the whole arc (Discover → Design → Build → Verify → Ship) and pulls in
  progressive-disclosure references only for the phase you're in:
  - **Design** — `discovery.md` (intake a creator's PDF/PPT/MD + the questions to
    ask), `curriculum.md` (decompose a subject → sequenced roadmap),
    `learning-design.md` (levels, unlock gates, mastery, continuity),
    `interactive-design.md` (design the interaction that reveals a concept),
    `design.md` (visual/UX within the theme system).
  - **Build API** — `blocks.md` (block API + lesson shapes), `worlds.md`
    (`<Course>`/`<CourseHost>`/packs/3D/LMS), `tutor.md` (the grounded tutor).
- **Slash commands**
  - `/faraday-new <topic>` — scaffold + author a lesson (all packs pre-installed; trim with `faraday pack remove`).
  - `/faraday-tutor` — add / embed and verify the grounded AI tutor.
  - `/faraday-check` — run the gates and fix integrity drift.
  - `/faraday-deploy [preview|prod]` — build + deploy (static, or Vercel for tutors).
- **Subagent `faraday-author`** — a clean-session agent that builds a complete,
  verified lesson end-to-end and reports back.
- **Subagent `faraday-pack-author`** — builds AND vets a new module pack end-to-end:
  scaffold → fill both halves → validate on disk → install into a probe lesson →
  typecheck the example → self-grade against the pack's quality bar.
- **Subagent `faraday-pack-eval`** — measures a pack's real quality: authors N lessons
  from its guide (blind to the bar), grades each against its `quality.md`, and reports
  a pass rate + per-rule failures + fixes. Re-run to gate a change to the guide.

## Prerequisites

- **The Faraday CLI.** Commands call `npx @faraday-academy/cli@latest`. During
  pre-publish local development, that's equivalent to
  `node /path/to/faraday-academy/packages/cli/bin/faraday.mjs` — the skill knows both.
- **pnpm** (the scaffold installs with it).
- **A Vercel AI Gateway key** *only* for lessons with the `tutor` pack (`faraday
  pack add tutor`), in the lesson's `.env.local` (never committed). Deploys use
  OIDC instead.

## The loop it automates

```
scaffold → read the in-project guide → author src/lesson/lesson.tsx
        → pnpm check (gates) → pnpm dev (drive it) → deploy
```

Faraday's rule: the runtime is a pinned `@faraday-academy/*` dependency, not vendored — the
plugin authors only in `src/lesson/**` and never tries to fork the runtime.
