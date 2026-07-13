import { useEffect, useRef, type ReactNode } from "react";
import { useTick } from "@pixi/react";
import type { Body as MatterBodyType } from "matter-js";
import Matter from "matter-js";
import type { Container } from "pixi.js";
import { usePhysics } from "./physics";
import { extendGame2D } from "./extend";

extendGame2D();

export type PhysicsBodyProps = {
  children?: ReactNode;
  /** Matter body factory — create once on mount. */
  createBody: (api: {
    Bodies: typeof Matter.Bodies;
    Body: typeof Matter.Body;
  }) => MatterBodyType;
  x?: number;
  y?: number;
};

/**
 * Syncs a Matter body to a Pixi container each tick.
 * Put sprites as children; the container follows the body.
 */
export function PhysicsBody({ children, createBody, x = 0, y = 0 }: PhysicsBodyProps) {
  const { world, Bodies, Body: MatterBodyApi, Composite } = usePhysics();
  const containerRef = useRef<Container | null>(null);
  const bodyRef = useRef<MatterBodyType | null>(null);

  useEffect(() => {
    const body = createBody({ Bodies, Body: MatterBodyApi });
    MatterBodyApi.setPosition(body, { x, y });
    Composite.add(world, body);
    bodyRef.current = body;
    return () => {
      Composite.remove(world, body);
      bodyRef.current = null;
    };
    // Mount-once for the body factory; reposition via MatterBodyApi if needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  useTick(() => {
    const body = bodyRef.current;
    const node = containerRef.current;
    if (!body || !node) return;
    node.x = body.position.x;
    node.y = body.position.y;
    node.rotation = body.angle;
  });

  return (
    <pixiContainer ref={containerRef as never} x={x} y={y}>
      {children}
    </pixiContainer>
  );
}
