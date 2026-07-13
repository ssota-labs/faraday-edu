# Authoring storybook pages

```tsx
import { useState } from "react";
import { Lesson } from "@faraday-academy/runtime/blocks";
import { StorybookGame } from "../../src/lesson/storybook-game2d";

export default function ApplesStory() {
  const [page, setPage] = useState(0);
  return (
    <Lesson title="Ten apples">
      <StorybookGame
        pageIndex={page}
        onPageIndexChange={setPage}
        successSound="/assets/game2d/audio/success.ogg"
        pages={[
          {
            id: "meet",
            title: "Meet the orchard",
            narration: <p>Tap the glowing apple.</p>,
            stage: (/* pixi scene */ null),
          },
          {
            id: "count",
            title: "Make ten",
            narration: <p>Drag apples into the basket until you have ten.</p>,
            stage: (/* physics or drag scene */ null),
          },
        ]}
      />
    </Lesson>
  );
}
```

- Keep `stage` Pixi-only; put SketchPad / big DOM buttons in `chrome`.
- Advance pages after a mission clears (call `onPageIndexChange` + `celebrate()`).
- Grey-box Graphics first; Kenney sprites after the loop works (see `game2d`
  pack skill `assets.md`).
