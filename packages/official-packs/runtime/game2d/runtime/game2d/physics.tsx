import Matter from "matter-js";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useTick } from "@pixi/react";

const { Engine, Bodies, Body, Composite, Events } = Matter;

export type PhysicsContextValue = {
  engine: Matter.Engine;
  world: Matter.World;
  Bodies: typeof Bodies;
  Body: typeof Body;
  Composite: typeof Composite;
};

const PhysicsContext = createContext<PhysicsContextValue | null>(null);

export function usePhysics(): PhysicsContextValue {
  const ctx = useContext(PhysicsContext);
  if (!ctx) throw new Error("usePhysics() must be used inside <PhysicsWorld>");
  return ctx;
}

export type PhysicsWorldProps = {
  children?: ReactNode;
  /** Matter gravity.y — default 1 (screen-down). Set 0 for top-down. */
  gravityY?: number;
  gravityX?: number;
  /** When false, the world does not step (pause). */
  running?: boolean;
};

/**
 * Matter.js world driven by Pixi's ticker (via useTick).
 * Mount only as a child of <Game2D> / <Application>.
 */
export function PhysicsWorld({
  children,
  gravityY = 1,
  gravityX = 0,
  running = true,
}: PhysicsWorldProps) {
  const value = useMemo(() => {
    const engine = Engine.create({ gravity: { x: gravityX, y: gravityY } });
    return {
      engine,
      world: engine.world,
      Bodies,
      Body,
      Composite,
    };
  }, [gravityX, gravityY]);

  useEffect(() => {
    return () => {
      Engine.clear(value.engine);
    };
  }, [value.engine]);

  useTick({
    callback: (ticker) => {
      if (!running) return;
      // Matter expects ~16.6ms steps; clamp huge pauses (tab switch).
      const dt = Math.min(ticker.deltaMS, 33.3);
      Engine.update(value.engine, dt);
    },
    isEnabled: running,
  });

  return <PhysicsContext.Provider value={value}>{children}</PhysicsContext.Provider>;
}

export { Bodies, Body, Composite, Events, Matter };
