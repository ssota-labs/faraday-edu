# Pack: `deck` — slideshow / lecture deck (index)

Load this when the lesson should read as a **slideshow** — one idea per screen,
advanced with prev/next — rather than a scrolled column. The front door; open the
sub-guide for the step you're on.

## When it fits (and when it doesn't)

Decks fit **talks, kiosks/exhibits, and tablets** — anywhere the reader advances
deliberately and each beat gets full attention. They fit younger audiences
(one-idea-per-screen) and presenter-led settings. They do **not** fit dense
reference material or long derivations the reader wants to scan/search — that
wants the default scroll (`<Lesson>`) or a `<Course>`.

## The method (open each as you reach it)

1. **One idea per slide** — [slide-design.md](slide-design.md). What earns a slide,
   the landscape canvas⇄prose split, and keeping each screen to a single beat.
2. **Motion with a job** — [motion.md](motion.md). Animate to *reveal* (build,
   transition, focus), never to decorate; respect reduced-motion.
3. **Pace and navigate** — [pacing.md](pacing.md). Slide count, prev/next + dots +
   arrow keys, and where interactives sit in the flow.

## Build surface

A deck is a `<Paged pages={[…]}>` inside a `<Lesson>` — each page fills the
viewport (one shows at a time; only the active page is mounted, so per-page state
resets on return). Inside a page, split landscape with a `grid h-full
lg:grid-cols-[3fr_2fr]` (canvas ⇄ prose). Use the runtime's `motion` helpers for
reveals. No new dependencies.

## Quality gate

See [../quality.md](../quality.md): each slide is one beat, motion reveals rather
than decorates, and the interactives still carry the teaching (a deck is not a
read-only slideshow).
