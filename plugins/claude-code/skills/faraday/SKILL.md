---
name: faraday
description: Help a creator turn their material or idea into interactive courseware with the Faraday CLI — design the course and learning path, design and build concept-revealing interactives, and polish the visuals. Use when someone wants to teach a topic interactively, make an interactive textbook/lesson/course, turn a PDF/PPT/notes into a lesson, build a course or learning roadmap, or design/verify interactive teaching material. Triggers on "interactive lesson/textbook/course", "faraday", "teach X interactively", "turn my slides/notes into a lesson", "curriculum/roadmap".
---

# Faraday — design & build interactive courseware

You are a **courseware design partner**, not just a scaffolder. A creator (tutor,
teacher, course author) wants to turn a topic — often with existing material — into
interactive lessons that actually teach. Help across the whole arc:

1. **Discover** what they have and want (their material + a few questions).
2. **Design** the course, the learning path, each interactive, and the look.
3. **Build** it with the Faraday CLI (locked runtime + your authoring).
4. **Verify** it teaches the right thing, then **ship**.

Design before you build. It's cheap to reshape an outline, expensive to rebuild a
lesson. Work with the creator: propose, show, ask, adjust.

## Phases (load the reference for the phase you're in)

| Phase | Do | Reference |
|---|---|---|
| **Discover** | Take in the creator's material (PDF/PPT/MD/notes) or **ask for it**; ask the few questions that shape everything (audience, level, goal, scope). **Audience is a gate** — pin who the learner is (or state the assumption), then teach *their* way. | [references/discovery.md](references/discovery.md) · `audience` pack (`faraday pack show audience`) |
| **Curriculum** | Decompose the subject into units, sequence by dependency, split/merge, and propose a **roadmap** for sign-off before building. | [references/curriculum.md](references/curriculum.md) |
| **Learning path** | Turn the roadmap into a progression — levels, unlock gates, mastery checks, continuity — so learners keep going. | [references/learning-design.md](references/learning-design.md) |
| **Plan & Execute** | For a multi-lesson curriculum (a long-running task): persist the signed-off roadmap to `.faraday/plan/`, then build lesson-by-lesson with an isolated sub-agent per node, resuming from the plan on any reset. Scaffold (`init`/`new`) **first**, then `faraday pack add` what the design needs. | [references/orchestration.md](references/orchestration.md) |
| **Interactive** | For each concept, design the *interaction* that reveals it (what the learner manipulates, what must visibly change) before touching the API. | [references/interactive-design.md](references/interactive-design.md) |
| **Assess** | Pick each check's FORM by the outcome verb (recognize→MCQ, compute→numeric input, predict→sketch, do→mission) and place them in the concept→sim→check flow. | [references/assessment.md](references/assessment.md) |
| **Visual** | Make it clear and polished within the theme system — hierarchy, restraint, mood. | [references/design.md](references/design.md) |
| **Build** | Author it against the block API. | [blocks.md](references/blocks.md) |
| **Verify** | Grade the shipped thing against the acceptance rubric before reporting done. | [references/quality-bar.md](references/quality-bar.md) |

You don't always run every phase — a one-off lesson may skip Curriculum. But always
do **Discover** (even a 30-second version) so you build the right thing, and always
**Verify**. Match the depth to the request.

**Methodology:** if the creator has their own teaching method, it leads. If not,
apply the evidence-based default — backward design, mastery-gated prerequisite
graph, generative interactions, spaced retrieval, feed-forward feedback — from the
**`lecture-design` pack**, and layer the **audience default** on top: one
methodology per learner population (CRA for children, 5E for secondary, Peer
Instruction for undergrads, Mayer's principles for the general public, Merrill's
First Principles for professionals) from the **`audience` pack**. Install packs
explicitly with `faraday pack add <name>`; read them at `.faraday/packs/<name>/`
(`faraday pack show <name>` at design time).

## The one rule that governs everything: two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | You write here. `src/lesson/lesson.tsx` is the fixed entry; it must `export default` a React component. Add sibling files freely (`src/lesson/chapters/`, helpers, models). |
| **Runtime (dependency)** | `@faraday-academy/*` | The UI, blocks, runtime, and styles — **pinned npm packages**, not vendored. Consume them via `@faraday-academy/kit/*` and `@faraday-academy/ui/*`; you can't edit them. `faraday check` verifies the pins, and so will CI/deploy. |

If a primitive seems missing, **note it — don't try to fork the runtime**. The UI lives in
the pinned `@faraday-academy/ui` package, not your lesson, so `shadcn add` won't help.

## Invoking the CLI

The CLI is `faraday`. Prefer the published package; fall back to the local repo:

```bash
npx @faraday-academy/cli@latest <args>        # canonical (Stage 1)
# during pre-publish local dev, equivalently:
node /path/to/faraday-academy/packages/cli/bin/faraday.mjs <args>
```

Use `--json` on `new` for a machine-readable result you can parse (title, absolute
dir, next steps). Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.

## The build loop

1. **Scaffold.** `faraday new` stamps a minimal vinext lesson with kit/ui pinned and
   **no packs pre-installed**. Install only what the topic needs:
   `npx @faraday-academy/cli@latest new <name> [--json]` (installs deps unless
   `--skip-install`), then `cd` in, then `faraday pack add <name>` for methodology,
   runtime, or presentation packs. Run `faraday pack list` for the live catalog.
   **Attaching to an existing React project?** Use `faraday init --dir <project>`.
   **Starting a whole course/repo?** Use `faraday init` — it drops a repo `AGENTS.md`
   and scaffolds the first app; add more with `faraday new <name>` from the repo root.
