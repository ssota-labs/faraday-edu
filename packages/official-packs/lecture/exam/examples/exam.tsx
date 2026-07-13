// Example mock exam using the `exam` pack — reference only, copied to docs/examples/.
// It composes the runtime's existing assessment blocks into a blueprint-driven test:
// one item per screen (`<Paged>`), sections by outcome, review revealed on submit.
import { Lesson, Paged, Quiz, NumericAnswer, Challenge, Reveal, Prose } from "@faraday-academy/runtime/blocks";

// Blueprint: read (20%, 1) · convert (40%, 2) · debug (40%, 1) — abbreviated for the demo.
export default function BinaryMockExam() {
  return (
    <Lesson title="Binary numbers — mock exam">
      <Paged
        pages={[
          {
            id: "intro",
            title: "Before you start",
            content: (
              <Prose>
                <p>
                  10 minutes, 4 items across three outcomes. You can review every
                  answer at the end — that review is the point. Good luck.
                </p>
              </Prose>
            ),
          },
          {
            id: "read-1",
            title: "Read",
            content: (
              <Quiz
                prompt="What is 1011₂ in decimal?"
                options={["9", "11", "13", "1011"]}
                answer={1}
                // distractors are misconceptions: 9 = dropped a bit, 13 = bit-value slip, 1011 = read as decimal
                hint="Each place is a power of two: 8 + 0 + 2 + 1."
              />
            ),
          },
          {
            id: "convert-1",
            title: "Convert",
            content: (
              <NumericAnswer
                prompt="Convert 42 to binary. Enter the value (base-2 digits)."
                answer={101010}
                tolerance={0}
                hint="Repeated division by two, or 32 + 8 + 2."
              />
            ),
          },
          {
            id: "convert-2",
            title: "Convert",
            content: (
              <NumericAnswer
                prompt="How many bits to represent decimal 200 unsigned?"
                answer={8}
                tolerance={0}
                hint="Smallest n with 2ⁿ > 200."
              />
            ),
          },
          {
            id: "debug-1",
            title: "Debug",
            content: (
              <Challenge
                prompt="Fix the off-by-one so the loop prints all 8 bits, MSB first."
                // a real lesson wires this to an interactive; abbreviated here
              />
            ),
          },
          {
            id: "review",
            title: "Review",
            content: (
              <Reveal label="Submit & review">
                <Prose>
                  <p>
                    <strong>By outcome:</strong> Read 1/1 ✓ · Convert 2/2 ✓ · Debug
                    0/1 — revisit the off-by-one lesson. Pass = ≥80% with no outcome
                    below 50%. Retry the missed outcome when ready.
                  </p>
                </Prose>
              </Reveal>
            ),
          },
        ]}
      />
    </Lesson>
  );
}
