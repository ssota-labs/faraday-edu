# Pedagogy — tablet / storybook learners

This guide is the home of the former **`kids` pack** rules.

## CRA (Concrete → Representational → Abstract)

Every idea starts as something the learner **does** on the page (drag, tap, pour),
becomes a **picture**, and only then meets a **symbol** — small, last, next to
the picture it compresses. Never open on notation.

## One idea per page

Paged, not scrolled. A child (or anyone in storybook mode) should never face a
wall of text. Under ~50 words of narration per page for early readers;
read-aloud friendly.

## Big targets

Fingers, not cursors. Large hit areas inside Pixi (`eventMode`, generous
padding) and large DOM chrome buttons. Prefer drag/tap over typing.

## Missions, not definitions

Checks are "make the orbit a circle", "feed 3 apples" — never "what is…".
Picture-anchored Faraday `<Quiz>` options after a page are fine.

## Celebrate

Progress must be felt: page-turn SFX (`celebrate()` / `successSound`), XP if a
course shell wraps the story, a burst on success.

## Compose existing blocks when Pixi isn't needed

Still valid without a canvas: `<SlideDeck>` + `<SketchPad>` + `<Challenge>` +
picture `<Quiz>`. Reach for `StorybookGame` when the **page needs a 2D stage**.
