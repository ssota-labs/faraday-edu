// <GameView> — 2D game-style lecture presentation: scenes, character movement,
// dialogue, and screen transitions (not a slide deck). Author-editable; installed
// by `faraday pack add game-view`. Canvas + CSS + React state machine — no extra deps.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { cn } from "@faraday-academy/runtime/lib/utils";

export interface GameCharacter {
  id: string;
  /** Sprite image URL (from public/assets/ or procedural). */
  sprite: string;
  /** 0–100 percentage of the stage. */
  x?: number;
  y?: number;
  /** CSS width of the sprite, e.g. "28%". */
  width?: string;
}

export type GameBeat =
  | { type: "scene"; background?: string; backgroundColor?: string }
  | { type: "move"; characterId: string; x: number; y: number; durationMs?: number }
  | { type: "dialogue"; speaker?: string; text: string }
  | { type: "wait"; ms?: number }
  | { type: "interaction"; content: ReactNode }
  | { type: "choice"; prompt: string; options: { label: string; jump: number }[] };

export interface GameScene {
  id: string;
  title?: string;
  characters?: GameCharacter[];
  beats: GameBeat[];
}

type Pos = Record<string, { x: number; y: number }>;

function initialPositions(characters?: GameCharacter[]): Pos {
  const pos: Pos = {};
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
  const [positions, setPositions] = useState<Pos>(() => initialPositions(sceneMap[sceneId]?.characters));
  const [background, setBackground] = useState<string | undefined>();
  const [backgroundColor, setBackgroundColor] = useState("oklch(0.55 0.12 220)");
  const [transition, setTransition] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const beatIndexRef = useRef(beatIndex);

  const scene = sceneMap[sceneId] ?? props.scenes[0];
  const beat = scene?.beats[beatIndex];

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

  // Run side-effects for the current beat
  useEffect(() => {
    if (!beat) return;
    if (beat.type === "scene") {
      setTransition(false);
      requestAnimationFrame(() => {
        if (beat.background !== undefined) setBackground(beat.background);
        if (beat.backgroundColor) setBackgroundColor(beat.backgroundColor);
        setTransition(true);
      });
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
    if (beat.type === "dialogue" || beat.type === "interaction" || beat.type === "choice") {
      setBlocked(false);
    }
  }, [beat, advance]);

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
      {/* Stage */}
      <div
        className="relative aspect-[16/10] w-full touch-manipulation select-none"
        style={{
          backgroundColor,
          backgroundImage: background ? `url(${background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: transition ? 1 : 0.3,
          transition: "opacity 0.35s ease",
        }}
        onClick={() => beat.type === "dialogue" && advance()}
        role="presentation"
      >
        {chars.map((c) => {
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
        })}
      </div>

      {/* Dialogue / interaction panel */}
      <div className="min-h-[7rem] border-t bg-card p-4 sm:p-5">
        {beat.type === "dialogue" ? (
          <div className="flex flex-col gap-2">
            {beat.speaker ? (
              <span className="text-sm font-semibold text-primary">{beat.speaker}</span>
            ) : null}
            <p className="text-lg leading-relaxed text-pretty sm:text-xl">{beat.text}</p>
            <p className="text-xs text-muted-foreground">Tap or press Space for next</p>
          </div>
        ) : null}

        {beat.type === "interaction" ? (
          <div className="flex flex-col gap-3">
            {beat.content}
            <Button size="sm" className="self-end" onClick={advance}>
              Continue
            </Button>
          </div>
        ) : null}

        {beat.type === "choice" ? (
          <div className="flex flex-col gap-3">
            <p className="font-medium">{beat.prompt}</p>
            <div className="flex flex-wrap gap-2">
              {beat.options.map((opt) => (
                <Button
                  key={opt.label}
                  size="lg"
                  className="min-h-12 min-w-[8rem] text-base"
                  onClick={() => setBeatIndex(opt.jump)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {(beat.type === "scene" || beat.type === "move" || beat.type === "wait") && blocked ? (
          <p className="text-sm text-muted-foreground animate-pulse">…</p>
        ) : null}
      </div>
    </section>
  );
}
