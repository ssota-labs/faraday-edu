# Faraday — Claude Code plugin

Drive Faraday from your Claude Code session: scaffold interactive textbook
lessons, author them against the locked-tree + blocks contract, pass the quality
gates, embed a durable grounded AI tutor, and deploy — without leaving the chat.

## Install

The `faraday-edu` repo is itself a Claude Code marketplace. In Claude Code:

```
/plugin marketplace add titanism/faraday-edu
/plugin install faraday@faraday
```

Local checkout instead of GitHub:

```
/plugin marketplace add /path/to/faraday-edu
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
    (`<Course>`/`<CurriculumHost>`/packs/3D/LMS), `tutor.md` (the grounded tutor).
- **Slash commands**
  - `/faraday-new <topic> [--3d|--physics] [--tutor]` — scaffold + author a lesson.
  - `/faraday-tutor` — add / embed and verify the grounded AI tutor.
  - `/faraday-check` — run the gates and fix integrity drift.
  - `/faraday-deploy [preview|prod]` — build + deploy (static, or Vercel for tutors).
- **Subagent `faraday-author`** — a clean-session agent that builds a complete,
  verified lesson end-to-end and reports back.

## Prerequisites

- **The Faraday CLI.** Commands call `npx @faraday-kit/cli@latest`. During
  pre-publish local development, that's equivalent to
  `node /path/to/faraday-edu/bin/faraday.mjs` — the skill knows both.
- **pnpm** (the scaffold installs with it).
- **A Vercel AI Gateway key** *only* for `--tutor` lessons, in the scaffolded
  lesson's `.env.local` (never committed). Deploys use OIDC instead.

## The loop it automates

```
scaffold → read the in-project guide → author src/lesson/lesson.tsx
        → pnpm check (gates) → pnpm dev (drive it) → deploy
```

Faraday's rule: `src/faraday/**` is vendored and sealed (SHA-256 manifest) — the
plugin authors only in `src/lesson/**` and never edits the lock.
