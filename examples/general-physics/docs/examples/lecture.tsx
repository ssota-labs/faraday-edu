// Example lecture with slide + textbook views — reference only, copied to docs/examples/.
import { Lecture, SlideDeck, Prose, Quiz } from "@faraday-academy/kit/blocks";
import { TextbookView } from "./textbook-view";

export default function NewtonSecondLawLecture() {
  return (
    <Lecture
      title="Newton's second law"
      lead="Same lecture — slide view for class, textbook view for self-study."
      views={[
        {
          id: "slide",
          label: "Slides",
          content: (
            <SlideDeck
              slides={[
                {
                  id: "claim",
                  title: "The claim",
                  content: <Prose><p>Acceleration follows net force: <strong>F = ma</strong>.</p></Prose>,
                },
                {
                  id: "check",
                  title: "Quick check",
                  content: (
                    <Quiz
                      prompt="Net force on a 2 kg object accelerating at 3 m/s²?"
                      options={["3 N", "6 N", "9 N"]}
                      answer={1}
                    />
                  ),
                },
              ]}
            />
          ),
        },
        {
          id: "textbook",
          label: "Textbook",
          content: (
            <TextbookView
              notesKey="newton-2nd-law-demo"
              pages={[
                {
                  id: "claim",
                  title: "The claim",
                  content: (
                    <Prose>
                      <p>
                        Newton's second law links the <em>net</em> force on an object to the
                        acceleration it actually undergoes. In one dimension: F = ma.
                      </p>
                    </Prose>
                  ),
                },
                {
                  id: "worked",
                  title: "Worked example",
                  content: (
                    <Prose>
                      <p>A 2 kg cart accelerates at 3 m/s². Then F = (2 kg)(3 m/s²) = 6 N.</p>
                    </Prose>
                  ),
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
