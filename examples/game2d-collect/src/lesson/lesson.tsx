// Collect the shapes — game2d + AssetVault demo.
// Move the Kenney character to gather falling shapes; counts toward a <Challenge>.
import { useCallback, useEffect, useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Assets, type Texture } from "pixi.js";
import type { Body as MatterBody } from "matter-js";
import type { Container, FederatedPointerEvent } from "pixi.js";
import {
  Lesson,
  Prose,
  Workbench,
  Challenge,
  Readout,
  Callout,
} from "@faraday-academy/runtime/blocks";
import {
  Game2D,
  PhysicsWorld,
  PhysicsBody,
  game2dAsset,
  getAudioManager,
  disposeAudioManager,
  usePhysics,
} from "./game2d";

const WORLD_W = 400;
const GROUND_Y = 268;
const PLAYER_Y = 232;
const ITEM_COUNT = 4;

const PLAYER_SPRITE = game2dAsset("platformer-characters/PNG/Player/Poses/player_stand.png");
const ITEM_SPRITES = [
  game2dAsset("ui-pack/PNG/Red/Default/star_outline_depth.png"),
  game2dAsset("ui-pack/PNG/Blue/Default/icon_outline_circle.png"),
  game2dAsset("ui-pack/PNG/Green/Default/icon_outline_square.png"),
  game2dAsset("ui-pack/PNG/Yellow/Default/star_outline_depth.png"),
] as const;
const CLICK_SFX = game2dAsset("ui-pack/Sounds/click-a.ogg");

const ITEM_FALL_COLOR = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308] as const;
const ITEM_SPOTS = [
  { x: 70, y: 36 },
  { x: 150, y: 52 },
  { x: 250, y: 28 },
  { x: 330, y: 48 },
] as const;

type LoadedTextures = {
  player: Texture | null;
  items: (Texture | null)[];
};

async function loadTextures(): Promise<LoadedTextures> {
  try {
    const [player, ...items] = await Promise.all([
      Assets.load<Texture>(PLAYER_SPRITE),
      ...ITEM_SPRITES.map((src) => Assets.load<Texture>(src)),
    ]);
    return { player, items };
  } catch {
    return { player: null, items: ITEM_SPRITES.map(() => null) };
  }
}

function Ground() {
  const draw = useCallback(
    (g: {
      clear: () => void;
      setFillStyle: (s: { color: number }) => void;
      rect: (x: number, y: number, w: number, h: number) => void;
      fill: () => void;
    }) => {
      g.clear();
      g.setFillStyle({ color: 0x334155 });
      g.rect(-WORLD_W / 2, -12, WORLD_W, 24);
      g.fill();
    },
    [],
  );

  return (
    <PhysicsBody
      x={WORLD_W / 2}
      y={GROUND_Y}
      createBody={({ Bodies }) =>
        Bodies.rectangle(WORLD_W / 2, GROUND_Y, WORLD_W, 24, { isStatic: true })
      }
    >
      <pixiGraphics draw={draw} />
    </PhysicsBody>
  );
}

function ItemVisual({
  texture,
  color,
}: {
  texture: Texture | null;
  color: number;
}) {
  const draw = useCallback(
    (g: {
      clear: () => void;
      setFillStyle: (s: { color: number }) => void;
      circle: (x: number, y: number, r: number) => void;
      fill: () => void;
    }) => {
      g.clear();
      g.setFillStyle({ color });
      g.circle(0, 0, 14);
      g.fill();
    },
    [color],
  );

  if (texture) {
    return <pixiSprite texture={texture} anchor={0.5} scale={0.45} />;
  }
  return <pixiGraphics draw={draw} />;
}

