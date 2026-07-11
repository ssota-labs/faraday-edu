// Example — a lesson with a grounded, durable AI tutor docked beside the content.
// Copy into src/lesson/lesson.tsx to try it. Requires AI_GATEWAY_API_KEY in
// .env.local (see env.example) and `pnpm dev` (Nitro serves /api/chat).
//
// The tutor is Socratic and grounded: it answers from `context` and won't hand
// over the quiz answer. Because the run is durable, refreshing mid-answer resumes
// the same stream. Its replies render as Markdown + KaTeX math.
//
// Placement: wrap the WHOLE lesson in <TutorDock> — it hoists the tutor to a
// resizable, collapsible right-side panel (a right-edge tab opens it; a drawer on
// mobile), the same dockable model across every lesson layout. Do NOT drop <Tutor>
// inline in the content flow.
import { Lesson, Prose, Quiz } from "@faraday-academy/runtime/blocks";
import { TutorDock } from "@faraday-academy/tutor";

const LESSON_TEXT = `
Binary search finds a target in a *sorted* array by repeatedly halving the search
range. Compare the target to the middle element: if equal, done; if smaller, keep
the left half; if larger, keep the right half. Each step throws away half the
remaining elements, so it runs in $O(\\log n)$ time — 20 steps suffice for a million
items. It only works on sorted data; on unsorted input you must sort first (or use
linear search).
`.trim();

export default function TutoredLesson() {
  return (
    <TutorDock
      title="Binary-search tutor"
      context={LESSON_TEXT}
      greeting="Hi! I'm your tutor for binary search. Ask me anything — I'll nudge you toward the answer rather than spoiling it."
    >
      <Lesson
        topic="Algorithms"
        title="Binary search — with a tutor"
        lead="Read the idea, then open the tutor (right edge) and ask it anything. It's grounded in this lesson and won't just give you the quiz answer."
      >
        <Prose>
          <p>{LESSON_TEXT}</p>
          <p>
            Stuck on <em>why</em> it needs sorted input? Open the tutor and ask it to walk you
            through a counter-example rather than telling you outright.
          </p>
        </Prose>
        <Quiz
          question="What is the time complexity of binary search?"
          options={[
            { label: "O(n)" },
            { label: "O(log n)", correct: true },
            { label: "O(n log n)" },
            { label: "O(1)" },
          ]}
        />
      </Lesson>
    </TutorDock>
  );
}
