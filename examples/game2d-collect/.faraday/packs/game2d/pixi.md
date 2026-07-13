# PixiJS v8 + `@pixi/react` (Faraday)

## Stack

- **PixiJS ^8** — WebGL/WebGPU 2D renderer
- **`@pixi/react` ^8** — React 19 reconciler (`Application`, `extend`, `useTick`)
- Faraday lessons already pin **React 19** — do not downgrade to the old v7
  `<Stage>` API

## Core rules

1. Call `extendGame2D()` once (already done inside `<Game2D>`) before any `pixi*` JSX.
2. **React = structure** (which objects exist). **Pixi = frames** (where they are).
3. Animate with `useTick` + **refs / Matter bodies**. Never `setState` every frame.
4. Load textures with Pixi `Assets` / `Assets.load` — share textures across sprites.
5. Unmount cleans up: `<Application>` destroys the renderer; also `disposeAudioManager()`
   if you used audio.

## Minimal scene

```tsx
import { Game2D } from "./game2d";

export function Demo() {
  return (
    <div style={{ height: 320 }}>
      <Game2D background={0x0f172a}>
        <pixiContainer x={40} y={40}>
          <pixiText text="Hello" style={{ fill: 0xffffff, fontSize: 24 }} />
        </pixiContainer>
      </Game2D>
    </div>
  );
}
```

## `useTick` pattern

```tsx
import { useRef } from "react";
import { useTick } from "@pixi/react";
import type { Container } from "pixi.js";

function Spinner() {
  const ref = useRef<Container>(null);
  useTick((ticker) => {
    if (ref.current) ref.current.rotation += 0.05 * ticker.deltaTime;
  });
  return <pixiContainer ref={ref as never}>{/* … */}</pixiContainer>;
}
```

## Pointer / touch

Prefer Pixi event mode on sprites (`eventMode="static"`, `cursor="pointer"`) for
drag/tap inside the canvas. Keep Faraday `<Quiz>` / `<Challenge>` outside the
canvas for text-heavy checks.

## Official docs

- https://pixijs.com/8.x/guides
- https://react.pixijs.io/ (thin — prefer the GitHub README for `extend` / `useTick`)
- https://github.com/pixijs/pixi-react
