// Example — a 3D open-world CURRICULUM. Same curriculum content as the 2D map
// example, but rendered with world3dPack (needs --3d). Nodes are places in space;
// click one to enter its lesson, hover to focus. Swap the pack (linear/map2d/
// world3d) without touching content — that's the ports-and-adapters seam.
import { CurriculumHost, type Curriculum } from "@/faraday/world";
import { world3dPack } from "@/faraday/three";
import { Lesson, Prose, Quiz } from "@/faraday/blocks";

function Stop({ title, body }: { title: string; body: string }) {
  return (
    <Lesson topic="World course" title={title} lead={body}>
      <Prose>
        <p>{body}</p>
        <p>
          Press <strong>Finish</strong> (top-right) to complete this stop and unlock the next place
          in the world.
        </p>
      </Prose>
      <Quiz
        question="Quick check — ready to move on?"
        options={[
          { label: "Yes, got it", correct: true, hint: "Great — hit Finish." },
          { label: "Not yet", hint: "Re-read above, then Finish." },
        ]}
      />
    </Lesson>
  );
}

// Module-level (stable identity). meta.{x,y} (0..100) place nodes on the 3D ground.
const curriculum: Curriculum = {
  title: "A 3D world course",
  nodes: [
    { id: "intro", title: "Landing", summary: "Begin here", meta: { x: 12, y: 50 }, reward: { xp: 10 },
      lesson: <Stop title="Landing" body="You arrive at the first place in the world." /> },
    // Every node carries a summary + reward — the immersive HUD's briefing
    // panel shows them when the node is focused (a bare title reads empty).
    { id: "a", title: "North Vale", summary: "One of two regions — explore in any order.", requires: ["intro"], meta: { x: 40, y: 22 }, reward: { xp: 10 },
      lesson: <Stop title="North Vale" body="One of two regions. Explore this and South Reef in any order." /> },
    { id: "b", title: "South Reef", summary: "The other region — the crossing needs both.", requires: ["intro"], meta: { x: 40, y: 78 }, reward: { xp: 10 },
      lesson: <Stop title="South Reef" body="The other region. The crossing needs both regions cleared." /> },
    { id: "mid", title: "The Crossing", summary: "A join node — unlocks after both regions.", requires: ["a", "b"], meta: { x: 66, y: 50 }, reward: { xp: 20 },
      lesson: <Stop title="The Crossing" body="Unlocks only after both regions — a join node." /> },
    { id: "final", title: "Summit", summary: "The finale — complete it to clear the world.", requires: ["mid"], meta: { x: 90, y: 50 }, reward: { xp: 30 },
      lesson: <Stop title="Summit" body="The finale. Finish to complete the whole world." /> },
  ],
};

export default function World3dCourse() {
  return (
    <CurriculumHost
      curriculum={curriculum}
      pack={world3dPack}
      onEvent={(e) => console.debug("[curriculum]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