function FallingItem({
  index,
  texture,
  collected,
  onBody,
}: {
  index: number;
  texture: Texture | null;
  collected: boolean;
  onBody: (index: number, body: MatterBody | null) => void;
}) {
  const spot = ITEM_SPOTS[index];

  if (collected) return null;

  return (
    <PhysicsBody
      x={spot.x}
      y={spot.y}
      createBody={({ Bodies }) => {
        const body = Bodies.circle(spot.x, spot.y, 14, {
          restitution: 0.2,
          friction: 0.05,
          label: `item-${index}`,
        });
        onBody(index, body);
        return body;
      }}
    >
      <ItemVisual texture={texture} color={ITEM_FALL_COLOR[index]} />
    </PhysicsBody>
  );
}

function Player({
  texture,
  bodyRef,
  containerRef,
}: {
  texture: Texture | null;
  bodyRef: React.MutableRefObject<MatterBody | null>;
  containerRef: React.MutableRefObject<Container | null>;
}) {
  const { Body: MatterBodyApi } = usePhysics();
  const keysRef = useRef({ left: false, right: false });
  const dragRef = useRef<{ active: boolean; offsetX: number }>({ active: false, offsetX: 0 });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const onPointerDown = (e: FederatedPointerEvent) => {
    const body = bodyRef.current;
    if (!body) return;
    dragRef.current = { active: true, offsetX: e.globalX - body.position.x };
  };

  const onPointerMove = (e: FederatedPointerEvent) => {
    if (!dragRef.current.active) return;
    const body = bodyRef.current;
    if (!body) return;
    const x = Math.max(28, Math.min(WORLD_W - 28, e.globalX - dragRef.current.offsetX));
    MatterBodyApi.setPosition(body, { x, y: PLAYER_Y });
    MatterBodyApi.setVelocity(body, { x: 0, y: 0 });
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  useTick(() => {
    const body = bodyRef.current;
    if (!body) return;
    const speed = 3.8;
    let nextX = body.position.x;
    if (keysRef.current.left) nextX -= speed;
    if (keysRef.current.right) nextX += speed;
    nextX = Math.max(28, Math.min(WORLD_W - 28, nextX));
    if (nextX !== body.position.x) {
      MatterBodyApi.setPosition(body, { x: nextX, y: PLAYER_Y });
      MatterBodyApi.setVelocity(body, { x: 0, y: 0 });
    }
  });

  const drawFallback = useCallback(
    (g: {
      clear: () => void;
      setFillStyle: (s: { color: number }) => void;
      roundRect: (x: number, y: number, w: number, h: number, r: number) => void;
      fill: () => void;
    }) => {
      g.clear();
      g.setFillStyle({ color: 0x60a5fa });
      g.roundRect(-16, -44, 32, 44, 6);
      g.fill();
    },
    [],
  );

  return (
    <PhysicsBody
      x={WORLD_W / 2}
      y={PLAYER_Y}
      createBody={({ Bodies }) => {
        const body = Bodies.rectangle(WORLD_W / 2, PLAYER_Y, 32, 44, {
          isStatic: true,
          label: "player",
        });
        bodyRef.current = body;
        return body;
      }}
    >
      <pixiContainer
        ref={containerRef as never}
        eventMode="static"
        cursor="pointer"
        onPointerDown={onPointerDown}
        onGlobalPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerUpOutside={onPointerUp}
      >
        {texture ? (
          <pixiSprite texture={texture} anchor={{ x: 0.5, y: 1 }} scale={0.55} y={22} />
        ) : (
          <pixiGraphics draw={drawFallback} y={22} />
        )}
      </pixiContainer>
    </PhysicsBody>
  );
}

function CollectScene({
  textures,
  onCollect,
}: {
  textures: LoadedTextures;
  onCollect: () => void;
}) {
  const { world, Composite } = usePhysics();
  const playerBodyRef = useRef<MatterBody | null>(null);
  const playerContainerRef = useRef<Container | null>(null);
  const itemBodyRefs = useRef<(MatterBody | null)[]>(Array.from({ length: ITEM_COUNT }, () => null));
  const takenRef = useRef<Set<number>>(new Set());
  const [taken, setTaken] = useState<ReadonlySet<number>>(() => new Set());

  const registerItemBody = useCallback((index: number, body: MatterBody | null) => {
    itemBodyRefs.current[index] = body;
  }, []);

  useTick(() => {
    const player = playerBodyRef.current;
    if (!player) return;

    for (let i = 0; i < ITEM_COUNT; i++) {
      if (takenRef.current.has(i)) continue;
      const body = itemBodyRefs.current[i];
      if (!body) continue;
      const dx = body.position.x - player.position.x;
      const dy = body.position.y - player.position.y;
      if (dx * dx + dy * dy < 42 * 42) {
        takenRef.current.add(i);
        Composite.remove(world, body);
        itemBodyRefs.current[i] = null;
        getAudioManager().play("click");
        setTaken(new Set(takenRef.current));
        onCollect();
      }
    }
  });

  return (
    <>
      <Ground />
      <Player texture={textures.player} bodyRef={playerBodyRef} containerRef={playerContainerRef} />
      {ITEM_SPRITES.map((_, i) => (
        <FallingItem
          key={i}
          index={i}
          texture={textures.items[i] ?? null}
          collected={taken.has(i)}
          onBody={registerItemBody}
        />
      ))}
    </>
  );
}

function CollectGame({ onCollect }: { onCollect: () => void }) {
  const [textures, setTextures] = useState<LoadedTextures | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTextures().then((loaded) => {
      if (!cancelled) setTextures(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      getAudioManager().register("click", CLICK_SFX);
    } catch {
      /* assets optional */
    }
    return () => disposeAudioManager();
  }, []);

  if (!textures) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        Loading sprites…
      </div>
    );
  }

  return (
    <Game2D background={0x0f172a}>
      <PhysicsWorld gravityY={0.9}>
        <CollectScene textures={textures} onCollect={onCollect} />
      </PhysicsWorld>
    </Game2D>
  );
}

