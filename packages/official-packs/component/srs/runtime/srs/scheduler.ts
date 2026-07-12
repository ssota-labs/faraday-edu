// SM-2-lite spaced-repetition scheduler. Author-editable — installed into the
// lesson by `faraday pack add srs`. Given a card's current state and the
// learner's grade, returns the next state. Intervals are in days; the caller
// decides how to map days to real time (a lesson may compress a "day" to seconds
// for a demo). No dependencies.

export type Grade = "again" | "hard" | "good" | "easy";

export interface CardState {
  /** repetition count of consecutive correct recalls */
  reps: number;
  /** ease factor (SM-2), starts at 2.5, floor 1.3 */
  ease: number;
  /** current interval in days */
  interval: number;
  /** epoch ms when the card is next due */
  due: number;
}

export function freshCard(now: number): CardState {
  return { reps: 0, ease: 2.5, interval: 0, due: now };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Advance a card by one review at `now` with the given `grade`. */
export function review(card: CardState, grade: Grade, now: number, dayMs: number = DAY_MS): CardState {
  let { reps, ease, interval } = card;

  if (grade === "again") {
    // lapse: reset the streak, drop ease, see it again soon (10 min).
    reps = 0;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
    return { reps, ease, interval, due: now + Math.round(dayMs / 144) };
  }

  // successful recall
  const easeDelta = grade === "hard" ? -0.15 : grade === "easy" ? 0.15 : 0;
  ease = Math.max(1.3, ease + easeDelta);

  if (reps === 0) interval = grade === "easy" ? 4 : 1;
  else if (reps === 1) interval = grade === "hard" ? 3 : 6;
  else interval = Math.round(interval * ease * (grade === "hard" ? 0.8 : 1));

  reps += 1;
  return { reps, ease, interval, due: now + interval * dayMs };
}

/** Cards whose `due` is at or before `now`, soonest first. */
export function dueCards<T extends { state: CardState }>(cards: T[], now: number): T[] {
  return cards.filter((c) => c.state.due <= now).sort((a, b) => a.state.due - b.state.due);
}
