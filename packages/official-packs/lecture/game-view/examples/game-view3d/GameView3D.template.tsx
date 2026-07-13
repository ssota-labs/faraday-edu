// v3 template — copy into src/lesson/game-view/ AFTER `faraday pack add three`.
// Requires @faraday-academy/three. Not shipped in the default game-view copy (2D-only).
//
// Usage:
//   1. faraday pack add three
//   2. Copy this file → src/lesson/game-view/GameView3D.tsx
//   3. import { GameView3D } from "./game-view/GameView3D"
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Scene3D, type Mood } from "@faraday-academy/three";
import { cn } from "@faraday-academy/runtime/lib/utils";
import { celebrate } from "@faraday-academy/runtime/blocks";
import { useGameAudio } from "./game-view/audio";
import { GamePanel, useInteractionCompleteHandler } from "./game-view/GamePanel";
import type { GameBeat, GameScene } from "./game-view/types";

export interface GameScene3D extends GameScene {
  props3d?: ReactNode;
}

export function GameView3D(props: {
  scenes: GameScene3D[];
  startSceneId: string;
  storageKey: string;
  mood?: Mood;
  className?: string;
}) {
  const sceneMap = Object.fromEntries(props.scenes.map((s) => [s.id, s]));
  const load = (): { sceneId: string; beatIndex: number } => {
    try {
      const raw = localStorage.getItem(`faraday.game-view3d.${props.storageKey}`);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { sceneId: props.startSceneId, beatIndex: 0 };
  };

  const [sceneId] = useState(() => load().sceneId);
  const [beatIndex, setBeatIndex] = useState(() => load().beatIndex);
  const [blocked, setBlocked] = useState(false);
  const beatIndexRef = useRef(beatIndex);
  const stageRef = useRef<HTMLDivElement>(null);
  const audio = useGameAudio();

  const scene = sceneMap[sceneId] ?? props.scenes[0];
  const beat = scene?.beats[beatIndex];

  useEffect(() => {
    beatIndexRef.current = beatIndex;
    localStorage.setItem(
      `faraday.game-view3d.${props.storageKey}`,
      JSON.stringify({ sceneId, beatIndex }),
    );
  }, [sceneId, beatIndex, props.storageKey]);

  const advance = useCallback(() => {
    if (!scene || blocked) return;
    if (beatIndex < scene.beats.length - 1) setBeatIndex((i) => i + 1);
  }, [scene, beatIndex, blocked]);

  const onInteractionComplete = useInteractionCompleteHandler(beat, stageRef, advance);

  useEffect(() => {
    if (!beat) return;
    if (beat.type === "scene") {
      if (beat.bgm) audio.play(beat.bgm, "bgm", true);
      const t = setTimeout(advance, 400);
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
      const t = setTimeout(advance, beat.advanceAfterMs ?? 1200);
      return () => clearTimeout(t);
    }
    if (beat.type === "dialogue" && beat.voice) audio.play(beat.voice, "sfx");
    if (beat.type === "dialogue" || beat.type === "interaction" || beat.type === "choice") {
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

  return (
    <section
      className={cn("flex flex-col gap-0 overflow-hidden rounded-xl border shadow-sm", props.className)}
      aria-roledescription="game view 3d"
    >
      <div ref={stageRef} className="relative aspect-[16/10] w-full" role="presentation">
        <Scene3D mood={props.mood ?? "abstract"} fill camera={[0, 4, 8]} controls>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          {scene.props3d ?? (
            <>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#8b9cf6" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[12, 12]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </>
          )}
        </Scene3D>
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
