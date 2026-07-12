# Module packs — capabilities you install

Capabilities beyond a plain 2D lesson are **module packs**: self-contained units
(a `pack.json` manifest + runtime code + a skill guide). `faraday new` is
batteries-included — it auto-installs all nine (skill + runtime), so every
capability is on hand from the start. `faraday pack add` installs one individually
(a third-party pack, or re-adding a removed one). This is the CLI's extension
mechanism — the skill's job is to know packs exist, use the right ones, then
**read each pack's own guide** at `.faraday/packs/<name>/`.

> **"Module pack" ≠ "world pack".** Here, *module pack* = an installable capability
> (`faraday pack add three`). In [worlds.md](worlds.md), *world pack* / *world shape*
> = the swappable presentation of a `<CurriculumHost>` (`linearPack`/`map2dPack`/
> `world3dPack`). Different things — don't conflate them.

## The loop

```bash
faraday pack list                       # the LIVE catalog — don't hardcode it
faraday pack add <name> [--physics]      # install runtime + skill into the lesson
faraday pack add ./path | owner/repo | npm:@scope/pack   # third-party sources
```

1. **Discover** — run `faraday pack list` (`--json` for parsing). This is the source
   of truth for what's available; never rely on a memorized list.
2. **Install** — `faraday pack add <name>`. It wires the **runtime half** into the
   real project (deps in `package.json`, `@import`s in `src/app.css`, copied source/
   config) **and** the **skill half** into `.faraday/packs/<name>/`, adding a pointer
   to `AGENTS.md`.
3. **Read the pack's guide** — after install, read `.faraday/packs/<name>/` (the
   pack's own authoring instructions + its quality bar) and follow it. Each pack
   teaches you how to use itself.

## Official packs (as of writing — but always confirm with `faraday pack list`)

| Pack | Use when |
|---|---|
| `three` (`--physics` variant) | the subject is inherently **spatial** — astronomy, molecules, geometry, anatomy. `pack add three --physics` for genuine dynamics (collisions, gravity, joints). |
| `tutor` | the reader benefits from **asking questions** — a durable, grounded chat tutor beside the content. |
| `srs` | the goal is **memorization/recall** (vocabulary, facts, formulas) — spaced-repetition flashcards. |
| `exam` | a practice test / mock exam across a topic — blueprint → items → scoring. |
| `deck` | slideshow delivery — one idea per screen, prev/next, animation. |
| `kids` | a young-learner tablet lesson — CRA, big targets, celebration. |
| `notes` | handwriting / sketch on a stylus — a full-page pen ink canvas. |
| `lecture-design` · `audience` | **designing how it teaches** — pedagogy + per-audience methodology. |

There are **no capability flags** on `faraday new` — and no need for them: `new` is
**batteries-included**, auto-installing all nine packs (skill + runtime). Use
`--no-defaults` for a minimal lesson, and `faraday pack remove <name>` to drop what a
finished lesson doesn't need (e.g. the heavy `three`/`tutor` runtimes) before shipping.

## Authoring / validating a pack

A pack is any folder with a valid `pack.json` (contract:
`packages/official-packs/pack.schema.json`). Validate one with
`faraday pack validate <name|source>`. Third parties distribute packs from a local
path, a GitHub repo (`owner/repo`), or npm (`npm:@scope/pack`) — no need to be
official.
