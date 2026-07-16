# Pack: `srs` — spaced-repetition flashcards (agent guide)

Load this when the goal is **memorization/recall** — vocabulary, facts, formulas,
dates — and the learner benefits from **spaced retrieval**. This pack ships an
author-editable `<Flashcards>` component (SM-2-lite scheduler) into
`src/lesson/srs/`; it uses no new npm dependencies.

## When it fits (and when it doesn't)

Spaced retrieval is for *durable memory of discrete items*. Use it for:
kanji/vocabulary, anatomy labels, chemical symbols, historical dates, formula
recall. **Don't** use it for conceptual understanding or problem-solving — those
want interactives and worked examples, not flashcards. A concept dressed as a
flashcard fails the quality bar.

## Pedagogy (why spaced, not massed)

- **Retrieval practice** — the learner must *produce* the answer before revealing,
  not just re-read it. The "Reveal" gate enforces this.
- **Spacing** — items you know well return less often; lapses return soon. The
  scheduler (`scheduler.ts`, SM-2-lite) handles the intervals; don't hand-tune.
- **Desirable difficulty** — grade honestly (`Again`/`Hard`/`Good`/`Easy`); easy
  wins that come too soon weaken memory.

## Using it

```tsx
import { Flashcards } from "./srs/Flashcards";

<Flashcards
  deckId="kanji-n5"                 // stable id — the localStorage schedule key
  cards={[
    { id: "water", front: "水", back: "water (mizu)" },
    { id: "fire",  front: "火", back: "fire (hi)" },
  ]}
/>
```

- `deckId` must be **stable** — it's the persistence key. Changing it resets the
  schedule.
- `front`/`back` are React nodes — put an image, TeX (`<TeX>`), or audio in either.
- For a **demo** that shows spacing in seconds instead of days, pass
  `dayMs={4000}` (and optionally an injectable `now`).

## Extending

- Progress persists to `localStorage` per `deckId`. To record mastery centrally,
  wire the deck's grade callback to the lesson's `@faraday-academy/lms`
  recorder.
- Edit `scheduler.ts` to change the algorithm — it's yours.

## Quality gate

See `quality.md`. Key rules: cards are atomic recall items (not concepts), the
reveal-then-grade loop is intact, and `deckId` is stable.
