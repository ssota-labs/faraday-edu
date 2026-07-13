# Tilemaps

`<Tilemap>` draws a row-major grid from one tileset image:

```tsx
<Tilemap
  tileset="/assets/game2d/tiles/tilesheet.png"
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
- Put sheets under `public/assets/game2d/tiles/` (see [assets.md](assets.md))

For huge open maps or chunk streaming, graduate to `@pixi/tilemap` later — don't
start there for a Faraday lesson.
