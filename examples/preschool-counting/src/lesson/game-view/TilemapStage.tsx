import { useEffect, useRef } from "react";
import type { GameCharacter, GridPos, TilemapConfig } from "./types";

const FALLBACK_COLORS = [
  "#4ade80",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#f87171",
];

/** Canvas 2D tilemap layer (v2). Zero extra deps — PixiJS optional for authors who outgrow this. */
export function TilemapStage(props: {
  config: TilemapConfig;
  characters: GameCharacter[];
  gridPositions: GridPos;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { config, characters, gridPositions } = props;
  const tileSize = config.tileSize ?? 48;
  const sheetCols = config.tilesetColumns ?? 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = config.cols * tileSize;
    const h = config.rows * tileSize;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const drawTiles = (img?: HTMLImageElement) => {
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          const idx = config.map[row]?.[col] ?? -1;
          if (idx < 0) continue;
          const x = col * tileSize;
          const y = row * tileSize;
          if (img) {
            const sx = (idx % sheetCols) * tileSize;
            const sy = Math.floor(idx / sheetCols) * tileSize;
            ctx.drawImage(img, sx, sy, tileSize, tileSize, x, y, tileSize, tileSize);
          } else {
            ctx.fillStyle = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
          }
        }
      }
      drawCharacters(ctx);
    };

    const drawCharacters = (c: CanvasRenderingContext2D) => {
      for (const ch of characters) {
        const gp = gridPositions[ch.id] ?? { col: ch.col ?? 0, row: ch.row ?? 0 };
        const cx = gp.col * tileSize + tileSize / 2;
        const cy = gp.row * tileSize + tileSize * 0.85;
        c.fillStyle = "#3b82f6";
        c.beginPath();
        c.arc(cx, cy - tileSize * 0.35, tileSize * 0.22, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#1e40af";
        c.fillRect(cx - tileSize * 0.15, cy - tileSize * 0.3, tileSize * 0.3, tileSize * 0.35);
      }
    };

    if (config.tileset) {
      const img = new Image();
      img.onload = () => drawTiles(img);
      img.onerror = () => drawTiles();
      img.src = config.tileset;
    } else {
      drawTiles();
    }
  }, [config, characters, gridPositions, tileSize, sheetCols]);

  return (
    <canvas
      ref={canvasRef}
      className={props.className}
      style={{ imageRendering: "pixelated", display: "block" }}
      aria-hidden="true"
    />
  );
}

export function initialGridPositions(characters?: GameCharacter[]): GridPos {
  const pos: GridPos = {};
  for (const c of characters ?? []) {
    pos[c.id] = { col: c.col ?? 0, row: c.row ?? 0 };
  }
  return pos;
}
