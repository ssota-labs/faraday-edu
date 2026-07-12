# Faraday

> **Turn a lesson you already teach into a high-quality interactive textbook — with a grounded AI tutor — in one shot.**
>
> Status: CLI phase (Phase 0 complete, building toward GTM Stage 1 soft launch).
> Launch plan: [LAUNCH-STAGE1.md](docs/LAUNCH-STAGE1.md). Architecture:
> [VISION.md](docs/VISION.md) · customer strategy: [GTM.md](docs/GTM.md).
> Working codename; modeled on toolcraft-style self-contained packaging, headed
> toward a mirror-dimension-style web platform later.

Faraday is a **scaffolder** for AI-authored interactive courseware. You (or your
coding agent) run one command and get a self-contained Vite + React app for a
lesson — a live canvas the reader *manipulates*, not a wall of text. Add a
durable, grounded **AI tutor** with a flag. Bundle lessons into a **curriculum or
game-like world**, wire in **LMS** progress tracking, and deploy. No workspace, no
npm publish, no backend unless you ask for one.

The name of the game is the **Studio Seed**: a locked, vendored runtime does the
hard, correctness-critical parts; you (or your agent) get a wide-open authoring
zone; and quality gates enforce the contract before anything ships.

---

## Who this is for (right now)

GTM **Stage 1** is early-adopter *creators* — tutors, TAs, teachers, course
authors — who **already run a coding agent** (Claude Code, Codex). Zero tool
friction: you already have the agent, Faraday is just a scaffolder it drives.

The fastest path is to install a **Faraday plugin** for your agent and let it do
the work:

- **Claude Code** → [`plugins/claude-code/`](plugins/claude-code/) — a plugin
  (skill + `/faraday-*` slash commands + an authoring subagent).
- **Codex** → [`plugins/codex/`](plugins/codex/) — an `AGENTS.md` + custom
  prompts you drop into `~/.codex/`.

Each plugin teaches your agent the whole loop below: scaffold → author against the
locked-tree contract and blocks API → pass the gates → embed the tutor → deploy.
See each plugin's README for one-command install.

Prefer the raw CLI? It's four verbs — keep reading.

---

## The loop

In a clean agent session (or by hand):

```bash
npx @faraday-academy/cli new my-lesson         # scaffold a 2D lesson + pnpm install
#   add --tutor        durable grounded AI tutor (adds a tiny server layer)
#   add --3d           Three.js / React Three Fiber block + demo
#   add --physics      Rapier physics (implies --3d)
cd my-lesson

# author src/lesson/lesson.tsx using @/faraday/blocks + @/faraday/runtime
# (this is where your agent — or you — does the creative work)

pnpm check                                 # structure + SHA-256 integrity gates
pnpm dev                                   # Vite serves on a free port; drive it
pnpm build                                 # static bundle in dist/ (deployable)
```

> During local development of this repo, `npx @faraday-academy/cli` is equivalent to
> `node packages/cli/bin/faraday.mjs` run from the repo root.

---

## Two zones (the core contract)

Every scaffolded lesson has exactly two zones. This split is the whole idea.

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | Your lesson. `src/lesson/lesson.tsx` is the fixed entry and must `export default` a React component. Add sibling files freely. |
| **Protected area** | `src/faraday/**` | Vendored shadcn UI, lesson blocks, runtime, styles, world/tutor runtimes. **Do not edit.** Sealed by a SHA-256 manifest — `faraday check` (`pnpm check`) fails on drift. |

`src/main.tsx`, `index.html`, and config are the app shell; you rarely touch them.
Templates already import via the `@/faraday/*` alias, so there is **no import
rewriting** at scaffold time.

The scaffolded project ships its own authoring guide in `AGENTS.md` and
`docs/authoring.md` — your agent reads those to learn the blocks API.

---

## What you can build (the layer stack)

Faraday closes the feature set **horizontally** at Stage 1 — every layer works
today under BYOK / self-deploy. Later stages remove friction (managed AI,
multi-tenancy, payments), they don't add features. (See [VISION.md](docs/VISION.md) §2.)

