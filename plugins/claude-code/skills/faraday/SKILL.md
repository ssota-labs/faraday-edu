---
name: faraday
description: Help a creator turn their material or idea into interactive courseware with the Faraday CLI — design the course and learning path, design and build concept-revealing interactives, add a grounded AI tutor, and polish the visuals. Use when someone wants to teach a topic interactively, make an interactive textbook/lesson/course, turn a PDF/PPT/notes into a lesson, build a course or learning roadmap, add an AI tutor, or design/verify interactive teaching material. Triggers on "interactive lesson/textbook/course", "faraday", "teach X interactively", "turn my slides/notes into a lesson", "curriculum/roadmap", "AI tutor for my course".
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
| **Plan & Execute** | For a multi-lesson curriculum (a long-running task): persist the signed-off roadmap to `.faraday/plan/`, then build lesson-by-lesson with an isolated sub-agent per node, resuming from the plan on any reset. Scaffold (`init`/`new`) **first** so design can read packs. | [references/orchestration.md](references/orchestration.md) |
| **Interactive** | For each concept, design the *interaction* that reveals it (what the learner manipulates, what must visibly change) before touching the API. | [references/interactive-design.md](references/interactive-design.md) |
| **Assess** | Pick each check's FORM by the outcome verb (recognize→MCQ, compute→numeric input, predict→sketch, do→mission) and place them in the concept→sim→check flow. | [references/assessment.md](references/assessment.md) |
| **Visual** | Make it clear and polished within the theme system — hierarchy, restraint, mood. | [references/design.md](references/design.md) |
| **Build** | Author it against the block/world/tutor APIs. | [blocks.md](references/blocks.md) · [worlds.md](references/worlds.md) · [tutor.md](references/tutor.md) |
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
First Principles for professionals) from the **`audience` pack**. Every pack is a
**default pack** — `faraday new` is batteries-included and auto-installs all nine
(read them at `.faraday/packs/<name>/`; `faraday pack show <name>` at design time).
Drop the ones a finished lesson doesn't need with `faraday pack remove <name>`
(e.g. the heavy `three`/`tutor` runtimes) before shipping.

## The one rule that governs everything: two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | You write here. `src/lesson/lesson.tsx` is the fixed entry; it must `export default` a React component. Add sibling files freely (`src/lesson/chapters/`, helpers, models). |
| **Runtime (dependency)** | `@faraday-academy/*` | The UI, blocks, runtime, styles, and world code — **pinned npm packages**, not vendored. Consume them via `@faraday-academy/runtime/*` (and `/three`, `/tutor`); you can't edit them. `faraday check` verifies the pins, and so will CI/deploy. |

If a primitive seems missing, **note it — don't try to fork the runtime**. The UI lives in
the pinned `@faraday-academy/runtime` package, not your lesson, so `shadcn add` won't help.

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

1. **Scaffold.** `faraday new` is batteries-included — it auto-installs all nine
   packs (skill + runtime), so every capability is already on hand; there are no
   capability flags: `npx @faraday-academy/cli@latest new <name> [--json]` (installs
   deps unless `--skip-install`), then `cd` in. Use the decision guide below to know
   which packs the subject actually uses; before shipping, `faraday pack remove <name>`
   the ones it doesn't (especially the heavy `three`/`tutor` runtimes).
   **Starting a whole course/repo?** Use `faraday init <first-app>` — it drops a repo
   `AGENTS.md` and scaffolds the first app at `apps/<first-app>/`; add more apps later
   with `faraday new <name>` from the repo root. Each app is one independent project =
   one curriculum; scaffolding first is what makes the design-time packs available
   (see [references/orchestration.md](references/orchestration.md)).
2. **Read the in-project guide** — the scaffold ships `AGENTS.md` and
   `docs/authoring.md`; the block API also lives in [references/blocks.md](references/blocks.md).
   Start from a `docs/examples/*.tsx` when one fits (stepped, continuous, course,
   curriculum, lms, tutor) — copy it to `src/lesson/lesson.tsx` and adapt.
3. **Author** `src/lesson/**` from `@faraday-academy/runtime/blocks` + `@faraday-academy/runtime/runtime`.
4. **Gate:** `pnpm check` — structure + integrity must exit 0.
5. **Verify live:** `pnpm dev`, drive it (see below), end lessons with a `<Quiz>`.
6. **Ship (optional):** `pnpm build` → static `dist/`, or deploy (`/faraday-deploy`).

## Verify it teaches the right thing

Faraday lessons are teaching tools, so "it compiles" and "it renders" are necessary
but **not sufficient** — a lesson that runs while showing wrong behaviour is worse
than none. Always attempt verification, and layer the checks from cheap to
meaningful:

1. **Gates** — `pnpm check` (layout + pin) + `pnpm typecheck` / `pnpm build`
   (the whole graph compiles). These catch structure and type errors, not meaning.
2. **Drive the behaviour** — `pnpm dev`, then exercise every control and confirm the
   thing the reader manipulates changes what it should. **The world/roadmap screen
   and any 3D scene are visual-only — an HTTP-200 check cannot grade them; the
   quality-bar MUSTs (full-bleed, HUD, node framing, mood, legibility) are only
   verifiable by screenshotting a real, non-zero viewport (test a narrow width too —
   an immersive world must frame every node, incl. the current objective, at
   laptop/portrait aspects).** If the harness can't drive an out-of-tree `/tmp`
   scaffold (preview tools may bind to the session root, reuse a neighbouring server,
   or need a non-zero viewport to paint), either scaffold where the harness can serve
   it or have the orchestrator drive it — and if you truly can't, fall back to: HTTP
   (Also: a hidden/background preview tab freezes `requestAnimationFrame`, so
   rAF-driven motion won't advance — verify animation by pumping mocked rAF frames
   deterministically, or on a visible tab; a frozen ball is not proof of a bug.)
   200 on the served modules + a clean dev log + a static trace of the logic (and for
   a tutor, `curl` the `/api/chat` SSE), but say plainly that the visual MUSTs went
   **ungraded**. Don't imply you drove it when you didn't.
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

