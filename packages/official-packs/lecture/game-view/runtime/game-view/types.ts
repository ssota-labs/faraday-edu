import type { ReactNode } from "react";

export interface GameInteractionAPI {
  complete: () => void;
  celebrate: () => void;
}

/** Static content or a render prop that calls `complete()` when the mission clears. */
export type GameInteractionContent = ReactNode | ((api: GameInteractionAPI) => ReactNode);

export interface GameCharacter {
  id: string;
  /** Sprite image URL (from public/assets/ or procedural). */
  sprite: string;
  /** 0–100 percentage of the stage (CSS mode). */
  x?: number;
  y?: number;
  /** Grid column when a tilemap is active. */
  col?: number;
  /** Grid row when a tilemap is active. */
  row?: number;
  /** CSS width of the sprite, e.g. "28%". */
  width?: string;
}

/** Canvas tilemap layer (v2). Tile indices index into a spritesheet left-to-right, top-to-bottom. */
export interface TilemapConfig {
  cols: number;
  rows: number;
  /** Row-major tile indices; -1 = empty/transparent */
  map: number[][];
  /** Spritesheet URL in public/assets/tiles/ */
  tileset?: string;
  tileSize?: number;
  tilesetColumns?: number;
}

export type GameBeat =
  | { type: "scene"; background?: string; backgroundColor?: string; bgm?: string }
  | { type: "move"; characterId: string; x: number; y: number; durationMs?: number }
  | { type: "dialogue"; speaker?: string; text: string; voice?: string }
  | { type: "wait"; ms?: number }
  | { type: "playAudio"; src: string; channel?: "bgm" | "sfx"; loop?: boolean; volume?: number }
  | { type: "stopAudio"; channel?: "bgm" | "sfx" | "all" }
  | { type: "celebrate"; message?: string; advanceAfterMs?: number }
  | {
      type: "interaction";
      title?: string;
      hint?: string;
      content: GameInteractionContent;
      /** Fire confetti when `complete()` is called (default true). */
      celebrateOnComplete?: boolean;
      continueLabel?: string;
    }
  | { type: "choice"; prompt: string; options: { label: string; jump: number }[] }
  | { type: "tilemap"; config: TilemapConfig }
  | { type: "tileWalk"; characterId: string; path: { col: number; row: number }[]; stepMs?: number };

export interface GameScene {
  id: string;
  title?: string;
  characters?: GameCharacter[];
  beats: GameBeat[];
}

export type GridPos = Record<string, { col: number; row: number }>;
export type PercentPos = Record<string, { x: number; y: number }>;
