import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { GameInteractionAPI } from "./types";

const Ctx = createContext<GameInteractionAPI | null>(null);

export function GameInteractionProvider(props: { value: GameInteractionAPI; children: ReactNode }) {
  return <Ctx.Provider value={props.value}>{props.children}</Ctx.Provider>;
}

/** Call from inside an `interaction` beat render prop after the learner clears a mission. */
export function useGameInteraction(): GameInteractionAPI {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useGameInteraction() must be used inside a GameView interaction beat");
  }
  return ctx;
}