Then hold the **quality bar** — [references/quality-bar.md](references/quality-bar.md)
is the acceptance rubric. The two chronic failure modes it exists to kill: a
curriculum world rendered as a document (header + widget + whitespace instead of
a full-bleed game screen with a HUD), and a lesson that's a single gadget with
three sentences (instead of a solid multi-interaction textbook chapter with all
math in `<TeX>`). Grade each MUST pass/fail before reporting done.

## Decision guide — which packs a lesson uses

`faraday new` pre-installs all nine packs (batteries-included), so you don't *add*
capabilities — you **use** the ones that fit and `faraday pack remove <name>` the
rest (there are no flags). Run `faraday pack list` for the live catalog and see
[references/packs.md](references/packs.md). Map the creator's intent to a pack:

- **plain 2D** — diagrams, charts, algorithm walk-throughs, parameter exploration.
  Uses no capability pack; trim the heavy runtimes. The right default for most topics.
- **`three`** — the subject is inherently spatial (astronomy, molecules, geometry,
  anatomy). R3F `<Scene3D>`. Domain scenes **must** set a `mood`.
- **`three --physics`** — genuine dynamics: collisions, gravity, stacking, joints
  (implies 3D). The rapier variant isn't in the base install — add it with
  `faraday pack add three --physics`. For scripted motion (orbits) use the render loop.
- **`tutor`** — the reader benefits from asking questions. A durable, grounded chat
  tutor. Needs `AI_GATEWAY_API_KEY` locally. See [references/tutor.md](references/tutor.md).
- **other packs** — memorization (`srs`), exams (`exam`), slide view (`slide-view`), kids
  (`kids`), pen notes (`notes`), pedagogy (`lecture-design`). All pre-installed;
  `faraday pack remove <name>` what a lesson doesn't use.
- **Single lesson vs. course vs. curriculum** — one idea → one `<Lesson>`; a sequence →
  `<Course>`; a graph with unlock progression / a roadmap map → `<CourseHost>` +
  a **presentation**: built-in `linearPack`, or install one — `faraday pack add map2d`
  (2D map), or the `three` pack's `world3dPack` (3D). Design this in the Curriculum
  phase, build it per [references/worlds.md](references/worlds.md).

## Styling (non-negotiable baseline)

shadcn CSS-style convention. Use **semantic** Tailwind classes
(`text-muted-foreground`, `bg-card`, `text-primary`) and, in SVG, theme tokens via
`style={{ fill: "var(--primary)" }}`. **Never** hardcode `#hex` or `text-blue-500`
— it breaks light/dark. Data-series colors: `var(--chart-1..5)`. For deliberate
visual/UX design (hierarchy, layout, mood, polish), see [references/design.md](references/design.md).

## References (load as needed)

Design phase:
- [references/discovery.md](references/discovery.md) — intake creator material (PDF/PPT/MD) + the questions to ask.
- **`audience` pack** (default; `faraday pack show audience` or `.faraday/packs/audience/`) — who the learner is → the delivery methodology per audience (creator's own overrides).
- [references/assessment.md](references/assessment.md) — the five check forms (MCQ / numeric / sketch / mission / tutor-graded), matched to outcome verbs + audience.
- **`lecture-design` pack** (default; `faraday pack show lecture-design` or `.faraday/packs/lecture-design/`) — the evidence-based default methodology + named methods (creator's own overrides).
- [references/curriculum.md](references/curriculum.md) — decompose a subject → sequenced roadmap.
- [references/orchestration.md](references/orchestration.md) — build a whole course as a long-running task: persist the plan, one sub-agent per lesson, resume.
- [references/learning-design.md](references/learning-design.md) — levels, unlock gates, mastery, continuity.
- [references/interactive-design.md](references/interactive-design.md) — design the interaction that reveals a concept.
- [references/design.md](references/design.md) — visual/UX design within the theme system.

Build API:
- [references/packs.md](references/packs.md) — module packs: discover with `faraday pack list`, install with `faraday pack add`, read `.faraday/packs/<name>/`.
- [references/authoring-packs.md](references/authoring-packs.md) — **build a new pack**: the contract, the three archetypes, `faraday pack new`, the skill/quality skeleton, the eval loop.
- [references/blocks.md](references/blocks.md) — the full block API + canonical lesson shapes.
- [references/worlds.md](references/worlds.md) — `<Course>`, `<CourseHost>`, **world packs** (presentation shapes), 3D moods, LMS.
- [references/tutor.md](references/tutor.md) — embed + ground the `tutor` pack AI, edit its persona/model.

Verify:
- [references/quality-bar.md](references/quality-bar.md) — the acceptance rubric (game-screen worlds, textbook-chapter lessons).

## Slash commands (user-facing verbs)

`/faraday-new`, `/faraday-tutor`, `/faraday-check`, `/faraday-deploy`. For a full
hands-off author pass in a clean session, delegate to the **faraday-author** subagent.
