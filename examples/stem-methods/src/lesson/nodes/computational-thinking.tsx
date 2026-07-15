import {
  Prose,
  Quiz,
  Compare,
  Chart,
  CodeCell,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

const linearData = Array.from({ length: 10 }, (_, i) => ({
  n: i + 1,
  linear: i + 1,
  quadratic: (i + 1) * (i + 1),
}));

export default function ComputationalThinking() {
  return (
    <MethodShell
      method="Computational Thinking"
      discipline="Computing"
      topic="Algorithms"
      title="Find the maximum value in an array"
      lead="Computational Thinking gives us four lenses for tackling any problem: decomposition, abstraction, pattern recognition, and algorithm design. Here we apply all four to a classic task — finding the largest number in a list."
      phases={["Decompose", "Abstract", "Pattern", "Algorithm", "Evaluate"]}
      families={["prose", "quiz", "compare", "chart", "code"]}
    >
      <Prose heading="Decompose — break the problem down">
        <p>
          Before writing a single line of code, name every sub-task the solution
          must perform. Drag the steps below into the order a correct solution
          would execute them.
        </p>
      </Prose>

      <Quiz
        question="Which ordering of sub-tasks correctly solves 'find the max'?"
        options={[
          {
            label: "Start with a guess → scan each element → update if larger → report",
            correct: true,
            hint: "Exactly right — seed a current-best, then refine it one element at a time.",
          },
          {
            label: "Sort the array → return the last element",
            hint: "Sorting works but costs O(n log n) — decomposing into a single scan is cheaper.",
          },
          {
            label: "Check every pair → keep the winner of each pair",
            hint: "That describes a tournament approach; it needs more bookkeeping and doesn't decompose into a simple loop.",
          },
          {
            label: "Return the element at index 0 — it is probably biggest",
            hint: "Guessing without scanning gives no guarantee.",
          },
        ]}
      />

      <Prose heading="Abstract — choose what matters">
        <p>
          Two classic algorithms both find the max. Study them side by side and
          notice what details each one hides (abstracts away) and what it
          exposes.
        </p>
      </Prose>

      <Compare
        defaultValue="linear"
        items={[
          {
            value: "linear",
            label: "Linear scan",
            content: (
              <CodeCell
                label="Linear scan — O(n)"
                code={`function findMax(arr) {
  let best = arr[0];
  for (const x of arr) {
    if (x > best) best = x;
  }
  return best;
}

console.log(findMax([3, 7, 2, 9, 4])); // → 9`}
                caption="Single pass, constant extra memory. Change the array and re-run."
              />
            ),
          },
          {
            value: "divide",
            label: "Divide & conquer",
            content: (
              <CodeCell
                label="Divide & conquer — O(n)"
                code={`function findMax(arr, lo = 0, hi = arr.length - 1) {
  if (lo === hi) return arr[lo];
  const mid = (lo + hi) >> 1;
  return Math.max(findMax(arr, lo, mid), findMax(arr, mid + 1, hi));
}

console.log(findMax([3, 7, 2, 9, 4])); // → 9`}
                caption="Splits the problem in half recursively — same result, more call-stack depth."
              />
            ),
          },
        ]}
      />

      <Prose heading="Pattern — comparisons grow with input size">
        <p>
          Both algorithms make roughly <strong>n</strong> comparisons — linear
          growth. Compare that to a naïve nested-loop approach which would grow
          as n². The chart plots comparisons for each strategy:
        </p>
      </Prose>

      <Chart
        type="line"
        data={linearData}
        x="n"
        yAxis
        xType="number"
        series={[
          { key: "linear", label: "O(n) — linear scan" },
          { key: "quadratic", label: "O(n²) — naïve all-pairs" },
        ]}
        legend
      />

      <Prose heading="Algorithm — code the linear scan">
        <p>
          Run the cell below, then try these modifications to deepen your
          understanding: change the array, add negative numbers, or try a
          single-element list.
        </p>
      </Prose>

      <CodeCell
        label="Find max — linear scan"
        code={`function findMax(arr) {
  if (arr.length === 0) return null; // guard: empty array
  let best = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > best) best = arr[i];
  }
  return best;
}

console.log(findMax([3, 7, 2, 9, 4]));   // → 9
console.log(findMax([-5, -1, -3]));       // → -1
console.log(findMax([42]));               // → 42`}
        caption="Try findMax([]) — what does the guard return? Is that the right answer?"
      />

      <Prose heading="Evaluate — test the edge cases">
        <p>
          An algorithm is only as good as its behaviour on inputs that break
          assumptions. The most common edge case for 'find max' is an{" "}
          <strong>empty array</strong>.
        </p>
      </Prose>

      <Quiz
        question="What should findMax([]) return when the array is empty?"
        options={[
          {
            label: "null or undefined — signal that no maximum exists",
            correct: true,
            hint: "Correct — there is no maximum of an empty set; returning a sentinel makes the contract explicit.",
          },
          {
            label: "0 — a safe numeric default",
            hint: "Zero is a real value; returning it silently hides the empty-input bug.",
          },
          {
            label: "−Infinity — the identity element for max",
            hint: "−Infinity is mathematically correct for reducing over an empty set, but it can mask missing-data bugs in practice; null is safer for user-facing code.",
          },
          {
            label: "Throw an error immediately",
            hint: "Throwing is one valid choice, but returning null is more composable — callers can decide how to handle it.",
          },
        ]}
      />
    </MethodShell>
  );
}
