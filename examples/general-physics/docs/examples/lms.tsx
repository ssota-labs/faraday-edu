// Example — LMS v0: a curriculum wired to the progress recorder, with a teacher
// dashboard (roster + this learner's analytics). The recorder subscribes to the
// SAME core event stream (onEvent). Copy into src/lesson/lesson.tsx to try it.
import { CurriculumHost, type Curriculum } from "@faraday-academy/runtime/world";
import { map2dPack } from "./map2d"; // first: faraday pack add map2d
import { useLmsRecorder, ProgressDashboard, summarize, type Learner } from "@faraday-academy/runtime/lms";
import { Compare, Lesson, Prose, Quiz } from "@faraday-academy/runtime/blocks";

function Stop({ title, body }: { title: string; body: string }) {
  return (
    <Lesson topic="LMS demo" title={title} lead={body}>
      <Prose><p>{body}</p><p>Press <strong>Finish</strong> to record completion, then check the Teacher view tab.</p></Prose>
      <Quiz question="Ready?" options={[{ label: "Yes", correct: true }, { label: "Not yet" }]} />
    </Lesson>
  );
}

const curriculum: Curriculum = {
  title: "A tracked course",
  nodes: [
    { id: "a", title: "Lesson 1", meta: { x: 18, y: 50 }, reward: { xp: 10 }, lesson: <Stop title="Lesson 1" body="The first tracked lesson." /> },
    { id: "b", title: "Lesson 2", requires: ["a"], meta: { x: 50, y: 50 }, reward: { xp: 10 }, lesson: <Stop title="Lesson 2" body="Unlocks after Lesson 1." /> },
    { id: "c", title: "Lesson 3", requires: ["b"], meta: { x: 82, y: 50 }, reward: { xp: 20 }, lesson: <Stop title="Lesson 3" body="The finale." /> },
  ],
};

// A real roster is aggregated at the platform tier; here we seed two mock classmates
// alongside the live "You" record so the roster UI is tangible.
const now = Date.now();
const mockLearners: Learner[] = [
  { id: "m1", name: "Ada", summary: { events: 6, xp: 40, done: 3, startedAt: now - 9e5, lastActiveAt: now - 3e5, activeMs: 5.2e5, perNode: {} } },
  { id: "m2", name: "Grace", summary: { events: 3, xp: 20, done: 1, startedAt: now - 6e5, lastActiveAt: now - 12e4, activeMs: 1.8e5, perNode: {} } },
];

export default function LmsCourse() {
  const rec = useLmsRecorder("lms-demo");
  // summarize() (exported from @faraday-academy/runtime/lms) derives the whole LmsSummary — no
  // need to hand-build it.
  const you: Learner = { id: "you", name: "You", summary: summarize(rec.events) };
  return (
    <Compare
      items={[
        { value: "learn", label: "Learn", content: <CurriculumHost curriculum={curriculum} pack={map2dPack} onEvent={rec.onEvent} /> },
        { value: "teacher", label: "Teacher view", content: <ProgressDashboard courseId="lms-demo" curriculum={curriculum} events={rec.events} learners={[you, ...mockLearners]} /> },
      ]}
    />
  );
}
