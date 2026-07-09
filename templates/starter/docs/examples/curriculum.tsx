// Example — a CURRICULUM (world seed): several lessons bundled into a navigable
// map with unlock progression. Copy into src/lesson/lesson.tsx to try it.
// Swap `pack={map2dPack}` for `pack={linearPack}` to change the whole world's
// shape without touching the content — that's the ports-and-adapters seam.
import { CurriculumHost, map2dPack, type Curriculum } from "@/faraday/world";
import { Lesson, Prose, Quiz } from "@/faraday/blocks";

function Stop({ title, body }: { title: string; body: string }) {
  return (
    <Lesson topic="Map course" title={title} lead={body}>
      <Prose>
        <p>{body}</p>
        <p>Press <strong>Finish</strong> (top-right) when you're done to complete this stop and unlock what's next.</p>
      </Prose>
      <Quiz
        question="Quick check — ready to move on?"
        options={[
          { label: "Yes, got it", correct: true, hint: "Great — hit Finish." },
          { label: "Not yet", hint: "Re-read above, then Finish when ready." },
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
    { id: "a", title: "Path A", requires: ["intro"], meta: { x: 38, y: 26 }, reward: { xp: 10 },
      lesson: <Stop title="Path A" body="One of two branches. Do this and Path B in any order." /> },
    { id: "b", title: "Path B", requires: ["intro"], meta: { x: 38, y: 74 }, reward: { xp: 10 },
      lesson: <Stop title="Path B" body="The other branch. The next stop needs both A and B." /> },
    { id: "mid", title: "Crossroads", requires: ["a", "b"], meta: { x: 64, y: 50 }, reward: { xp: 20 },
      lesson: <Stop title="Crossroads" body="Unlocked only after both paths — this is a join node." /> },
    { id: "final", title: "Summit", requires: ["mid"], meta: { x: 88, y: 50 }, reward: { xp: 30 },
      lesson: <Stop title="Summit" body="The finale. Finish this to complete the whole course." /> },
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
