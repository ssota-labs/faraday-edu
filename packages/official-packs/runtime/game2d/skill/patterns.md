# Educational 2D patterns

## Grey box → assets

Ship the **loop** first (mission, feedback, check). Fancy sprites second.

## Mission, not arcade

One clear verb per stage: "balance the beam", "path the light", "sort the
charges". Endless score chases without a learning outcome fail the quality bar.

## Compose with Faraday blocks

```text
<Lesson>
  <Prose>…why this matters…</Prose>
  <Workbench>
    <Game2D>…interactive…</Game2D>
    <ControlGroup>…params…</ControlGroup>
  </Workbench>
  <Quiz / Challenge>…check that needed the interaction…</Quiz>
</Lesson>
```

## Audience shells

| Need | Pack |
|------|------|
| Page-turn story / young learners / CRA tablet | `storybook-game2d` (requires `game2d`) |
| Course map navigation (not Pixi) | `map2d` |
| 3D spatial | `three` |

## Feedback

Celebrate success visibly (burst, SFX via `AudioManager`, XP if using a course
shell). Failure should invite another try, not a dead end.
