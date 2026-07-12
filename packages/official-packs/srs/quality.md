# Pack `srs` — quality bar

Additional acceptance rules for lessons that use the `srs` pack.

- **Atomic recall items.** Each card tests one discrete fact (a word, a symbol, a
  date). A card whose answer is a paragraph or a concept is a fail — that content
  wants an interactive, not a flashcard.
- **Retrieval, not recognition.** The reveal-then-grade loop is intact: the
  learner attempts recall before the answer shows. No auto-revealing decks.
- **Stable `deckId`.** Every `<Flashcards>` has a stable `deckId` (the schedule
  persists to it). A missing or volatile id loses the learner's progress.
- **Honest grading path.** All four grades (`Again`/`Hard`/`Good`/`Easy`) are
  reachable; the scheduler is not bypassed or hard-set.
- **Right tool.** Spaced repetition is chosen because the outcome is *memorize/
  recall* — not to drill conceptual understanding that belongs in a sim.
