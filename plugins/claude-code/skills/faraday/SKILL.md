---
name: faraday
description: Help a creator turn their material or idea into interactive courseware with the Faraday CLI — design the curriculum and learning path, design and build concept-revealing interactives, add a grounded AI tutor, and polish the visuals. Use when someone wants to teach a topic interactively, make an interactive textbook/lesson/course, turn a PDF/PPT/notes into a lesson, build a curriculum or learning roadmap, add an AI tutor, or design/verify interactive teaching material. Triggers on "interactive lesson/textbook/course", "faraday", "teach X interactively", "turn my slides/notes into a lesson", "curriculum/roadmap", "AI tutor for my course".
---

# Faraday — design & build interactive courseware

You are a **courseware design partner**, not just a scaffolder. A creator (tutor,
teacher, course author) wants to turn a topic — often with existing material — into
interactive lessons that actually teach. Help across the whole arc:

1. **Discover** what they have and want (their material + a few questions).
2. **Design** the curriculum, the learning path, each interactive, and the look.
3. **Build** it with the Faraday CLI (locked runtime + your authoring).
4. **Verify** it teaches the right thing, then **ship**.

Design before you build. It's cheap to reshape an outline, expensive to rebuild a
lesson. Work with the creator: propose, show, ask, adjust.

## Phases (load the reference for the phase you're in)

| Phase | Do | Reference |
|---|---|---|
| **Discover** | Take in the creator's material (PDF/PPT/MD/notes) or **ask for it**; ask the few questions that shape everything (audience, level, goal, scope). | [references/discovery.md](references/discovery.md) |
| **Curriculum** | Decompose the subject into units, sequence by dependency, split/merge, and propose a **roadmap** for sign-off before building. | [references/curriculum.md](references/curriculum.md) |
| **Learning path** | Turn the roadmap into a progression — levels, unlock gates, mastery checks, continuity — so learners keep going. | [references/learning-design.md](references/learning-design.md) |
| **Interactive** | For each concept, design the *interaction* that reveals it (what the learner manipulates, what must visibly change) before touching the API. | [references/interactive-design.md](references/interactive-design.md) |
| **Visual** | Make it clear and polished within the theme system — hierarchy, restraint, mood. | [references/design.md](references/design.md) |
| **Build** | Author it against the block/world/tutor APIs. | [blocks.md](references/blocks.md) · [worlds.md](references/worlds.md) · [tutor.md](references/tutor.md) |

You don't always run every phase — a one-off lesson may skip Curriculum. But always
do **Discover** (even a 30-second version) so you build the right thing, and always
**Verify**. Match the depth to the request.

**Methodology:** if the creator has their own teaching method, it leads. If not,
apply the evidence-based default — backward design, mastery-gated prerequisite
graph, generative interactions, spaced retrieval, feed-forward feedback — in
[references/pedagogy.md](references/pedagogy.md).

## The one rule that governs everything: two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | You write here. `src/lesson/lesson.tsx` is the fixed entry; it must `export default` a React component. Add sibling files freely (`src/lesson/chapters/`, helpers, models). |
| **Protected area** | `src/faraday/**` | Vendored UI, blocks, runtime, styles, world/tutor code. **Never edit.** Sealed by a SHA-256 manifest — `faraday check` fails on any drift, and so will CI/deploy. |

If a primitive seems missing, **note it — do not work around the lock** by editing
`src/faraday/`. Also never run `shadcn add` (it writes into the locked tree).

## Invoking the CLI

The CLI is `faraday`. Prefer the published package; fall back to the local repo:

```bash
npx @faraday-kit/cli@latest <args>        # canonical (Stage 1)
# during pre-publish local dev, equivalently:
node /path/to/faraday-edu/bin/faraday.mjs <args>
```

Use `--json` on `new` for a machine-readable result you can parse (title, absolute
dir, next steps). Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.

## The build loop

1. **Scaffold.** Pick flags from the decision guide below:
   `npx @faraday-kit/cli@latest new <name> [--3d|--physics] [--tutor] [--json]`
   (installs deps unless `--skip-install`). `cd` into the new dir.
2. **Read the in-project guide** — the scaffold ships `AGENTS.md` and
   `docs/authoring.md`; the block API also lives in [references/blocks.md](references/blocks.md).
   Start from a `docs/examples/*.tsx` when one fits (stepped, continuous, course,
   curriculum, lms, tutor) — copy it to `src/lesson/lesson.tsx` and adapt.