- **Lesson** — one interactive idea. ~15 shadcn-based blocks: `<Lesson>`,
  `<Prose>`, `<Stage>`, `<Workbench>` (live canvas + floating control panel),
  `<ControlGroup>`, `<Chart>`, `<ParamSlider>`, `<ParamSwitch>`, `<Segmented>`,
  `<Scrubber>` + `useStepper`, `<Quiz>`, `<Callout>`, `<Reveal>`, `<Compare>`,
  `<Stat>`. Themed via externalized CSS style/design/theme token layers.
- **3D** (`--3d`) — `<Scene3D>` (R3F) with procedural helpers (`<Body>`,
  `<Planet>`, `<OrbitPath>`, `<Label3D>`) and a `<Model>` glTF loader.
  **Procedural-first, asset-fallback.** Domain scenes must carry a `mood`
  (`space`, `cell`, `lab`, `physics`, `abstract`).
- **Physics** (`--physics`) — Rapier gravity/collision via `@react-three/rapier`.
- **Curriculum / world** — `<Course>` for a linear textbook (chapter nav,
  prev/next, `#hash`), or `<CurriculumHost>` for a graph of lessons with **unlock
  progression** and a swappable **pack** (`linearPack`, `map2dPack`,
  `world3dPack`) — a status list, a 2D node map, or a 3D open-world constellation.
- **LMS** — vendored progress recorder + dashboard components that attach to a
  lesson or a whole curriculum.
- **Tutor AI** (`--tutor`) — a **durable, grounded** chat agent embedded beside
  your content. More below.

---

## Example lessons — the feel

A quick tour of what "one command → an interactive lesson" actually produces.
Each is a real combination of the blocks and flags above; your agent generates
them on demand from a topic — you don't wire any of it by hand.

- **Watch Dijkstra find the shortest path.** Step through a graph as the frontier
  expands, scrubbing back and forth — then ask the built-in tutor *why* it never
  revisits a settled node. *(stepped frames + `<Scrubber>` + `--tutor`)*
- **Feel compound interest compound.** Drag principal, rate, and compounding
  frequency; the balance curve and the final number update live. The "Rule of 72"
  stops being a formula you memorize. *(live knobs + `<Chart>` + `<Stat>`)*
- **See Kepler's second law sweep equal areas.** A planet on a real elliptical
  orbit in 3D speeds up near the sun; drag the eccentricity and the equal-area
  sweeps stay equal. *(3D, `space` mood — `--3d`)*
- **Drop 500 balls through a Galton board.** Real physics — each ball bounces off
  the pegs and piles up into a bell curve you never programmed. *(Rapier —
  `--physics`)*
- **Take a 3-part course on waves.** Transverse vs. longitudinal, then
  interference you mix with sliders, then standing-wave harmonics — with chapter
  nav, prev/next, and deep links. *(`<Course>`)*
- **Play a number-systems quest.** Binary → hexadecimal → two's-complement laid
  out as a map; clear each node's quiz to unlock the next, with progress tracked.
  *(unlock world + LMS)*

Swap the subject and the world follows its mood: a glowing **animal cell**
(`cell`), a **molecule** in a clean lab (`lab`), an **abstract geometry** surface
(`abstract`). The through-line: the reader *does* the idea instead of reading it.

---

## The AI tutor (`--tutor`)

`faraday new <name> --tutor` turns the app into a Vite + Nitro + Workflow hybrid
and vendors a `<Tutor>` component. It follows Vercel's AI SDK design and runs a
Workflow DevKit **durable agent**: a reply survives a page refresh, a network
drop, or a serverless timeout and resumes mid-answer.

```tsx
import { Tutor } from "@/faraday/tutor";

<Tutor
  title="Binary-search tutor"
  context={LESSON_TEXT}   // the tutor answers only from this — grounding, no quiz-answer leaks
  greeting="Hi! Ask me anything about binary search."
/>
```

- **Grounded**: the tutor is scaffolded to answer from the `context` you pass and
  steer back when a question falls outside it.
- **Socratic**: it hints and asks instead of dumping answers — never leaks quiz
  or exercise solutions outright.
- **Thinking + caching**: the default model streams reasoning into a collapsible
  "Thinking" block; a deterministic prompt prefix lets the provider implicit-cache
  the growing conversation. (Persona, rules, and model live in
  `workflows/tutor-agent.ts` — that file is yours to edit.)

