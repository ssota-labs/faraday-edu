# Physics (Matter.js)

`game2d` ships **Matter.js** for educational toys — pendulums, collisions, ramps —
not a full platformer engine.

## Mount order

```tsx
<Game2D>
  <PhysicsWorld gravityY={1}>   {/* 0 for top-down */}
    <PhysicsBody createBody={({ Bodies }) => Bodies.circle(0, 0, 16)}>
      <pixiGraphics draw={…} />
    </PhysicsBody>
  </PhysicsWorld>
</Game2D>
```

- `<PhysicsWorld>` must be **inside** `<Game2D>` (needs `useTick`).
- `createBody` runs **once** on mount. Reposition with `Body.setPosition` from
  `usePhysics()`, don't recreate every render.
- Static floors: `{ isStatic: true }`. Bouncy checks: `restitution`.

## When to use physics

Use it when the **feeling of force/collision is the idea** (momentum, balance,
conservation demos). If a scrubber + closed-form curve teaches better, skip Matter.

## Pause

`<PhysicsWorld running={false}>` stops stepping (e.g. while a slide quiz is open).
