// Reference playground for the `game2d` pack — copied to docs/examples/.
// Graphics-only (no external sprites) so it runs before Kenney assets land in public/.
// After install, import from the copied module: `../../src/lesson/game2d`.
import { useCallback } from "react";
import { Lesson, Prose, Workbench } from "@faraday-academy/runtime/blocks";
import { Game2D, PhysicsWorld, PhysicsBody } from "../../src/lesson/game2d";

function Ground() {
  const draw = useCallback((g: { clear: () => void; setFillStyle: (s: { color: number }) => void; rect: (x: number, y: number, w: number, h: number) => void; fill: () => void }) => {
    g.clear();
    g.setFillStyle({ color: 0x4a5568 });
    g.rect(-180, -12, 360, 24);
    g.fill();
  }, []);

  return (
    <PhysicsBody
      x={200}
      y={240}
      createBody={({ Bodies }) => Bodies.rectangle(200, 240, 360, 24, { isStatic: true })}
    >
      <pixiGraphics draw={draw} />
    </PhysicsBody>
  );
}

function Ball() {
  const draw = useCallback((g: { clear: () => void; setFillStyle: (s: { color: number }) => void; circle: (x: number, y: number, r: number) => void; fill: () => void }) => {
    g.clear();
    g.setFillStyle({ color: 0xf6ad55 });
    g.circle(0, 0, 18);
    g.fill();
  }, []);

  return (
    <PhysicsBody
      x={200}
      y={40}
      createBody={({ Bodies }) => Bodies.circle(200, 40, 18, { restitution: 0.7 })}
    >
      <pixiGraphics draw={draw} />
    </PhysicsBody>
  );
}

export default function Game2DPlayground() {
  return (
    <Lesson title="game2d playground">
      <Prose>
        <p>
          A Matter.js ball on a static floor inside <code>&lt;Game2D&gt;</code>. Install
          sprites with <code>node scripts/game2d-assets.mjs starter</code> when you leave
          the grey-box phase (see <code>.faraday/packs/game2d/assetvault.md</code>).
        </p>
      </Prose>
      <Workbench>
        <div style={{ height: 320 }}>
          <Game2D background={0x0f172a}>
            <PhysicsWorld gravityY={1}>
              <Ground />
              <Ball />
            </PhysicsWorld>
          </Game2D>
        </div>
      </Workbench>
    </Lesson>
  );
}
