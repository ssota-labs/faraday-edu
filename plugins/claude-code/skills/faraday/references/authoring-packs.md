# Authoring a module pack

A **module pack** is a self-contained folder that `faraday pack add` installs into
a lesson. Build one when a capability recurs across lessons — a new interactive, a
delivery format, a body of teaching knowledge. This guide is the contract + the
conventions every official pack already follows; match them and your pack drops in
like the built-ins.

## The two halves

Every pack installs in two directions at once:

- **Runtime half** → the real project tree (where the bundler looks): deps in
  `package.json`, `@import`s in `src/app.css`, copied source under `src/lesson/…`,
  config files, assets.
- **Skill half** → `.faraday/packs/<name>/` (where the agent looks): the `.md`
  guide that teaches an agent to *use* the pack, plus a pointer appended to
  `AGENTS.md`.

Rule of thumb: *runtime = where the bundler looks; skill = `.faraday/` where the
agent looks.*

## The fast path: `faraday pack new`

Don't hand-copy an existing pack. Stamp the skeleton:

```bash
faraday pack new <name> [--kind skill|copy|runtime] [--at <dir>]
```

It writes `pack.json` + `skill/pack.md` + `quality.md` + `examples/<name>.tsx`
(and, for `--kind copy`, an author-editable `runtime/<name>/index.tsx`). Fill the
TODOs, then `faraday pack validate <dir>` and `faraday pack add <dir> --dir <lesson>`
to try it.

## Pick an archetype

The skill half is uniform; only the **runtime half** differs. Three shapes cover
every official pack:

| `--kind` | deps | runtime does | use when | examples |
|---|---|---|---|---|
| **`skill`** | 0 | nothing but ships knowledge (composes blocks the runtime already has) | the capability is *how to teach/assess*, not new code | audience · lecture-design · exam · deck · kids |
| **`copy`** | 0 | copies an **author-editable** component into `src/lesson/<name>/` | you ship source the author will edit, with no npm dep | srs · notes |
| **`runtime`** | N | pins a published `@scope/pkg`, wires CSS, copies glue/config | the heavy code lives in a versioned package | three · tutor |

Start at `skill` and only reach for `copy`/`runtime` when you genuinely ship code.

## The manifest (`pack.json`)

The full contract is `packages/official-packs/pack.schema.json`. The fields:

```jsonc
{
  "name": "my-pack",                    // kebab-case; CLI derives it from the folder anyway
  "displayName": "Short human label",   // required — shown by `faraday pack list`
  "description": "One sentence: what it adds, and when to use it.",
  "default": true,                      // faraday new auto-installs it (all official packs are)
  "runtime": {                          // the runtime half (omit / {} for skill-only)
    "dependencies":    { "@scope/pkg": "1.2.3" },   // pin EXACT for @faraday-academy/*
    "devDependencies": { "@types/x": "^1.0.0" },
    "variants":  { "physics": { "dependencies": { "@react-three/rapier": "^2.1.0" } } },
    "cssImports": ["@scope/pkg/styles.css"],        // appended to src/app.css (idempotent)
    "copy":    [{ "from": "runtime/x", "to": "src/lesson/x" }],  // file or dir
    "appends": [{ "to": "pnpm-workspace.yaml", "marker": "nodeLinker", "text": "…" }]
  },
  "skill": {
    "reference": "skill/pack.md",       // a .md file OR a directory
    "entry": "SKILL.md",                // for a directory: the front-door/index file
    "loadWhen": "the situation an agent should load this pack in"
  },
  "quality": "quality.md"
}
```

- **`variants`** — optional bundles selected with `faraday pack add <name> --<variant>`
  (e.g. `--physics`). They are *not* in the base install.
- **`copy`** rules take a file or a whole directory; missing sources are skipped.
- **`appends`** are idempotent via `marker` — skipped if the marker is already present.
- **Folder skills** — set `reference` to a directory and `entry` to its index file.
  `faraday pack show <name>` prints just the entry; `pack show <name> <file>` a
  sub-file. Use this when the guide is more than one page (see `exam`, `lecture-design`).

There are no capability flags and no `scaffold`/`aliasFlags` fields — capabilities
are packs, added uniformly.

## The skill guide (`skill/pack.md`) — the uniform skeleton

Every pack's guide follows the same six moves. An agent reads it *after* install to
learn how to use the pack well:

1. **Title + "Load this when …"** — mirror the manifest's `loadWhen`.
2. **When it fits (and when it doesn't)** — the negative space. Off-label use is the
   most common quality failure; name it here.
3. **Why / pedagogy** — the evidence or design principle. Why this shape.
4. **Using it** — the minimal correct code; call out the non-obvious rules.
5. **Extending** — where the author can go further; point at copied, editable files.
6. **Quality gate** — defer to `quality.md`; restate the 2–3 rules that matter most.

Write it to an agent, not an end user: imperative, specific, and honest about limits.

## The quality bar (`quality.md`)

A short pass/fail checklist an agent grades a generated lesson against — each a
**bold rule + rationale**. The last rule is almost always **"Right tool"**: this
pack was chosen because of the outcome it serves, not because it's flashy. This file
is what makes the *eval loop* possible (below).

## Validate, then test in a real lesson

```bash
faraday pack validate <name|source>        # structural check against the contract
faraday pack add <source> --dir <lesson>   # install into a scratch lesson
cd <lesson> && pnpm check                   # layout + pins intact
```

`<source>` is an official name, a local path (`./my-pack`), a GitHub repo
(`owner/repo[/sub]`), or npm (`npm:@scope/pack`) — so a pack works the same whether
it's official or third-party.

## The eval loop (quality gating)

The bar isn't just documentation — it's a gate. The intended loop: an agent
generates N lessons from the pack's guide → a *different* agent grades each against
`quality.md` → the pack ships on its pass rate. When you author a pack, write
`quality.md` so a grader can apply it mechanically, and keep `examples/` as honest
fixtures (one idea each, the pack at its best).

## Distributing

Official packs live in `packages/official-packs/` and are bundled into the CLI at
`prepack`. Third parties need nothing official: publish the folder anywhere a source
resolves — a local path, a GitHub repo, or an npm package — and `faraday pack add`
installs it like any other.
