import { useCallback, useMemo } from "react";
import type { ReactNode, RefObject } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { celebrate } from "@faraday-academy/runtime/blocks";
import { cn } from "@faraday-academy/runtime/lib/utils";
import { GameInteractionProvider } from "./GameInteraction";
import type { GameBeat, GameInteractionAPI, GameInteractionContent } from "./types";

function renderInteractionContent(content: GameInteractionContent, api: GameInteractionAPI) {
  return typeof content === "function" ? content(api) : content;
}

export function GamePanel(props: {
  beat: GameBeat;
  blocked: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  advance: () => void;
  setBeatIndex: (index: number) => void;
  onInteractionComplete: () => void;
  immersive?: boolean;
}) {
  const { beat, blocked, stageRef, advance, setBeatIndex, onInteractionComplete, immersive } = props;

  const interactionApi = useMemo<GameInteractionAPI>(
    () => ({
      complete: onInteractionComplete,
      celebrate: () => celebrate(stageRef.current),
    }),
    [onInteractionComplete, stageRef],
  );

  const shell = (children: ReactNode) => (
    <div
      className={cn(
        immersive
          ? "pointer-events-auto flex flex-col gap-3 text-white"
          : "flex flex-col gap-2",
      )}
    >
      {children}
    </div>
  );

  if (beat.type === "dialogue") {
    return shell(
      <>
        {beat.speaker ? (
          <span className={cn("font-semibold", immersive ? "text-base text-amber-200" : "text-sm text-primary")}>
            {beat.speaker}
          </span>
        ) : null}
        <p
          className={cn(
            "leading-relaxed text-pretty",
            immersive ? "text-2xl font-medium sm:text-3xl" : "text-lg sm:text-xl",
          )}
        >
          {beat.text}
        </p>
        {!immersive ? <p className="text-xs text-muted-foreground">Tap or press Space for next</p> : null}
      </>,
    );
  }

  if (beat.type === "interaction") {
    const showButton = typeof beat.content !== "function";
    return (
      <GameInteractionProvider value={interactionApi}>
        <div
          className={cn(
            "pointer-events-auto flex flex-col gap-3",
            immersive && "rounded-2xl bg-black/55 p-4 text-white backdrop-blur-sm",
          )}
        >
          {beat.title ? <p className={cn("font-semibold", immersive ? "text-xl" : "text-base")}>{beat.title}</p> : null}
          {beat.hint ? (
            <p className={cn(immersive ? "text-sm text-white/75" : "text-sm text-muted-foreground")}>{beat.hint}</p>
          ) : null}
          {renderInteractionContent(beat.content, interactionApi)}
          {showButton ? (
            <Button size="lg" className="min-h-12 self-end text-base" onClick={advance}>
              {beat.continueLabel ?? "Continue"}
            </Button>
          ) : null}
        </div>
      </GameInteractionProvider>
    );
  }

  if (beat.type === "choice") {
    return shell(
      <>
        <p className={cn("font-medium", immersive && "text-xl")}>{beat.prompt}</p>
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
      </>,
    );
  }

  if (beat.type === "celebrate" && beat.message) {
    return shell(<p className={cn("font-semibold", immersive ? "text-2xl text-amber-200" : "text-lg text-primary")}>{beat.message}</p>);
  }

  if ((beat.type === "scene" || beat.type === "move" || beat.type === "wait" || beat.type === "tileWalk") && blocked) {
    return shell(<p className={cn("animate-pulse", immersive ? "text-white/70" : "text-sm text-muted-foreground")}>…</p>);
  }

  if (immersive && beat.type === "scene") {
    return shell(<p className="text-lg text-white/80 animate-pulse">Tap anywhere to begin…</p>);
  }

  return null;
}

export function useInteractionCompleteHandler(
  beat: GameBeat | undefined,
  stageRef: RefObject<HTMLDivElement | null>,
  advance: () => void,
) {
  return useCallback(() => {
    if (beat?.type !== "interaction") return;
    if (beat.celebrateOnComplete !== false) celebrate(stageRef.current);
    advance();
  }, [beat, stageRef, advance]);
}
