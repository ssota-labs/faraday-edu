// <GameView> — 2D game-style lecture presentation: scenes, character movement,
// dialogue, audio, tilemaps, and screen transitions (not a slide deck).
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@faraday-academy/runtime/lib/utils";
import { celebrate } from "@faraday-academy/runtime/blocks";
import { useGameAudio } from "./audio";
import { GamePanel, useInteractionCompleteHandler } from "./GamePanel";
import { initialGridPositions, TilemapStage } from "./TilemapStage";
import type { GameBeat, GameCharacter, GameScene, GridPos, PercentPos, TilemapConfig } from "./types";

export type { GameBeat, GameCharacter, GameScene, TilemapConfig } from "./types";
export { useGameInteraction } from "./GameInteraction";

function initialPositions(characters?: GameCharacter[]): PercentPos {
  const pos: PercentPos = {};
  for (const c of characters ?? []) {
    pos[c.id] = { x: c.x ?? 20, y: c.y ?? 70 };
  }
  return pos;
}

export function GameView(props: {
  scenes: GameScene[];
  startSceneId: string;
  storageKey: string;
  /** Full-viewport storybook layout — scene fills the screen, dialogue overlays at bottom. */
  immersive?: boolean;
  /** Shown as a subtle title card overlay (immersive only), not a page header. */
  title?: string;
  resume?: boolean;
  className?: string;
}) {
  const immersive = props.immersive ?? false;
  const resume = props.resume ?? !immersive;
  const sceneMap = Object.fromEntries(props.scenes.map((s) => [s.id, s]));

  const load = (): { sceneId: string; beatIndex: number } => {
    if (!resume) return { sceneId: props.startSceneId, beatIndex: 0 };
    try {
      const raw = localStorage.getItem(`faraday.game-view.${props.storageKey}`);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { sceneId: props.startSceneId, beatIndex: 0 };
  };

  const [sceneId, setSceneId] = useState(() => load().sceneId);
  const [beatIndex, setBeatIndex] = useState(() => load().beatIndex);
  const [positions, setPositions] = useState<PercentPos>(() => initialPositions(sceneMap[sceneId]?.characters));
  const [gridPositions, setGridPositions] = useState<GridPos>(() => initialGridPositions(sceneMap[sceneId]?.characters));
  const [tilemap, setTilemap] = useState<TilemapConfig | null>(null);
  const [background, setBackground] = useState<string | undefined>();
  const [backgroundColor, setBackgroundColor] = useState("oklch(0.55 0.12 220)");
  const [transition, setTransition] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [titleVisible, setTitleVisible] = useState(Boolean(props.title && immersive));
  const beatIndexRef = useRef(beatIndex);
  const blockedRef = useRef(blocked);
  const stageRef = useRef<HTMLDivElement>(null);
  const audio = useGameAudio();

  const scene = sceneMap[sceneId] ?? props.scenes[0];
  const beat = scene?.beats[beatIndex];
  const tilemapMode = tilemap != null;

  useEffect(() => {
    beatIndexRef.current = beatIndex;
  }, [beatIndex]);

  useEffect(() => {
    blockedRef.current = blocked;
  }, [blocked]);

  useEffect(() => {
    if (!resume) return;
    localStorage.setItem(
      `faraday.game-view.${props.storageKey}`,
      JSON.stringify({ sceneId, beatIndex }),
    );
  }, [sceneId, beatIndex, props.storageKey, resume]);

  useEffect(() => {
    if (!scene) return;
    setPositions(initialPositions(scene.characters));
    setGridPositions(initialGridPositions(scene.characters));
    setTilemap(null);
    const firstScene = scene.beats.find((b) => b.type === "scene") as Extract<GameBeat, { type: "scene" }> | undefined;
    if (firstScene?.background) setBackground(firstScene.background);
    if (firstScene?.backgroundColor) setBackgroundColor(firstScene.backgroundColor);
  }, [sceneId, scene]);

  const advance = useCallback(() => {
    if (!scene || blockedRef.current) return;
    setBeatIndex((i) => {
      if (i < scene.beats.length - 1) return i + 1;
      return i;
    });
    if (titleVisible) setTitleVisible(false);
  }, [scene, titleVisible]);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const onInteractionComplete = useInteractionCompleteHandler(beat, stageRef, advance);

  const handleTap = useCallback(() => {
    if (!beat || blockedRef.current) return;
    if (beat.type === "dialogue" || beat.type === "scene") advanceRef.current();
  }, [beat]);

  useEffect(() => {
    if (!beat) return;

    if (beat.type === "scene") {
      setTransition(false);
      requestAnimationFrame(() => {
        if (beat.background !== undefined) setBackground(beat.background);
        if (beat.backgroundColor) setBackgroundColor(beat.backgroundColor);
        setTransition(true);
      });
      if (beat.bgm) audio.play(beat.bgm, "bgm", true);
      if (!immersive) {
        const t = setTimeout(() => advanceRef.current(), 400);
        return () => clearTimeout(t);
      }
      return;
    }

    if (beat.type === "move") {
      setBlocked(true);
      setPositions((p) => ({ ...p, [beat.characterId]: { x: beat.x, y: beat.y } }));
      const t = setTimeout(() => {
        setBlocked(false);
        advanceRef.current();
      }, beat.durationMs ?? 700);
      return () => clearTimeout(t);
    }

    if (beat.type === "wait") {
      setBlocked(true);
      const t = setTimeout(() => {
        setBlocked(false);
        advanceRef.current();
      }, beat.ms ?? 600);
      return () => clearTimeout(t);
    }

    if (beat.type === "playAudio") {
      audio.play(beat.src, beat.channel ?? "sfx", beat.loop ?? false, beat.volume ?? 1);
      advanceRef.current();
      return;
    }

    if (beat.type === "stopAudio") {
      audio.stop(beat.channel ?? "all");
      advanceRef.current();
      return;
    }

    if (beat.type === "celebrate") {
      celebrate(stageRef.current);
      const ms = beat.advanceAfterMs ?? 1200;
      const t = setTimeout(() => advanceRef.current(), ms);
      return () => clearTimeout(t);
    }

    if (beat.type === "dialogue") {
      if (beat.voice) audio.play(beat.voice, "sfx");
      setBlocked(false);
      return;
    }

    if (beat.type === "tilemap") {
      setTilemap(beat.config);
      const t = setTimeout(() => advanceRef.current(), 300);
      return () => clearTimeout(t);
    }

    if (beat.type === "tileWalk") {
      setBlocked(true);
      let step = 0;
      const path = beat.path;
      const tick = () => {
        if (step >= path.length) {
          setBlocked(false);
          advanceRef.current();
          return;
        }
        const { col, row } = path[step];
        setGridPositions((p) => ({ ...p, [beat.characterId]: { col, row } }));
        step += 1;
        setTimeout(tick, beat.stepMs ?? 280);
      };
      tick();
      return;
    }

    if (beat.type === "interaction" || beat.type === "choice") {
      setBlocked(false);
    }
  }, [beat, audio, immersive]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        const b = scene?.beats[beatIndexRef.current];
        if (b?.type === "dialogue" || b?.type === "scene") advanceRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene]);

  if (!scene || !beat) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          immersive ? "fixed inset-0 bg-background" : "rounded-xl border bg-card p-6",
        )}
      >
        The end.
      </div>
    );
  }

  const chars = scene.characters ?? [];
  const panel = (
    <GamePanel
      beat={beat}
      blocked={blocked}
      stageRef={stageRef}
      advance={advance}
      setBeatIndex={setBeatIndex}
      onInteractionComplete={onInteractionComplete}
      immersive={immersive}
    />
  );
  const showScrim =
    beat.type === "dialogue" ||
    beat.type === "scene" ||
    beat.type === "celebrate" ||
    beat.type === "interaction" ||
    beat.type === "choice";

  const stageStyle = tilemapMode
    ? { backgroundColor: "#1a1a2e" }
    : {
        backgroundColor,
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: transition ? 1 : 0.3,
        transition: "opacity 0.35s ease",
      };

  return (
    <section
      className={cn(
        immersive
          ? "fixed inset-0 z-50 flex touch-manipulation select-none flex-col overflow-hidden"
          : "flex flex-col gap-0 overflow-hidden rounded-xl border shadow-sm",
        props.className,
      )}
      aria-roledescription="game view"
      onClick={immersive ? handleTap : undefined}
      onKeyDown={undefined}
    >
      <div
        ref={stageRef}
        className={cn(
          "relative w-full",
          immersive ? "min-h-0 flex-1" : "aspect-[16/10] touch-manipulation select-none",
        )}
        style={stageStyle}
        onClick={!immersive ? handleTap : undefined}
        role="presentation"
      >
        {tilemapMode && tilemap ? (
          <TilemapStage
            config={tilemap}
            characters={chars}
            gridPositions={gridPositions}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          chars.map((c) => {
            const p = positions[c.id] ?? { x: c.x ?? 20, y: c.y ?? 70 };
            return (
              <img
                key={c.id}
                src={c.sprite}
                alt=""
                className="absolute bottom-0 object-contain drop-shadow-md"
                style={{
                  left: `${p.x}%`,
                  bottom: `${100 - p.y}%`,
                  width: c.width ?? (immersive ? "22%" : "26%"),
                  transform: "translate(-50%, 0)",
                  transition: "left 0.65s ease, bottom 0.65s ease",
                }}
              />
            );
          })
        )}

        {immersive && titleVisible && props.title ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
            <h1 className="max-w-[16ch] text-center text-4xl font-semibold tracking-tight text-white text-balance drop-shadow-lg sm:text-5xl">
              {props.title}
            </h1>
          </div>
        ) : null}

        {immersive ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-8 pt-24 sm:px-8 sm:pb-10",
              showScrim && "bg-gradient-to-t from-black/85 via-black/55 to-transparent",
            )}
          >
            {panel}
            {beat.type === "dialogue" || beat.type === "scene" ? (
              <p className="pointer-events-none mt-4 text-center text-xs text-white/50">Tap anywhere to continue</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {!immersive ? <div className="min-h-[7rem] border-t bg-card p-4 sm:p-5">{panel}</div> : null}
    </section>
  );
}
