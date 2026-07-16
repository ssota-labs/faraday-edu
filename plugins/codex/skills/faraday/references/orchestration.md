# Orchestration — build a whole course as a long-running task

Authoring one lesson fits in one context. Authoring a **curriculum** — a signed-off
roadmap of many lessons — does not: build them all in a single session and the
context fills with each lesson's details until quality degrades. This reference is
the missing layer between [curriculum.md](curriculum.md) (design the roadmap) and
the per-lesson build: **how to persist the plan and execute it lesson-by-lesson
without context rot.**

The shape in one line: **the orchestrator owns the plan; a fresh sub-agent owns each
lesson; the two meet only through files on disk.**

## Prerequisite — scaffold first, then design against real packs

Design reads packs (`audience`, `lecture-design`), and packs only exist after a
scaffold. So for a course the order is:

1. `faraday init <app>` — first curriculum in a new repo (drops a root `AGENTS.md`,
   scaffolds `apps/<app>/`). Adding another curriculum/app later: `faraday new <app>`
   from the repo root → `apps/<app>/`.
2. Now read the packs (`faraday pack show audience`, `… lecture-design`, or
   `.faraday/packs/<name>/`) and do the **Discover** + **Curriculum** design against them.

One **app** = one independent Vite project = **one curriculum** for one audience/domain
(`general-physics` for undergrads and `elementary-physics` for kids are *different
apps*, not one). An app can hold **several plans** (tracks) under `.faraday/plan/`.

## Persist the plan — `.faraday/plan/<plan-id>/` (the resumable source of truth)

Once the roadmap is signed off (see [curriculum.md](curriculum.md)), write it to disk
before building anything. This survives context resets and lets you resume mid-build.

    apps/<app>/.faraday/plan/
      index.md                 # list of this app's plans
      <plan-id>/
        overview.md            # brief · audience · methodology · pack decisions ·
                               # sequence · node index (table with status + links)
        nodes/
          <id>.md              # ONE file per node — the build brief + status

**`overview.md`** holds what every node shares: the audience brief, the chosen
methodology, which packs the course uses, the dependency sequence, and a node
table you scan for progress:

    | id | title | requires | check | packs | status |
    |----|-------|----------|-------|-------|--------|
    | intro   | …   | -        | MCQ     | 2d    | verified  |
    | forces  | …   | intro    | numeric | sim2d | building  |
    | energy  | …   | forces   | mission | 2d    | todo      |

**`nodes/<id>.md`** is the **brief contract** handed to a sub-agent — one node, one
file. Keep these fields:

- **outcome** — what the learner can *do* after (one "aha"; backward-design verb).
- **interaction** — what they manipulate and what must visibly change.
- **check** — the FORM (MCQ / numeric / sketch / mission, per
  [assessment.md](assessment.md)) and the pass bar (diagnostic, not guess-passable).
- **source** — the material excerpt or researched facts this node teaches (see the
  research policy in [discovery.md](discovery.md); flag unverified claims here).
- **packs** — runtime packs this node needs (e.g. `sim2d`, `game2d`).
- **requires** — prerequisite node ids (the unlock edges).
- **file** — `src/lesson/nodes/<id>.tsx` (this node's isolated author file).
- **status** — `todo → building → built → verified` (or `blocked`).

## Execute — one sub-agent per node, orchestrator stays thin

Scaffold the presentation shell first: assemble the `curriculum` in `src/lesson/lesson.tsx`
with **stub nodes** (title + one line each) so the map/unlock order is visible and
confirmable, then fill lessons in. Then loop the nodes:

- For each node, spawn a **clean-session sub-agent** (the **faraday-author** agent) and
  hand it **only that node's `nodes/<id>.md` brief**. It builds and verifies **one
  lesson file** — `src/lesson/nodes/<id>.tsx` — and returns file path + gate results.
- **Parallel branches fan out** — nodes with no dependency between them can be built
  by concurrent sub-agents; each owns a different file, so there is no collision.
- The **orchestrator stays thin**: it holds the plan and the assembly file, updates
  `status` in the node file, and **does not absorb each lesson's internals**. This is
  the whole point — the orchestrator's context stays small and clean across N lessons.

### File ownership (this is what prevents write conflicts)

| Who | Owns / writes |
|---|---|
| **Sub-agent** (per node) | its lesson file `src/lesson/nodes/<id>.tsx` + its `.faraday/plan/<plan>/nodes/<id>.md` status |
| **Orchestrator** | the assembly `src/lesson/lesson.tsx` (the module-scope `curriculum` + node array), `overview.md`, `plan/index.md` |

Only the `curriculum` **object** must stay at module scope (progress is keyed on its
identity); node components are imported from their files.
Never let two sub-agents write the same file. If a node needs a shared helper, the
orchestrator adds it.

## Resume, and checkpoint by tier

- **Resume:** on a new session or after a reset, read `.faraday/plan/<plan>/` and pick
  up from the first `todo`/`building` node. The plan is the memory; the chat is not.
- **Tier checkpoints:** after finishing a tier (a group of nodes), run `pnpm check`
  and actually **drive the course** (`pnpm dev`) — confirm chapter nav and each
  lesson renders. See the quality bar in [quality-bar.md](quality-bar.md).

## Match the effort to the request

A 3-lesson unit doesn't need parallel fan-out or tier checkpoints — write the plan
folder, build the nodes in order, verify. Reserve the full machinery (stub shell →
parallel sub-agents → per-tier drive) for genuinely large curricula. Always persist
the plan though: it's cheap, and it's what makes the build resumable.
