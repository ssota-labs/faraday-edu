# Move 1 — Blueprint before items

An exam without a blueprint drifts to whatever is easy to write (usually recall).
Decide the **table of specifications** first: outcomes × cognitive level × weight →
item count.

- **List the outcomes** the exam certifies (reuse the course's outcome verbs).
- **Weight them** by importance/time-taught, not by how easy they are to test. The
  weights should sum to 100%.
- **Set the cognitive level** per outcome (remember / apply / analyze). Higher
  levels need `<NumericAnswer>`/`<Challenge>`, not MCQ.
- **Derive item counts** from weight × total length. A 20-item exam with a 25%-
  weighted outcome gets ~5 items on it.

Example table of specifications:

| Outcome | Level | Weight | Items | Form |
|---|---|---|---|---|
| Read a binary number | remember | 20% | 4 | `<Quiz>` |
| Convert dec↔bin | apply | 40% | 8 | `<NumericAnswer>` |
| Debug an off-by-one | analyze | 40% | 8 | `<Challenge>` |

→ **Faraday:** the blueprint rows become the exam's sections; each row's count +
form tells you exactly which blocks to place. Write the blueprint into the brief
so the creator can sign off before you generate items.
