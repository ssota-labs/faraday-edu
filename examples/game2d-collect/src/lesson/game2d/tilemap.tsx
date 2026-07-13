import { useEffect, useMemo, useState } from "react";
import { Assets, Rectangle, Texture } from "pixi.js";
import { extendGame2D } from "./extend";

extendGame2D();

export type TilemapProps = {
  /** Row-major grid of tileset indices; -1 / null = empty. */
  data: (number | null)[][];
  /** Path or URL to a tileset image (loaded via Pixi Assets). */
  tileset: string;
  tileWidth: number;
  tileHeight: number;
  /** Columns in the tileset image. Inferred from texture width if omitted. */
  tilesetColumns?: number;
  x?: number;
  y?: number;
};

/**
 * Simple educational tilemap — draws each non-empty cell as a sprite from a
 * single tileset sheet. Prefer this over a heavy tilemap plugin for Faraday
 * lessons. For huge maps, swap to @pixi/tilemap later.
 */
export function Tilemap({
  data,
  tileset,
  tileWidth,
  tileHeight,
  tilesetColumns,
  x = 0,
  y = 0,
}: TilemapProps) {
  const [base, setBase] = useState<Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBase(null);
    Assets.load<Texture>(tileset).then((tex) => {
      if (!cancelled) setBase(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [tileset]);

  const cols = useMemo(() => {
    if (!base) return 1;
    return tilesetColumns ?? Math.max(1, Math.floor(base.width / tileWidth));
  }, [base, tilesetColumns, tileWidth]);

  if (!base) return <pixiContainer x={x} y={y} />;

  return (
    <pixiContainer x={x} y={y}>
      {data.map((line, row) =>
        (line ?? []).map((idx, col) => {
          if (idx == null || idx < 0) return null;
          return (
            <TileCell
              key={`${row}-${col}-${idx}`}
              base={base}
              index={idx}
              cols={cols}
              tileWidth={tileWidth}
              tileHeight={tileHeight}
              x={col * tileWidth}
              y={row * tileHeight}
            />
          );
        }),
      )}
    </pixiContainer>
  );
}

function TileCell({
  base,
  index,
  cols,
  tileWidth,
  tileHeight,
  x,
  y,
}: {
  base: Texture;
  index: number;
  cols: number;
  tileWidth: number;
  tileHeight: number;
  x: number;
  y: number;
}) {
  const frame = useMemo(() => {
    const sx = (index % cols) * tileWidth;
    const sy = Math.floor(index / cols) * tileHeight;
    return new Texture({
      source: base.source,
      frame: new Rectangle(sx, sy, tileWidth, tileHeight),
    });
  }, [base, index, cols, tileWidth, tileHeight]);

  return <pixiSprite texture={frame} x={x} y={y} />;
}
