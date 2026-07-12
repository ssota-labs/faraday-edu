# Module packs — capabilities you install

Capabilities beyond a plain 2D lesson are **module packs**: self-contained units
(a `pack.json` manifest + runtime code + a skill guide) that `faraday pack add`
installs into a lesson. This is the CLI's extension mechanism — the skill's job is
to know packs exist, install the right one, then **read the pack's own guide**.

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
| `three` (`--3d`; `--physics` variant) | the subject is inherently **spatial** — astronomy, molecules, geometry, anatomy. `--physics` for genuine dynamics (collisions, gravity, joints). |
| `tutor` (`--tutor`) | the reader benefits from **asking questions** — a durable, grounded chat tutor beside the content. |
| `srs` | the goal is **memorization/recall** (vocabulary, facts, formulas) — spaced-repetition flashcards. |
| `lecture-design` | you're **designing how it teaches** — a folder-ized pedagogy library (5 moves + 5E/CRA/Peer Instruction/Mayer/Merrill). |

`--3d`/`--physics`/`--tutor` on `faraday new` are **aliases** for `pack add three`/
`pack add tutor` at scaffold time — same installer, plus the pack's demo.

## Authoring / validating a pack

A pack is any folder with a valid `pack.json` (contract:
`packages/official-packs/pack.schema.json`). Validate one with
`faraday pack validate <name|source>`. Third parties distribute packs from a local
path, a GitHub repo (`owner/repo`), or npm (`npm:@scope/pack`) — no need to be
official.
