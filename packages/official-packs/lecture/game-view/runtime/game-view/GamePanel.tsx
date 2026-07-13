import { useCallback, useMemo } from "react";
import type { RefObject } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { celebrate } from "@faraday-academy/runtime/blocks";
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
}) {
  const { beat, blocked, stageRef, advance, setBeatIndex, onInteractionComplete } = props;

  const interactionApi = useMemo<GameInteractionAPI>(
    () => ({
      complete: onInteractionComplete,
      celebrate: () => celebrate(stageRef.current),
    }),
    [onInteractionComplete, stageRef],
  );

  if (beat.type === "dialogue") {
    return (
      <div className="flex flex-col gap-2">
        {beat.speaker ? <span className="text-sm font-semibold text-primary">{beat.speaker}</span> : null}
        <p className="text-lg leading-relaxed text-pretty sm:text-xl">{beat.text}</p>
        <p className="text-xs text-muted-foreground">Tap or press Space for next</p>
      </div>
    );
  }

  if (beat.type === "interaction") {
    const showButton = typeof beat.content !== "function";
    return (
      <GameInteractionProvider value={interactionApi}>
        <div className="flex flex-col gap-3">
          {beat.title ? <p className="text-base font-semibold">{beat.title}</p> : null}
          {beat.hint ? <p className="text-sm text-muted-foreground">{beat.hint}</p> : null}
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
    return (
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
    );
  }

  if (beat.type === "celebrate" && beat.message) {
    return <p className="text-lg font-semibold text-primary">{beat.message}</p>;
  }

  if ((beat.type === "scene" || beat.type === "move" || beat.type === "wait" || beat.type === "tileWalk") && blocked) {
    return <p className="text-sm text-muted-foreground animate-pulse">…</p>;
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