export default function CollectShapesLesson() {
  const [collected, setCollected] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const allCollected = collected >= ITEM_COUNT;

  const reset = () => {
    setCollected(0);
    setGameKey((k) => k + 1);
  };

  return (
    <Lesson
      topic="Counting"
      title="Collect the shapes"
      lead="Move the character left and right to catch every falling shape. Count along as you go — the mission clears when all four are gathered."
    >
      <Prose>
        <p>
          Each shape that lands in your reach adds one to your count. Use the{" "}
          <strong>arrow keys</strong> (or <strong>A</strong> / <strong>D</strong>), or{" "}
          <strong>drag</strong> the character on touch screens.
        </p>
      </Prose>

      <Challenge
        goal="Collect all items"
        done={allCollected}
        hint="Stand under a falling shape and let gravity bring it to you. Work across the screen — shapes drop at different times."
      >
        <Workbench
          title="Shape collector"
          onReset={reset}
          hud={
            <Readout
              label="Collected"
              value={`${collected} / ${ITEM_COUNT}`}
              tone={allCollected ? "primary" : "default"}
            />
          }
        >
          <div style={{ height: 320 }}>
            <CollectGame
              key={gameKey}
              onCollect={() => setCollected((n) => Math.min(ITEM_COUNT, n + 1))}
            />
          </div>
        </Workbench>
      </Challenge>

      <Prose heading="What you practiced">
        <p>
          You matched <strong>one object → one count</strong> until the set was complete. That
          one-to-one correspondence is the foundation of cardinality — knowing that the last number
          you said is how many you have.
        </p>
      </Prose>

      <Callout title="Assets via AssetVault">
        Sprites come from Kenney CC0 packs installed with{" "}
        <code>node scripts/game2d-assets.mjs add …</code>. Without them, the game falls back to
        colored shapes so the lesson still runs.
      </Callout>
    </Lesson>
  );
}
