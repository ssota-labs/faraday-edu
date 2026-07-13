# Tilemaps

`<Tilemap>` draws a row-major grid from one tileset image:

```tsx
import { Tilemap, game2dAsset } from "../game2d";

<Tilemap
  tileset={game2dAsset("pixel-platformer/Tiles/tilesheet.png")}
  tileWidth={16}
  tileHeight={16}
  data={[
    [0, 1, 1, 2],
    [0, -1, -1, 2],
  ]}
/>
```

- `-1` / `null` = empty cell
- Indices are left-to-right, top-to-bottom in the sheet
- Install tilesets with `node scripts/game2d-assets.mjs add kenney/pixel-platformer` (see [assetvault.md](assetvault.md))

For huge open maps or chunk streaming, graduate to `@pixi/tilemap` later — don't
start there for a Faraday lesson.
