// Storybook + game2d example — reference only (copied to docs/examples/).
// CRA: concrete drag mission → picture → symbol quiz. Former `kids` example,
// now on StorybookGame.
import { useCallback, useState } from "react";
import {
  Lesson,
  Prose,
  Challenge,
  SketchPad,
  Quiz,
} from "@faraday-academy/kit/blocks";
import { StorybookGame } from "../../src/lesson/storybook-game2d";

function OrchardStage() {
  const draw = useCallback((g: {
    clear: () => void;
    setFillStyle: (s: { color: number }) => void;
    circle: (x: number, y: number, r: number) => void;
    fill: () => void;
  }) => {
    g.clear();
    g.setFillStyle({ color: 0xf56565 });
    g.circle(0, 0, 28);
    g.fill();
  }, []);
  return (
    <pixiContainer x={160} y={140}>
      <pixiGraphics draw={draw} />
      <pixiText
        text="🍎"
        anchor={0.5}
        y={60}
        style={{ fontSize: 32 }}
      />
    </pixiContainer>
  );
}

export default function CountingByTensStory() {
  const [page, setPage] = useState(0);

  return (
    <Lesson title="Counting by tens">
      <Prose>
        <p>A storybook shell over <code>game2d</code> — one idea per page, big targets.</p>
      </Prose>
      <StorybookGame
        pageIndex={page}
        onPageIndexChange={setPage}
        pages={[
          {
            id: "concrete",
            title: "Grab ten",
            narration: <p>Drag ten apples into the basket.</p>,
            stage: <OrchardStage />,
            chrome: <Challenge prompt="Drag 10 apples into the basket" />,
          },
          {
            id: "picture",
            title: "Ten in a row",
            narration: <p>Ten apples make one full row. Two rows is…?</p>,
            stage: <OrchardStage />,
            chrome: <SketchPad prompt="Draw 2 rows of ten" />,
          },
          {
            id: "symbol",
            title: "Now the number",
            narration: <p>The symbol appears last, next to the picture.</p>,
            stage: <OrchardStage />,
            chrome: (
              <Quiz
                prompt="Two rows of ten is…"
                options={["10", "20", "100"]}
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