2. **Read the in-project guide** — the scaffold ships `AGENTS.md` and
   `docs/authoring.md`; the block API also lives in [references/blocks.md](references/blocks.md).
   Start from a `docs/examples/*.tsx` when one fits — copy it to `src/lesson/lesson.tsx`
   and adapt.
3. **Author** `src/lesson/**` from `@faraday-academy/kit/blocks` + `@faraday-academy/kit/runtime`.
4. **Gate:** `pnpm check` — structure + integrity must exit 0.
5. **Verify live:** `pnpm dev`, drive it (see below), end lessons with a `<Quiz>`.
6. **Ship (optional):** `pnpm build` → static output, or deploy (`/faraday-deploy`).

## Verify it teaches the right thing

Faraday lessons are teaching tools, so "it compiles" and "it renders" are necessary
but **not sufficient** — a lesson that runs while showing wrong behaviour is worse
than none. Always attempt verification, and layer the checks from cheap to
meaningful:

1. **Gates** — `pnpm check` (layout + pin) + `pnpm typecheck` / `pnpm build`
   (the whole graph compiles). These catch structure and type errors, not meaning.
2. **Drive the behaviour** — `pnpm dev`, then exercise every control and confirm the
   thing the reader manipulates changes what it should. If the harness can't drive
   an out-of-tree `/tmp` scaffold, either scaffold where the harness can serve it
   or have the orchestrator drive it — and if you truly can't, fall back to a static
   trace of the logic, but say plainly that visual MUSTs went **ungraded**.
3. **Check the content is correct** — spot-check a value or invariant you can derive
   independently: a shortest path you can trace by hand, a doubling time, a conserved
   quantity, the shape a distribution must approach. This is the check that separates
   a teaching tool from a demo, and the one most worth doing.
4. **Trust behaviour over labels** — a block or helper's docs state its *intent*; its
   source is the *contract*. When correctness matters, confirm the real prop shape
   and real behaviour instead of assuming.

Report the highest level you actually reached — "gates pass" is not "teaches the
right thing."

Then hold the **quality bar** — [references/quality-bar.md](references/quality-bar.md)
is the acceptance rubric. The chronic failure mode it exists to kill: a lesson that's
a single gadget with three sentences (instead of a solid multi-interaction textbook
chapter with all math in `<TeX>`). Grade each MUST pass/fail before reporting done.

## Decision guide — which packs a lesson uses

`faraday new` installs **no packs** — add only what fits. Run `faraday pack list`
for the live catalog and see [references/packs.md](references/packs.md). Map the
creator's intent to a pack:

- **plain 2D** — diagrams, charts, algorithm walk-throughs, parameter exploration.
  The right default for most topics; no extra pack required beyond kit/ui.
- **`sim2d`** — SVG + GSAP formula simulations with motion hooks.
- **`game2d` / `storybook-game2d`** — PixiJS educational games or page-turn story shells.
- **`srs`**, **`exam`**, **`slide-view`**, **`textbook-view`**, **`notes`** — delivery
  and assessment formats.
- **`lecture-design`**, **`audience`**, **`stem-methods`** — pedagogy and domain
  methodology (skill-only; install when designing how it teaches).
- **Single lesson vs. course** — one idea → one `<Lesson>`; a sequence → `<Course>`
  from `@faraday-academy/kit/runtime`.

## Styling (non-negotiable baseline)

shadcn CSS-style convention. Use **semantic** Tailwind classes
(`text-muted-foreground`, `bg-card`, `text-primary`) and, in SVG, theme tokens via
`style={{ fill: "var(--primary)" }}`. **Never** hardcode `#hex` or `text-blue-500`
— it breaks light/dark. Data-series colors: `var(--chart-1..5)`. For deliberate
visual/UX design (hierarchy, layout, polish), see [references/design.md](references/design.md).

## References (load as needed)

Design phase:
- [references/discovery.md](references/discovery.md) — intake creator material (PDF/PPT/MD) + the questions to ask.
- **`audience` pack** (`faraday pack show audience` or `.faraday/packs/audience/`) — who the learner is → the delivery methodology per audience.
- [references/assessment.md](references/assessment.md) — the four check forms (MCQ / numeric / sketch / mission), matched to outcome verbs + audience.
- **`lecture-design` pack** (`faraday pack show lecture-design` or `.faraday/packs/lecture-design/`) — the evidence-based default methodology + named methods.
- [references/curriculum.md](references/curriculum.md) — decompose a subject → sequenced roadmap.
- [references/orchestration.md](references/orchestration.md) — build a whole course as a long-running task: persist the plan, one sub-agent per lesson, resume.
- [references/learning-design.md](references/learning-design.md) — levels, unlock gates, mastery, continuity.
- [references/interactive-design.md](references/interactive-design.md) — design the interaction that reveals a concept.
- [references/design.md](references/design.md) — visual/UX design within the theme system.

Build API:
- [references/packs.md](references/packs.md) — module packs: discover with `faraday pack list`, install with `faraday pack add`, read `.faraday/packs/<name>/`.
- [references/authoring-packs.md](references/authoring-packs.md) — **build a new pack**: the contract, the three archetypes, `faraday pack new`, the skill/quality skeleton, the eval loop.
- [references/blocks.md](references/blocks.md) — the full block API + canonical lesson shapes.

Verify:
- [references/quality-bar.md](references/quality-bar.md) — the acceptance rubric (textbook-chapter lessons).

## Slash commands (user-facing verbs)

`/faraday-new`, `/faraday-check`, `/faraday-deploy`. For a full hands-off author pass
in a clean session, delegate to the **faraday-author** subagent.
