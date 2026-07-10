# Faraday — Codex plugin

Drive Faraday from your Codex session: scaffold interactive textbook lessons,
author them against the locked-tree + blocks contract, pass the quality gates,
embed a durable grounded AI tutor, and deploy.

There are two ways to install, depending on your Codex version. Codex's plugin +
marketplace system is new (2026) and moving fast — if the plugin path doesn't work
on your version, use the zero-dependency path, which relies only on long-stable
`AGENTS.md` + `.agents/skills`.

## Path A — plugin + marketplace (idiomatic)

The `faraday-edu` repo ships a Codex marketplace at `.agents/plugins/marketplace.json`.

```bash
codex plugin marketplace add titanism/faraday-edu     # or: ./path/to/faraday-edu (local)
codex plugin marketplace list
```

Then install the `faraday` plugin from the `/plugins` menu inside Codex. Installed
plugins are recorded in `~/.codex/config.toml` under `[plugins."faraday@faraday"]`.
The plugin ships the `faraday` **skill** (`skills/faraday/SKILL.md` +
`references/`), invoked explicitly with `$faraday` or implicitly when your task
matches.

## Path B — zero-dependency (copy the skill + instructions)

Codex discovers skills in `.agents/skills` (repo or `~/.agents/skills`) and reads
`AGENTS.md` hierarchically. So you can wire Faraday in without the plugin system:

```bash
# 1) Skill — repo-local (committable, shared with your team):
mkdir -p .agents/skills
cp -R plugins/codex/skills/faraday .agents/skills/faraday
#    …or user-global:
#    cp -R plugins/codex/skills/faraday ~/.agents/skills/faraday

# 2) Instructions — drop the contract into your project (or ~/.codex/AGENTS.md):
cp plugins/codex/AGENTS.md ./AGENTS.md        # merge if you already have one
```

Invoke the skill with `$faraday`, or let Codex pick it up implicitly.

> Custom prompts (`~/.codex/prompts/*.md`) are deprecated in favor of skills and
> can't be shipped in-repo, so this plugin uses a **skill** instead — it's
> shareable and works both explicitly and implicitly.

## Prerequisites

- **The Faraday CLI.** The skill calls `npx @faraday-kit/cli@latest`; pre-publish,
  that's `node /path/to/faraday-edu/platform/packages/cli/bin/faraday.mjs`.
- **pnpm** (the scaffold installs with it).
- **A Vercel AI Gateway key** *only* for `--tutor` lessons, in the scaffolded
  lesson's `.env.local` (never committed). Deploys use OIDC instead.

## The loop it automates

```
scaffold → read the in-project guide → author src/lesson/lesson.tsx
        → pnpm check (gates) → pnpm dev (drive it) → deploy
```

Faraday's rule: `src/faraday/**` is vendored and sealed (SHA-256 manifest) — author
only in `src/lesson/**`, never edit the lock. Full API in
`skills/faraday/references/`.
