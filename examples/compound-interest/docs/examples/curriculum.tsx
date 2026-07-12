// Example — a CURRICULUM (world seed): several lessons bundled into a navigable
// map with unlock progression. Copy into src/lesson/lesson.tsx to try it.
// Swap `pack={map2dPack}` for `pack={linearPack}` to change the whole world's
// shape without touching the content — that's the ports-and-adapters seam.
import { CurriculumHost, useNode, type Curriculum } from "@faraday-academy/runtime/world";
import { map2dPack } from "./map2d"; // first: faraday pack add map2d
import { Lesson, Prose, Quiz } from "@faraday-academy/runtime/blocks";

// A lesson rendered inside <CurriculumHost> can self-complete: pull `complete`
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
const curriculum: Curriculum = {
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
    <CurriculumHost
      curriculum={curriculum}
      pack={map2dPack}
      // LMS / Tutor AI subscribe here. v0: log the event stream.
      onEvent={(e) => console.debug("[curriculum]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
