// Example slideshow lesson using the `deck` pack — reference only, copied to
// docs/examples/. One idea per slide via <Paged>; canvas ⇄ prose split; a
// prediction slide before the reveal. Composes existing blocks, no new deps.
import { Lesson, Paged, Prose, Workbench, ParamSlider, Chart, Quiz, Stat } from "@faraday-academy/runtime/blocks";

export default function DoublingDeck() {
  return (
    <Lesson title="Exponential growth — a 6-slide deck">
      <Paged
        pages={[
          {
            id: "hook",
            title: "One fold, then another",
            content: (
              <Prose>
                <p>A sheet of paper folded 42 times would reach the moon. Really. Let's see why.</p>
              </Prose>
            ),
          },
          {
            id: "predict",
            title: "Predict first",
            content: (
              <Quiz
                prompt="Fold paper (0.1 mm) in half 42 times. About how thick?"
                options={["a few meters", "a few kilometers", "past the moon", "past the sun"]}
                answer={2}
                hint="Each fold doubles it — commit before you see the curve."
              />
            ),
          },
          {
            id: "manipulate",
            title: "Feel the doubling",
            content: (
              // landscape split: canvas leads, prose supports
              <div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">
                <Workbench>
                  <Chart /* balance = 0.1mm · 2^folds */ />
                  <ParamSlider label="Folds" min={0} max={42} defaultValue={10} />
                </Workbench>
                <Prose>
                  <p>Drag the folds. The line looks flat, then explodes — that's the whole point of exponential growth.</p>
                </Prose>
              </div>
            ),
          },
          {
            id: "reveal",
            title: "Past the moon",
            content: (
              <div className="grid h-full place-items-center">
                <Stat label="Thickness at 42 folds" value="≈ 440,000 km" />
              </div>
            ),
          },
          {
            id: "why",
            title: "Why it feels wrong",
            content: (
              <Prose>
                <p>Our intuition adds; doubling multiplies. That mismatch is why exponentials always surprise us.</p>
              </Prose>
            ),
          },
          {
            id: "check",
            title: "Takeaway",
            content: (
              <Quiz
                prompt="Which grows faster after enough steps?"
                options={["adding 1,000,000 each step", "doubling from 1"]}
                answer={1}
                hint="Multiplying always wins eventually."
              />
            ),
          },
        ]}
      />
    </Lesson>
  );
}
