# Module packs — capabilities you install

Capabilities beyond a plain 2D lesson are **module packs**: self-contained units
(a `pack.json` manifest + runtime code + a skill guide). `faraday new` scaffolds a
minimal vinext lesson with **no packs pre-installed** — add only what the topic
needs with `faraday pack add <name>`. This is the CLI's extension mechanism —
the skill's job is to know packs exist, pick the right ones, then **read each
pack's own guide** at `.faraday/packs/<name>/`.

> **Packs are grouped by category** — official packs live in a category folder
> (`packages/official-packs/<category>/<name>/`) and `faraday pack list` groups by it.
> Add by bare name (`faraday pack add sim2d`) or qualify (`faraday pack add runtime/sim2d`).
> Terminology: [specs/terminology.md](../../../../specs/terminology.md).
> - **lecture** — lecture presentations and tools (`slide-view`, `textbook-view`, `srs`,
>   `notes`, `exam`, `game2d`, `storybook-game2d`).
> - **runtime** — engines and simulation glue (`sim2d`, `game2d`).
> - **methodology** — pedagogy knowledge, skill-only (`audience`, `lecture-design`, `stem-methods`).

## The loop

```bash
faraday pack list                       # the LIVE catalog — don't hardcode it
faraday pack add <name>                 # install runtime + skill into the lesson
faraday pack add ./path | owner/repo | npm:@scope/pack   # third-party sources
```

1. **Discover** — run `faraday pack list` (`--json` for parsing). This is the source
   of truth for what's available; never rely on a memorized list.
2. **Install** — `faraday pack add <name>`. It wires the **runtime half** into the
   real project (deps in `package.json`, CSS imports, copied source/config) **and**
   the **skill half** into `.faraday/packs/<name>/`, adding a pointer to `AGENTS.md`.
3. **Read the pack's guide** — after install, read `.faraday/packs/<name>/` (the
   pack's own authoring instructions + its quality bar) and follow it. Each pack
   teaches you how to use itself.

## Official packs (as of writing — but always confirm with `faraday pack list`)

| Pack | Use when |
|---|---|
| `srs` | the goal is **memorization/recall** (vocabulary, facts, formulas) — spaced-repetition flashcards. |
| `exam` | a practice test / mock exam across a topic — blueprint → items → scoring. |
| `textbook-view` | textbook view — A4 self-study column, scroll, free-mode margin notes. |
| `slide-view` | slide view presentation — one idea per screen, prev/next, animation. (`deck` aliases here.) |
| `sim2d` | SVG + GSAP formula simulations (replaces runtime motion hooks). |
| `game2d` | PixiJS 2D educational stage — physics, tilemap, audio. |
| `storybook-game2d` | page-turn story shell on game2d (absorbs former `kids`). |
| `notes` | handwriting / sketch on a stylus — a full-page pen ink canvas. |
| `lecture-design` · `audience` · `stem-methods` | **designing how it teaches** — pedagogy + per-audience or per-domain methodology. |

There are **no capability flags** on `faraday new`. Install packs explicitly; use
`faraday pack remove <name>` to drop what a finished lesson doesn't need before shipping.

## Authoring / validating a pack

A pack is any folder with a valid `pack.json` (contract:
`packages/official-packs/pack.schema.json`). Scaffold the skeleton with
`faraday pack new <name> [--kind skill|copy|runtime]`, validate with
`faraday pack validate <name|source>`, and try it via `faraday pack add <source>
--dir <lesson>`. Third parties distribute packs from a local path, a GitHub repo
(`owner/repo`), or npm (`npm:@scope/pack`) — no need to be official. Full guide:
[authoring-packs.md](authoring-packs.md).
