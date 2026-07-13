// Example — a WALKABLE 3D RPG curriculum (needs --3d). Same curriculum content as
// the other world examples, but with world3dRpgPack: drive an avatar with WASD and
// walk into a place to enter its lesson. Proof that "swap to a more advanced pack"
// gives a real game feel with ZERO changes to the course core. Copy into
// src/lesson/lesson.tsx to try it.
import { CourseHost, type Course } from "@faraday-academy/runtime/world";
import { world3dRpgPack } from "@faraday-academy/three/physics";
import { Lesson, Prose, Quiz } from "@faraday-academy/runtime/blocks";

function Stop({ title, body }: { title: string; body: string }) {
  return (
    <Lesson topic="RPG world" title={title} lead={body}>
      <Prose>
        <p>{body}</p>
        <p>Press <strong>Finish</strong> to complete this place, then walk to the next.</p>
      </Prose>
      <Quiz
        question="Quick check — ready to move on?"
        options={[
          { label: "Yes, got it", correct: true, hint: "Great — hit Finish." },
          { label: "Not yet", hint: "Re-read, then Finish." },
        ]}
      />
    </Lesson>
  );
}

const course: Course = {
  title: "A 3D RPG course",
  nodes: [
    { id: "intro", title: "Landing", meta: { x: 15, y: 50 }, reward: { xp: 10 },
      lesson: <Stop title="Landing" body="Walk up to a glowing place to enter it." /> },
    { id: "a", title: "North Vale", requires: ["intro"], meta: { x: 42, y: 24 }, reward: { xp: 10 },
      lesson: <Stop title="North Vale" body="One of two regions — do this and South Reef in any order." /> },
    { id: "b", title: "South Reef", requires: ["intro"], meta: { x: 42, y: 76 }, reward: { xp: 10 },
      lesson: <Stop title="South Reef" body="The other region. The crossing needs both." /> },
    { id: "mid", title: "The Crossing", requires: ["a", "b"], meta: { x: 68, y: 50 }, reward: { xp: 20 },
      lesson: <Stop title="The Crossing" body="Opens only after both regions." /> },
    { id: "final", title: "Summit", requires: ["mid"], meta: { x: 90, y: 50 }, reward: { xp: 30 },
      lesson: <Stop title="Summit" body="The finale." /> },
  ],
};

export default function RpgCourse() {
  return (
    <CourseHost
      course={curriculum}
      pack={world3dRpgPack}
      onEvent={(e) => console.debug("[curriculum]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
