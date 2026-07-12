// <Flashcards> — a spaced-repetition deck for memorization lessons. Author-editable;
// installed by `faraday pack add srs`. The learner sees a prompt, tries to recall,
// reveals the answer, and self-grades; the SM-2-lite scheduler (scheduler.ts)
// decides when each card returns. Progress persists to localStorage per `deckId`,
// so a returning learner resumes their schedule. No external dependencies.
import { useMemo, useState } from "react";
import { type CardState, type Grade, freshCard, review, dueCards } from "./scheduler";

export interface Flashcard {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
}

interface Tracked {
  card: Flashcard;
  state: CardState;
}

const GRADES: { grade: Grade; label: string; tone: string }[] = [
  { grade: "again", label: "Again", tone: "bg-red-500/15 text-red-600 hover:bg-red-500/25" },
  { grade: "hard", label: "Hard", tone: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25" },
  { grade: "good", label: "Good", tone: "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" },
  { grade: "easy", label: "Easy", tone: "bg-sky-500/15 text-sky-600 hover:bg-sky-500/25" },
];

function load(deckId: string): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(`faraday.srs.${deckId}`) ?? "{}");
  } catch {
    return {};
  }
}
function save(deckId: string, states: Record<string, CardState>) {
  try {
    localStorage.setItem(`faraday.srs.${deckId}`, JSON.stringify(states));
  } catch {
    /* storage unavailable (private mode) — session-only is fine */
  }
}

/**
 * @param deckId  stable id — the localStorage key for this deck's schedule.
 * @param cards   the flashcards.
 * @param dayMs   ms mapped to one SM-2 "day" (default real day; shrink for a demo).
 * @param now     injectable clock (tests/demos); defaults to Date.now().
 */
export function Flashcards({
  deckId,
  cards,
  dayMs,
  now: nowFn = () => Date.now(),
}: {
  deckId: string;
  cards: Flashcard[];
  dayMs?: number;
  now?: () => number;
}) {
  const [states, setStates] = useState<Record<string, CardState>>(() => {
    const saved = load(deckId);
    const start = nowFn();
    return Object.fromEntries(cards.map((c) => [c.id, saved[c.id] ?? freshCard(start)]));
  });
  const [revealed, setRevealed] = useState(false);

  const tracked: Tracked[] = useMemo(
    () => cards.map((card) => ({ card, state: states[card.id] })),
    [cards, states],
  );
  const queue = dueCards(tracked, nowFn());
  const current = queue[0];

  function grade(g: Grade) {
    if (!current) return;
    const next = review(current.state, g, nowFn(), dayMs);
    const updated = { ...states, [current.card.id]: next };
    setStates(updated);
    save(deckId, updated);
    setRevealed(false);
  }

  const total = cards.length;
  const learned = tracked.filter((t) => t.state.reps >= 2).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>Due: {queue.length}</span>
        <span>
          Learned: {learned}/{total}
        </span>
      </div>

      {current ? (
        <div className="rounded-lg bg-background p-6 text-center">
          <div className="text-lg font-medium">{current.card.front}</div>
          {revealed ? (
            <>
              <hr className="my-4 border-border" />
              <div className="text-lg text-muted-foreground">{current.card.back}</div>
              <div className="mt-5 flex justify-center gap-2">
                {GRADES.map(({ grade: g, label, tone }) => (
                  <button
                    key={g}
                    onClick={() => grade(g)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${tone}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Reveal
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-background p-8 text-center text-muted-foreground">
          🎉 Nothing due right now — come back later.
        </div>
      )}
    </div>
  );
}
