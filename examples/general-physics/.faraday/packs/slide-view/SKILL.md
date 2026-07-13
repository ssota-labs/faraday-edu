# Pack: `slide-view` — slide view presentation (index)

Load this when a lecture should use the **slide view** — one idea per screen,
advanced with prev/next — rather than a scrolled textbook view. The front door;
open the sub-guide for the step you're on.

## When it fits (and when it doesn't)

Slide view fits **talks, kiosks/exhibits, and tablets** — anywhere the reader advances
deliberately and each beat gets full attention. It fits younger audiences
(one-idea-per-screen) and presenter-led settings. It does **not** fit dense
reference material or long derivations the reader wants to scan/search — that
wants the **textbook view** or the default scroll (`<Lesson>`).

## The method (open each as you reach it)

1. **One idea per slide** — [slide-design.md](slide-design.md). What earns a slide,
   the landscape canvas⇄prose split, and keeping each screen to a single beat.
2. **Motion with a job** — [motion.md](motion.md). Animate to *reveal* (build,
   transition, focus), never to decorate; respect reduced-motion.
3. **Pace and navigate** — [pacing.md](pacing.md). Slide count, prev/next + dots +
   arrow keys, and where interactives sit in the flow.

## Build surface

A slide view is a `<SlideDeck slides={[…]}>` inside a `<Lecture>` view tab — each slide
fills the viewport (one shows at a time; only the active slide is mounted, so per-slide
state resets on return). **The runtime does not inject a title slide** — you author
slide 1 yourself (see [slide-design.md](slide-design.md) § First slide). Inside a
slide, split landscape with a `grid h-full lg:grid-cols-[3fr_2fr]` (canvas ⇄ prose).
Use the runtime's `motion` helpers for reveals. No new dependencies.

## Quality gate

See [../quality.md](../quality.md): each slide is one beat, motion reveals rather
than decorates, and the interactives still carry the teaching (slide view is not a
read-only slideshow).