**Setup**: `cp env.example .env.local` and paste an `AI_GATEWAY_API_KEY` (Vercel
dashboard → AI Gateway → API keys). `.env.local` is git-ignored — never commit a
real key. On Vercel, deploys authenticate to the Gateway via OIDC; no key needed.
Static (non-tutor) lessons stay server-free. Full guide: the scaffolded
`docs/tutor.md`.

---

## CLI reference

```
faraday new <name> [--3d | --physics] [--tutor] [--at <dir>] [--overwrite] [--skip-install] [--json]
faraday check [--dir <lesson>]     verify the protected src/faraday/** tree
faraday help
```

| Flag | Effect |
|---|---|
| `--3d` | include the Three.js (R3F) 3D block + a solar-system demo. Omit for 2D — `three` is never installed or bundled without it. |
| `--physics` | `--3d` plus the Rapier physics engine + a gravity/collision demo. |
| `--tutor` | add the durable grounded AI tutor (`api/` + `workflows/` server layer; needs `AI_GATEWAY_API_KEY` locally). |
| `--at <dir>` | scaffold into `<dir>` instead of `./<name>`. |
| `--overwrite` | allow writing into a non-empty target. |
| `--skip-install` | skip `pnpm install` (or set `FARADAY_SKIP_INSTALL=1`). |
| `--json` | machine-readable result (title, package name, dir, next steps) — for agents. |

Exit codes: `0` ok · `1` lesson check failed · `2` usage error · `4` environment
error. `--json` makes `new` emit a structured result an agent can parse.

---

## Repo layout

```
faraday-academy/                    # repo root = the pnpm workspace (apps/* + packages/*)
├─ apps/
│  └─ labs/                     # @faraday-academy/labs — internal Vite catalog of components + skills/packs
├─ packages/
│  ├─ cli/                      # @faraday-academy/cli — the `faraday` scaffolder (bin + src + templates)
│  │  └─ templates/             #   starter (app shell) + addon-3d + addon-tutor (scaffolding assets)
│  ├─ runtime/                  # @faraday-academy/runtime — UI, blocks, runtime, styles, world, lms (lessons pin this)
│  ├─ three/                    # @faraday-academy/three — opt-in R3F/three.js 3D block (--3d / --physics)
│  └─ tutor/                    # @faraday-academy/tutor — opt-in docked <Tutor> chat widget (--tutor)
├─ examples/                    # Standalone demos (own lockfile; Vercel root = examples/<name>)
│  └─ voyage-log/               #   C-B 항해 일지 curriculum (--3d)
├─ plugins/
│  ├─ claude-code/              # Claude Code plugin + marketplace (install & drive Faraday)
│  └─ codex/                    # Codex AGENTS.md + custom prompts
├─ specs/                       # tutor-ai.md, world-seed.md (design)
├─ docs/                        # VISION · GTM · LAUNCH-STAGE1 · DEMO-IDEATION (strategy)
├─ AGENTS.md
└─ README.md
```

> The runtime + addons are first-class workspace packages (`@faraday-academy/*`) that
> generated lessons **pin and consume** as dependencies — no longer vendored/SHA-locked.
> Move a lesson's pins with `faraday upgrade`. `@faraday-academy/labs` previews the same
> runtime source via the `@/faraday` alias.

## What the scaffolder does

Copy starter → target · restore `.gitignore` · pin `@faraday-academy/runtime`
(+ `three`/`tutor` for `--3d`/`--tutor`) · wire `app.css` to the runtime stylesheet
· inject package name + HTML title · issue a `lessonId` provenance record ·
`pnpm install`. `faraday check`/`doctor` then verify the layout + exact pins.

## Develop Faraday itself

```bash
node --test packages/cli/src/*.test.mjs     # CLI unit tests
node packages/cli/bin/faraday.mjs help      # run the CLI from the repo
```

---

## Where this is headed

Faraday is the **build-time** half of a two-AI system: a *creation AI* authors
courseware now (what the plugins drive); a *tutor AI* teaches students at runtime
(what `--tutor` embeds). The platform phase adds managed AI (Vercel AI Gateway),
multi-tenancy (Vercel Platforms), and creator↔student payments — turning the
open-core CLI into a three-sided marketplace. Read [VISION.md](docs/VISION.md) and
[GTM.md](docs/GTM.md) for the full arc.
