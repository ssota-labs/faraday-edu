import {
  Prose,
  Quiz,
  NumericAnswer,
  Reveal,
  TeX,
  Callout,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

// Train A: 40 mph, leaves 8:00 AM. Train B: 60 mph, leaves 9:00 AM same route.
// At 9:00 A is 40 mi ahead. Catch-up time after B departs: 40 / (60 − 40) = 2 h → 11:00 AM.
const CATCHUP_HOURS = 2;

export default function PolyaProblemSolving() {
  return (
    <MethodShell
      method="Polya problem solving"
      discipline="Math"
      topic="Word problems"
      title="When does the faster train catch up?"
      lead="Polya's four phases — understand, plan, carry out, look back — structure multi-step word problems without replacing the arithmetic you still must do."
      phases={["Understand", "Plan", "Carry out", "Look back"]}
      families={["narrative", "check", "formalism"]}
    >
      <Prose heading="Understand — restate the situation">
        <p>
          Train A leaves Station Central at <strong>8:00 AM</strong> traveling{" "}
          <strong>40 mph</strong> on a straight track. One hour later, Train B leaves the same
          station on the same track at <strong>60 mph</strong>, chasing Train A.
        </p>
        <p>
          Before calculating, answer in your own words: <em>What are we looking for?</em>{" "}
          <em>What is known?</em> At 9:00 AM, how far ahead is Train A?
        </p>
      </Prose>

      <Callout title="Givens sketch">
        <p className="text-sm">
          8:00 — A departs at 40 mph · 9:00 — B departs at 60 mph · same direction · catch-up time
          unknown
        </p>
      </Callout>

      <Prose heading="Plan — choose a strategy">
        <p>
          Common plans for catch-up problems: (1) equate distances from the station, (2) work from the
          head start at 9:00, or (3) guess-and-check on a table. Pick one before computing.
        </p>
      </Prose>

      <Quiz
        question="Which plan is most direct for 'when does B catch A'?"
        options={[
          {
            label: "At catch-up, distance from the station is the same for both trains — set 40t = 60(t − 1)",
            correct: true,
            hint: "Yes — t hours after 8:00, A has gone 40t miles; B has traveled for (t − 1) hours at 60 mph.",
          },
          {
            label: "Add the speeds: 40 + 60 = 100 mph combined speed",
            hint: "Adding speeds applies to objects moving toward each other, not same-direction chase.",
          },
          {
            label: "Subtract departure times and stop — the answer is 1 hour",
            hint: "One hour is only how long A ran before B started; B still has to close a 40-mile gap.",
          },
          {
            label: "Average the two speeds to get 50 mph",
            hint: "Averaging speeds has no meaning here — the trains move at constant, different rates.",
          },
        ]}
      />

      <Prose heading="Carry out — execute the plan">
        <p>
          From 8:00 to 9:00, Train A travels{" "}
          <TeX>{String.raw`40 \times 1 = 40`}</TeX> miles. After 9:00, B gains{" "}
          <TeX>{String.raw`60 - 40 = 20`}</TeX> miles per hour on A. How many hours after{" "}
          <strong>9:00 AM</strong> does B close that 40-mile gap?
        </p>
      </Prose>

      <NumericAnswer
        question="Hours after 9:00 AM when Train B catches Train A (one decimal place max — enter a whole number)."
        answer={CATCHUP_HOURS}
        tolerance={0.05}
        unit="hours"
        hint="Head start 40 mi ÷ closing speed 20 mph. Add that to 9:00 AM for the clock time."
      />

      <Prose heading="Look back — verify and generalize">
        <p>
          At catch-up, check both distances from the station: A ran for 3 hours (
          <TeX>{String.raw`40 \times 3 = 120`}</TeX> mi) and B ran for 2 hours (
          <TeX>{String.raw`60 \times 2 = 120`}</TeX> mi). Same distance — reasonable.
        </p>
      </Prose>

      <Reveal label="What if B left only 30 minutes after A?">
        <p>
          A 30-minute head start at 40 mph is 20 miles. Closing speed is still 20 mph, so catch-up
          takes 1 hour after B departs. <strong>Shorter head start → shorter chase.</strong> The
          structure <TeX>{String.raw`\text{gap} \div (\text{faster} - \text{slower})`}</TeX> survives
          even when the numbers change.
        </p>
      </Reveal>

      <Callout title="Polya in one sentence">
        Understand before you compute; plan before you execute; look back so the next problem is easier.
      </Callout>
    </MethodShell>
  );
}
