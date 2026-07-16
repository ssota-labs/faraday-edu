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
faraday pack new <name> [--kind skill|copy|runtime] [--flat] [--at <dir>]
```

It writes `pack.json` + a **folder skill** (`skill/SKILL.md` index + `using.md` /
`pedagogy.md` / `extending.md` sub-guides) + `quality.md` + `examples/<name>.tsx`
(and, for `--kind copy`, an author-editable `runtime/<name>/index.tsx`). Fill the
TODOs, then `faraday pack validate <dir>` and `faraday pack add <dir> --dir <lesson>`
to try it. Use `--flat` only for a tiny single-page pack.

## Pick an archetype

The skill half is uniform; only the **runtime half** differs. Three shapes cover
every official pack:

| `--kind` | deps | runtime does | use when | examples |
|---|---|---|---|---|
| **`skill`** | 0 | nothing but ships knowledge (composes blocks the runtime already has) | the capability is *how to teach/assess*, not new code | audience · lecture-design · exam · slide-view |
| **`copy`** | 0 | copies an **author-editable** component into `src/lesson/<name>/` | you ship source the author will edit, with no npm dep | srs · notes |
| **`runtime`** | N | pins a published `@scope/pkg`, wires CSS, copies glue/config | the heavy code lives in a versioned package | sim2d · game2d |

Start at `skill` and only reach for `copy`/`runtime` when you genuinely ship code.

**Read two built-ins before you start** — they carry conventions this guide only
summarizes: `packages/official-packs/lecture/exam/` (a folder skill: an index
routing to sub-guides, gradeable `quality.md`) and `packages/official-packs/lecture/srs/`
(a `copy` pack: a real author-editable component, token-only styling, a "when it
doesn't fit" section). Match their tone and rigor and your pack drops in like the built-ins.

## The manifest (`pack.json`)

The full contract is `packages/official-packs/pack.schema.json`. The fields:

```jsonc
{
  "name": "my-pack",                    // kebab-case; CLI derives it from the folder anyway
  "displayName": "Short human label",   // required — shown by `faraday pack list`
  "description": "One sentence: what it adds, and when to use it.",
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

- **`requires`** — other packs this one builds on, installed first. Each entry is a
  pack source (official name · `./path` · `owner/repo` · `npm:<spec>`). Use it when a
  pack composes another instead of re-declaring its deps — e.g. `storybook-game2d`
  `requires: ["game2d"]` to stand on the 2D engine. Cycle-guarded and
  idempotent; the dependency's runtime + skill + provenance all come along.
- **`variants`** — optional bundles selected with `faraday pack add <name> --<variant>`
  (e.g. `--physics`). They are *not* in the base install.
- **`copy`** rules take a file or a whole directory; missing sources are skipped.
- **`appends`** are idempotent via `marker` — skipped if the marker is already present.
- **Folder skills** — set `reference` to a directory and `entry` to its index file.
  `faraday pack show <name>` prints just the entry; `pack show <name> <file>` a
  sub-file. Use this when the guide is more than one page (see `exam`, `lecture-design`).

There are no capability flags and no `scaffold`/`aliasFlags` fields — capabilities
are packs, added uniformly.

## The skill guide — a folder with an index

**Default to a folder skill.** `skill/SKILL.md` is the **index / front door**: it
says when the pack fits and routes to focused sub-guides; an agent reads the entry
and opens only the guide it needs (progressive disclosure — the same pattern as the
base `SKILL.md`). Set `skill.reference` to the folder and `skill.entry` to the index.
Only collapse to a single `skill/pack.md` (`--flat`) for a genuinely one-page pack.

The guide — across the index + sub-guides — covers the same six moves:

1. **Title + "Load this when …"** *(index)* — mirror the manifest's `loadWhen`.
2. **When it fits (and when it doesn't)** *(index)* — the negative space. Off-label
   use is the most common quality failure; name it here.
3. **Why / pedagogy** *(`pedagogy.md`)* — the evidence or design principle.
4. **Using it** *(`using.md`)* — the minimal correct code; the non-obvious rules.
5. **Extending** *(`extending.md`)* — where the author can go further; editable files.
6. **Quality gate** *(index → `../quality.md`)* — restate the 2–3 rules that matter.

Split further as the pack grows (see `exam`: blueprint → item-writing → scoring →
integrity). Keep the index the single front door. Write to an agent, not an end
user: imperative, specific, honest about limits.

## The quality bar (`quality.md`)

A short pass/fail checklist an agent grades a generated lesson against — each a
**bold rule + rationale**. The last rule is almost always **"Right tool"**: this
pack was chosen because of the outcome it serves, not because it's flashy. This file
is what makes the *eval loop* possible (below).

## Validate, then compile it in a real lesson

`validate` is a real gate, not just a shape check — it fails if a referenced file
(`skill.reference`/`entry`, `quality`) is missing and warns on leftover scaffold
`TODO`s and copy sources that would install nothing. But it does **not** compile
your code. The one guardrail that catches a component that doesn't typecheck (or an
example that imports a path the pack doesn't install) is installing into a real
lesson and building:

```bash
faraday pack validate <name|source>              # manifest + files-exist + no leftover TODOs
faraday new probe --skip-install --at /tmp/faraday-probe
faraday pack add <source> --dir /tmp/faraday-probe   # install both halves (+ any `requires`)
cd /tmp/faraday-probe && pnpm install && pnpm check  # layout + pins + the example TYPECHECKS
pnpm dev                                          # then RENDER it — see below
```

Do not declare a pack done on `validate` alone — a pack that validates green can
still ship a component that doesn't compile, and a component that compiles can still
throw on mount and render nothing. For any pack with a UI, add a **render gate**:
start `pnpm dev`, confirm the probe lesson serves without a runtime error, and — for
UI-heavy packs — open it in the browser preview to screenshot it and drive every
control. "Typechecks" is not "looks and works right." `<source>` is an official name, a local
path (`./my-pack`), a GitHub repo (`owner/repo[/sub]`), or npm (`npm:@scope/pack`) —
so a pack works the same whether it's official or third-party.

**Let the `faraday-pack-author` subagent run this whole loop** (scaffold → fill →
validate → install → typecheck → self-grade against `quality.md`) when you want a
pack built and vetted end to end.

## The eval loop (quality gating)

The bar isn't just documentation — it's a gate. The loop: an agent authors N lessons
from the pack's guide **blind to the bar** → grades each against `quality.md` → the
pack ships on its pass rate. When you author a pack, write `quality.md` so a grader
can apply it mechanically, and keep `examples/` as honest fixtures (one idea each,
the pack at its best).

Run it with the **`faraday-pack-eval`** subagent: point it at a pack and it authors
N lessons from the guide, grades them against `quality.md`, and reports a pass rate +
per-rule failures + which fix (a weak guide instruction vs. a vague bar rule) would
raise it. Re-run after editing a guide to check the change didn't lower quality.

## Distributing

Official packs live in a category folder under `packages/official-packs/<category>/<name>/`
(the category drives `pack list` grouping and lets two categories hold a same-named
pack) and are bundled into the CLI at `prepack`. In this monorepo, labs auto-catalogs
every official `pack.json` under **Skills & Packs → Official packs**; UI-bearing packs
(`copy`/`runtime`) also need a live preview wired in `apps/labs/` — see the
`faraday-pack-author` agent's labs wire-up step. Third parties need nothing official:
publish the folder anywhere a source resolves — a local path, a GitHub repo, or an npm
package — declare a `category` in `pack.json` if you like, and `faraday pack add`
installs it like any other.
