/* The immersive world (map2dPack) renders as a `fixed inset-0` full-screen game
   map with the HUD overlaid — it would escape a normal preview canvas. So it is
   mounted on its own via `?frame=world` (see main.tsx) and embedded in the labs
   preview through an <iframe>, which contains the fixed positioning. */
import { CurriculumHost, map2dPack, useNode, type Curriculum } from "@/faraday/world";
import { Lesson, Prose, Quiz } from "@/faraday/blocks";

function Stop({ title, body }: { title: string; body: string }) {
  const { complete } = useNode();
  return (
    <Lesson topic="Voyage" title={title} lead={body}>
      <Prose>
        <p>{body}</p>
        <p>
          Answer the check to complete this stop and unlock what's next — or press <strong>Finish</strong> (top-right).
        </p>
      </Prose>
      <Quiz
        question="Ready to move on?"
        onCorrect={complete}
        options={[
          { label: "Yes, got it", correct: true, hint: "This stop is complete." },
          { label: "Not yet", hint: "Re-read, then try again." },
        ]}
      />
    </Lesson>
  );
}

// Module-level (stable identity — required by the progress store).
const CURRICULUM: Curriculum = {
  title: "A voyage across the map",
  nodes: [
    { id: "intro", title: "Depart", summary: "Cast off — the journey begins.", meta: { x: 12, y: 50 }, reward: { xp: 10 }, lesson: <Stop title="Depart" body="Every voyage starts at the harbour." /> },
    { id: "a", title: "North route", summary: "One of two branches — any order.", requires: ["intro"], meta: { x: 40, y: 24 }, reward: { xp: 10 }, lesson: <Stop title="North route" body="Sail north. Do this and the south route in any order." /> },
    { id: "b", title: "South route", summary: "The other branch — the join needs both.", requires: ["intro"], meta: { x: 40, y: 76 }, reward: { xp: 10 }, lesson: <Stop title="South route" body="Sail south. The crossing ahead needs both routes." /> },
    { id: "mid", title: "The crossing", summary: "A join — unlocks after both routes.", requires: ["a", "b"], meta: { x: 66, y: 50 }, reward: { xp: 20 }, lesson: <Stop title="The crossing" body="Only reachable once both routes are done." /> },
    { id: "final", title: "Landfall", summary: "The finale — clear it to finish.", requires: ["mid"], meta: { x: 90, y: 50 }, reward: { xp: 30 }, lesson: <Stop title="Landfall" body="The final shore. Clear it to complete the voyage." /> },
  ],
};

export function WorldFrame() {
  return <CurriculumHost curriculum={CURRICULUM} pack={map2dPack} onEvent={() => {}} />;
}
