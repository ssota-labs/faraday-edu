// Example memorization lesson using the `srs` pack. Reference only — copied to
// docs/examples/ by `faraday pack add srs`. Import path assumes the pack installed
// its component at src/lesson/srs/.
import { Lesson, Prose } from "@faraday-academy/kit/blocks";
import { Flashcards } from "./srs/Flashcards";

export default function KanjiN5Lesson() {
  return (
    <Lesson title="Kanji: JLPT N5 starter set">
      <Prose>
        <p>
          These are recall items, so we drill them with spaced repetition. Try to
          say the reading <em>before</em> you reveal — the effort is what makes it
          stick. Grade yourself honestly.
        </p>
      </Prose>

      <Flashcards
        deckId="kanji-n5-starter"
        cards={[
          { id: "water", front: <span className="text-5xl">水</span>, back: "water — mizu" },
          { id: "fire", front: <span className="text-5xl">火</span>, back: "fire — hi" },
          { id: "tree", front: <span className="text-5xl">木</span>, back: "tree — ki" },
          { id: "mountain", front: <span className="text-5xl">山</span>, back: "mountain — yama" },
          { id: "river", front: <span className="text-5xl">川</span>, back: "river — kawa" },
        ]}
      />
    </Lesson>
  );
}
