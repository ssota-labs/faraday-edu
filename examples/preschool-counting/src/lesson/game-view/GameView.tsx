// <GameView> — 2D game-style lecture presentation: scenes, character movement,
// dialogue, audio, tilemaps, and screen transitions (not a slide deck).
// Author-editable; installed by `faraday pack add game-view`. Canvas + CSS + React — no extra deps.
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
  /** localStorage key for resume position */
  storageKey: string;
  className?: string;
}) {
  const sceneMap = Object.fromEntries(props.scenes.map((s) => [s.id, s]));
  const load = (): { sceneId: string; beatIndex: number } => {
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
  const beatIndexRef = useRef(beatIndex);
  const stageRef = useRef<HTMLDivElement>(null);
  const audio = useGameAudio();

  const scene = sceneMap[sceneId] ?? props.scenes[0];
  const beat = scene?.beats[beatIndex];
  const tilemapMode = tilemap != null;

  useEffect(() => {
    beatIndexRef.current = beatIndex;
    localStorage.setItem(
      `faraday.game-view.${props.storageKey}`,
      JSON.stringify({ sceneId, beatIndex }),
    );
  }, [sceneId, beatIndex, props.storageKey]);

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
    if (!scene || blocked) return;
    if (beatIndex < scene.beats.length - 1) {
      setBeatIndex((i) => i + 1);
    }
  }, [scene, beatIndex, blocked]);

  const onInteractionComplete = useInteractionCompleteHandler(beat, stageRef, advance);

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
      const t = setTimeout(advance, 400);
      return () => clearTimeout(t);
    }

    if (beat.type === "move") {
      setBlocked(true);
      setPositions((p) => ({ ...p, [beat.characterId]: { x: beat.x, y: beat.y } }));
      const t = setTimeout(() => {
        setBlocked(false);
        advance();
      }, beat.durationMs ?? 700);
      return () => clearTimeout(t);
    }

    if (beat.type === "wait") {
      setBlocked(true);
      const t = setTimeout(() => {
        setBlocked(false);
        advance();
      }, beat.ms ?? 600);
      return () => clearTimeout(t);
    }

    if (beat.type === "playAudio") {
      audio.play(beat.src, beat.channel ?? "sfx", beat.loop ?? false, beat.volume ?? 1);
      advance();
      return;
    }

    if (beat.type === "stopAudio") {
      audio.stop(beat.channel ?? "all");
      advance();
      return;
    }

    if (beat.type === "celebrate") {
      celebrate(stageRef.current);
      const ms = beat.advanceAfterMs ?? 1200;
      const t = setTimeout(advance, ms);
      return () => clearTimeout(t);
    }

    if (beat.type === "dialogue") {
      if (beat.voice) audio.play(beat.voice, "sfx");
      setBlocked(false);
      return;
    }

    if (beat.type === "tilemap") {
      setTilemap(beat.config);
      const t = setTimeout(advance, 300);
      return () => clearTimeout(t);
    }

    if (beat.type === "tileWalk") {
      setBlocked(true);
      let step = 0;
      const path = beat.path;
      const tick = () => {
        if (step >= path.length) {
          setBlocked(false);
          advance();
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
  }, [beat, advance, audio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        const b = scene?.beats[beatIndexRef.current];
        if (b?.type === "dialogue") advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, advance]);

  if (!scene || !beat) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        Scene complete.
      </div>
    );
  }

  const chars = scene.characters ?? [];

  return (
    <section
      className={cn("flex flex-col gap-0 overflow-hidden rounded-xl border shadow-sm", props.className)}
      aria-roledescription="game view"
    >
      <div
        ref={stageRef}
        className="relative aspect-[16/10] w-full touch-manipulation select-none"
        style={
          tilemapMode
            ? { backgroundColor: "#1a1a2e" }
            : {
                backgroundColor,
                backgroundImage: background ? `url(${background})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: transition ? 1 : 0.3,
                transition: "opacity 0.35s ease",
              }
        }
        onClick={() => beat.type === "dialogue" && advance()}
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
                  width: c.width ?? "26%",
                  transform: "translate(-50%, 0)",
                  transition: "left 0.65s ease, bottom 0.65s ease",
                }}
              />
            );
          })
        )}
      </div>

      <div className="min-h-[7rem] border-t bg-card p-4 sm:p-5">
        <GamePanel
          beat={beat}
          blocked={blocked}
          stageRef={stageRef}
          advance={advance}
          setBeatIndex={setBeatIndex}
          onInteractionComplete={onInteractionComplete}
        />
      </div>
    </section>
  );
}
