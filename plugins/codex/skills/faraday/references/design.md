# Visual & UX design — clear and polished, within the system

Design matters here for a specific reason: **quality is trust** (a lesson that looks
sloppy reads as untrustworthy, and Faraday's whole pitch is auto-generated material
you *can* trust). Aim for clear first, polished second — and design *with* the
system, not against it.

## The system you design within

You are theming an existing, reset shadcn/Base-UI layer — not styling from scratch.

- **Theme tokens** — semantic colors that adapt light/dark. Use them
  (`text-primary`, `bg-card`, `text-muted-foreground`, `border-border`); in SVG,
  `style={{ fill: "var(--primary)" }}`. **Never hardcode `#hex` or `text-blue-500`.**
  Data series use `var(--chart-1..5)`.
- **Design tokens** — radius/density live in the token layer; the reading column and
  the light/dark toggle come from the runtime. You don't rebuild chrome.

To restyle, adjust token *values* / pick a mood — don't fight the reset or add ad-hoc
CSS. Deep bespoke visual work can borrow general frontend-design judgement, but stay
inside this token contract or `pnpm check` / theming will fight you.

## Two design registers

Faraday output is a **textbook chapter**: reading column, prose-led sections,
instruments (Workbench/Chart/CodeCell) embedded in the flow, math as `<TeX>`.
Game-style full-bleed shells are out of scope for Phase 1 — use `<SlideDeck>` or
`game2d` packs when you need a different surface.

## Principles

- **One focal interactive per section.** Within each section, lead with the thing
  the learner manipulates (the `<Workbench>` canvas); prose sets it up and
  interprets it. A chapter strings several such sections — depth comes from more
  sections, not more knobs on one figure.
- **Readouts on the instrument.** Live numbers overlay the canvas (Workbench
  `hud` + `<Readout>`) like an instrument panel — not a strip of cards below.
- **Restraint.** Fewer, well-labelled controls beat many. Group them with
  `<ControlGroup>`. Every block on the page should teach — cut the rest.
- **Consistent color meaning.** Decide what each token *means* in your visuals and
  hold it: e.g. `--primary` = active/current, `--muted-foreground` = inert/context,
  `--destructive` = attention/error. Reusing meaning makes diagrams read instantly.
- **Legibility in both themes.** Check contrast in light *and* dark. Prefer direct
  labels (`<Label3D>`, inline text) over legends the eye has to cross-reference.
- **Motion with purpose.** Animate to show change (a step, a sweep, a settle), not for
  flourish. If motion doesn't clarify, cut it.
- **Consistency across a course.** Same color meanings, same layout rhythm, same
  control placement chapter to chapter — so the learner isn't relearning the UI.

## Match the subject (and the creator)

Let the look echo the topic: a starfield for orbits, a bioluminescent haze for a
cell, a clean grid for a lab. If the creator has a voice or brand, reflect it in tone
and (within the token palette) accent choices — without breaking the theme.

## Verify the design

Drive it at a **real, non-zero viewport** (charts won't paint at 0px), and check
**both light and dark**. Confirm the focal interaction is the first thing the eye
lands on, labels are legible, and nothing relies on a color that vanishes in one theme.
