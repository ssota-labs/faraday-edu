// Example tablet lesson for young learners using the `kids` pack — reference only,
// copied to docs/examples/. CRA order (concrete → picture → symbol), one idea per
// screen, big targets, a draw-to-answer check. Composes existing blocks, no deps.
import { Lesson, Paged, Prose, Workbench, Challenge, SketchPad, Quiz } from "@faraday-academy/runtime/blocks";

export default function CountingByTens() {
  return (
    <Lesson title="Counting by tens 🖐️">
      <Paged
        pages={[
          {
            id: "concrete",
            title: "Grab ten",
            content: (
              // CONCRETE: drag real objects — the interactive IS the intro
              <Workbench>
                <Challenge prompt="Drag 10 apples into the basket 🍎" />
              </Workbench>
            ),
          },
          {
            id: "picture",
            title: "Ten in a row",
            content: (
              // REPRESENTATIONAL: the same ten, now as a picture
              <Prose>
                <p>Ten apples make one full row. Two rows is… let's see!</p>
              </Prose>
            ),
          },
          {
            id: "draw",
            title: "Draw two rows",
            content: (
              // do-not-define: answer by drawing, not typing
              <SketchPad prompt="Draw 2 rows of ten 🖊️" />
            ),
          },
          {
            id: "symbol",
            title: "Now the number",
            content: (
              // ABSTRACT: the symbol appears last, next to the picture it means
              <Quiz
                prompt="Two rows of ten is…"
                options={["🔟", "2️⃣0️⃣", "1️⃣0️⃣0️⃣"]}
                answer={1}
                hint="Count the rows: ten, twenty!"
              />
            ),
          },
        ]}
      />
    </Lesson>
  );
}
