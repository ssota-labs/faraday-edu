# AGENTS.md — authoring a Faraday lesson

You are building **one interactive lesson**: a minimal vinext + React app that
teaches one idea by letting the reader *do* something. The UI is **shadcn-based**
(Base UI primitives + an externalized CSS style layer).

**Hold the quality bar** — [docs/quality-bar.md](docs/quality-bar.md) is the
acceptance rubric (lessons must read as solid textbook chapters: multiple different
interactions, real prose between them, all math in `<TeX>`). Grade your output
against it before calling anything done.

## Two zones

| Zone | Path | Rule |
|---|---|---|
| **Author area** | `src/lesson/**` | Write your lesson here. `src/lesson/lesson.tsx` is the fixed entry and must `export default` a React component. Add sibling files freely. For a **multi-lesson curriculum**, put each node's lesson in its own file under `src/lesson/nodes/<id>.tsx` and import them into the module-scope `curriculum` in `lesson.tsx`. |
| **Runtime (dependency)** | `@faraday-academy/*` | The shadcn UI, lesson blocks, runtime, and styles — **pinned npm packages**, not vendored. You consume them via `@faraday-academy/kit/*` and `@faraday-academy/ui/*`; you don't edit them. `pnpm check` verifies the pin. |

`app/` and the config files are the vinext shell — you rarely touch them.

## Module packs

`faraday new` installs **no packs**. Add capabilities with `faraday pack add <name>`
and read the guide at `.faraday/packs/<name>/`. Run `faraday pack list` for the
live catalog.

## How the styling works (important)

This uses the shadcn **CSS-style** convention, not inline utility soup:

- **Theme tokens** (semantic colors, light/dark) → `@faraday-academy/ui` (`theme-lesson.css`).
- **Component styles** → `@faraday-academy/ui` (`cn-components.css`, activated by `.style-faraday`).
- **Design tokens** (Tailwind namespace mapping + radius/density) → `@faraday-academy/ui` (`design-tokens.css`).
- In your lesson, use **semantic Tailwind classes** (`text-muted-foreground`,
  `bg-card`, `text-primary`) and the blocks below. Never hardcode colors like
  `text-blue-500`. In SVG, pull theme colors with `style={{ fill: "var(--primary)" }}`.

## Blocks you assemble

Import from `@faraday-academy/kit/blocks`; raw shadcn primitives are in `@faraday-academy/ui/components/ui/*`.

See [docs/authoring.md](docs/authoring.md) for the full block reference and canonical lesson shapes.

## Workflow

1. Decide what the reader manipulates and what they should *see change*.
2. Install any packs the topic needs (`faraday pack add <name>`).
3. Write it in `src/lesson/` using the blocks. A lesson is a **chapter, not a
   gadget**: teach in prose, then let each idea be *done* — typically 2–4 different
   interactives with explanation before and interpretation after each. All math in
   `<TeX>`. See [docs/quality-bar.md](docs/quality-bar.md).
4. `pnpm check` — structure + integrity gates must pass (exit 0).
5. `pnpm dev` — read the local URL from the output, drive the controls, fix console errors.
6. End with a `<Quiz>` that can only be answered by having used the interactives.

## Constraints

- One lesson / one idea. No routing, no backend, no network calls.
- Don't add dependencies unless the lesson genuinely needs them.
- Don't try to fork the runtime. `@faraday-academy/kit` is a pinned dependency —
  if a primitive seems missing, note it in your summary instead of working around it.
