# Bridging to `game2d`

`storybook-game2d` **requires** `game2d`. Inside a page `stage`, use the shared API:

```tsx
import { PhysicsWorld, PhysicsBody } from "../game2d";

const stage = (
  <PhysicsWorld gravityY={1}>
    <PhysicsBody createBody={({ Bodies }) => Bodies.circle(120, 40, 16)}>
      {/* pixiSprite or pixiGraphics */}
    </PhysicsBody>
  </PhysicsWorld>
);
```

- Don't nest another `<Game2D>` inside `stage` — `StorybookGame` already hosts one.
- Register SFX once via `successSound` or `getAudioManager().register(…)`.
- Read `.faraday/packs/game2d/SKILL.md` for Pixi / physics / assets detail.