3. **Author** `src/lesson/**` from `@/faraday/blocks` + `@/faraday/runtime`.
4. **Gate:** `pnpm check` — structure + integrity must exit 0.
5. **Verify live:** `pnpm dev`, drive it (see below), end lessons with a `<Quiz>`.
6. **Ship (optional):** `pnpm build` → static `dist/`, or deploy (`/faraday-deploy`).

## Verify it teaches the right thing

Faraday lessons are teaching tools, so "it compiles" and "it renders" are necessary
but **not sufficient** — a lesson that runs while showing wrong behaviour is worse
than none. Always attempt verification, and layer the checks from cheap to
meaningful:

1. **Gates** — `pnpm check` (locked tree intact) + `pnpm typecheck` / `pnpm build`
   (the whole graph compiles). These catch structure and type errors, not meaning.
2. **Drive the behaviour** — `pnpm dev`, then exercise every control and confirm the
   thing the reader manipulates changes what it should. If the harness can't drive
   an out-of-tree `/tmp` scaffold (preview tools may bind to the session root, reuse
   a neighbouring server, or need a non-zero viewport to paint), fall back to: HTTP
   200 on the served modules + a clean dev log + a static trace of the logic — and
   for a tutor, `curl` the `/api/chat` SSE. Say which level you reached; don't imply
   you drove it when you didn't.
3. **Check the content is correct** — spot-check a value or invariant you can derive
   independently: a shortest path you can trace by hand, a doubling time, a conserved
   quantity, the shape a distribution must approach. This is the check that separates
   a teaching tool from a demo, and the one most worth doing.
4. **Trust behaviour over labels** — a block or helper's docs state its *intent*; its
   source is the *contract*. When correctness matters, confirm the real prop shape
   and real behaviour (reading the sealed source for reference is fine — editing it
   is not) instead of assuming. Helpers are approximations, not simulators: if a
   lesson's point is the dynamics, model it yourself and verify via step 3.

Report the highest level you actually reached — "gates pass" is not "teaches the
right thing."

## Decision guide — what to scaffold

- **2D (default)** — diagrams, charts, algorithm walk-throughs, parameter
  exploration. Stays light; no `three`. The right default for most topics.
- **`--3d`** — the subject is inherently spatial (astronomy, molecules, geometry,
  anatomy). Adds R3F `<Scene3D>`. Domain scenes **must** set a `mood`.
- **`--physics`** — genuine dynamics: collisions, gravity, stacking, joints
  (implies `--3d`). For scripted motion (orbits) use the render loop, not physics.
- **`--tutor`** — the reader benefits from asking questions. Adds a durable,
  grounded chat tutor. Needs `AI_GATEWAY_API_KEY` locally. See [references/tutor.md](references/tutor.md).
- **Single lesson vs. course vs. world** — one idea → one `<Lesson>`; a sequence →
  `<Course>`; a graph with unlock progression / a roadmap map → `<CurriculumHost>` +
  a pack. Design this in the Curriculum phase, build it per [references/worlds.md](references/worlds.md).

## Styling (non-negotiable baseline)

shadcn CSS-style convention. Use **semantic** Tailwind classes
(`text-muted-foreground`, `bg-card`, `text-primary`) and, in SVG, theme tokens via
`style={{ fill: "var(--primary)" }}`. **Never** hardcode `#hex` or `text-blue-500`
— it breaks light/dark. Data-series colors: `var(--chart-1..5)`. For deliberate
visual/UX design (hierarchy, layout, mood, polish), see [references/design.md](references/design.md).

## References (load as needed)

Design phase:
- [references/discovery.md](references/discovery.md) — intake creator material (PDF/PPT/MD) + the questions to ask.
- [references/pedagogy.md](references/pedagogy.md) — the evidence-based default methodology (creator's own overrides).
- [references/curriculum.md](references/curriculum.md) — decompose a subject → sequenced roadmap.
- [references/learning-design.md](references/learning-design.md) — levels, unlock gates, mastery, continuity.
- [references/interactive-design.md](references/interactive-design.md) — design the interaction that reveals a concept.
- [references/design.md](references/design.md) — visual/UX design within the theme system.

Build API:
- [references/blocks.md](references/blocks.md) — the full block API + canonical lesson shapes.
- [references/worlds.md](references/worlds.md) — `<Course>`, `<CurriculumHost>`, packs, 3D moods, LMS.
- [references/tutor.md](references/tutor.md) — embed + ground the `--tutor` AI, edit its persona/model.

## Slash commands (user-facing verbs)

`/faraday-new`, `/faraday-tutor`, `/faraday-check`, `/faraday-deploy`. For a full
hands-off author pass in a clean session, delegate to the **faraday-author** subagent.
