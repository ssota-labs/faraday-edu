// Example — a CURRICULUM: several lessons bundled into a navigable map with unlock
// progression. `map2dPack` is one PRESENTATION of the course (a 2D game-screen
// map); swap `pack={map2dPack}` for `pack={linearPack}` (a document-style list) to
// change the whole presentation without touching the content — the ports-and-adapters
// seam. ("world" is just the immersive family of presentations, not the course.)
//
// This demo inlines every node's lesson in one file so it's copy-paste runnable. For
// a REAL curriculum, put each node's lesson in its own file so lessons stay isolated
// and can be built independently (e.g. one sub-agent per node — see the faraday skill's
// references/orchestration.md). Keep only the `curriculum` object here:
//
//     src/lesson/
//       lesson.tsx          // this file: the module-scope `curriculum` assembly
//       nodes/
//         intro.tsx         // export default function Intro() { ... one lesson ... }
//         path-a.tsx
//
//     // in lesson.tsx:
//     import Intro from "./nodes/intro";
//     const course: Course = { title, nodes: [{ id: "intro", …, lesson: <Intro /> }] };
//
// Only the `curriculum` OBJECT must live at module scope (progress is keyed on its
// identity); the node components can be imported from anywhere. See examples/voyage-log
// for the split in practice.
import { CourseHost, useNode, type Course } from "@faraday-academy/kit/world";
import { map2dPack } from "./map2d"; // first: faraday pack add map2d
import { Lesson, Prose, Quiz } from "@faraday-academy/kit/blocks";

// A lesson rendered inside <CourseHost> can self-complete: pull `complete`
// from useNode() and fire it when the reader passes the quiz — that marks this
// node done and unlocks whatever `requires` it. (The Finish button in the frame
// stays as a manual fallback; `complete()` is idempotent.)
function Stop({ title, body }: { title: string; body: string }) {
  const { complete } = useNode();
  return (
    <Lesson topic="Map course" title={title} lead={body}>
      <Prose>
        <p>{body}</p>
        <p>Answer the check correctly to complete this stop and unlock what's next
          — or press <strong>Finish</strong> (top-right) any time.</p>
      </Prose>
      <Quiz
        question="Quick check — ready to move on?"
        onCorrect={complete}
        options={[
          { label: "Yes, got it", correct: true, hint: "Great — this stop is complete." },
          { label: "Not yet", hint: "Re-read above, then try again." },
        ]}
      />
    </Lesson>
  );
}

// Module-level (stable identity — required by the progress store).
const course: Course = {
  title: "A tiny map course",
  nodes: [
    { id: "intro", title: "Start", summary: "Begin here", meta: { x: 12, y: 50 }, reward: { xp: 10 },
      lesson: <Stop title="Start" body="Every journey starts somewhere. This is the first stop." /> },
    // Every node carries a summary + reward — the immersive HUD's briefing
    // panel shows them when the node is focused (a bare title reads empty).
    { id: "a", title: "Path A", summary: "One of two branches — any order.", requires: ["intro"], meta: { x: 38, y: 26 }, reward: { xp: 10 },
      lesson: <Stop title="Path A" body="One of two branches. Do this and Path B in any order." /> },
    { id: "b", title: "Path B", summary: "The other branch — the join needs both.", requires: ["intro"], meta: { x: 38, y: 74 }, reward: { xp: 10 },
      lesson: <Stop title="Path B" body="The other branch. The next stop needs both A and B." /> },
    { id: "mid", title: "Crossroads", summary: "A join node — unlocks after A and B.", requires: ["a", "b"], meta: { x: 64, y: 50 }, reward: { xp: 20 },
      lesson: <Stop title="Crossroads" body="Unlocked only after both paths — this is a join node." /> },
    { id: "final", title: "Summit", summary: "The finale — clear it to finish.", requires: ["mid"], meta: { x: 88, y: 50 }, reward: { xp: 30 },
      lesson: <Stop title="Summit" body="The finale. Pass this to complete the whole course." /> },
  ],
};

export default function MapCourse() {
  return (
    <CourseHost
      course={curriculum}
      pack={map2dPack}
      // LMS / Tutor AI subscribe here. v0: log the event stream.
      onEvent={(e) => console.debug("[curriculum]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
