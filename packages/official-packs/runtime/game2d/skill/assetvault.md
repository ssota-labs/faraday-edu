# AssetVault — installing game art for `game2d`

Faraday **does not vendor** Kenney ZIPs inside the pack (they are large). Instead,
lessons ship with [**AssetVault**](https://github.com/ssota-labs/assetvault) —
`@assetvault/cli` — a CC0-first registry that downloads verified archives from the
project's GitHub Release (`assets` tag), not ad-hoc mirrors.

## Quick start (from lesson root)

```bash
# search the catalog
pnpm exec assetvault search ui
# or the game2d wrapper (same flags, fixed install dir):
node scripts/game2d-assets.mjs search platformer

# install one pack → public/assets/game2d/<pack-folder>/
pnpm exec assetvault add kenney/ui-pack --to public/assets/game2d
node scripts/game2d-assets.mjs add kenney/ui-pack

# batteries-included starter set (see public/assets/game2d/recommended.json)
node scripts/game2d-assets.mjs starter

# integrity check after clone / CI
node scripts/game2d-assets.mjs verify
```

Lock file: `public/assets/game2d/assetvault.lock.json` (commit it when assets are
part of the lesson deliverable).

## URL convention

AssetVault unpacks each pack as a **top-level folder** under `public/assets/game2d/`:

```text
public/assets/game2d/
  ui-pack/PNG/Grey/Default/button_square_depth_flat.png
  platformer-characters/...
  pixel-platformer/...
  assetvault.lock.json
  recommended.json
```

In Pixi / Howler / `<Tilemap tileset="…">`, reference Vite public URLs:

```ts
import { game2dAsset } from "../game2d";

const btn = game2dAsset("ui-pack/PNG/Grey/Default/button_square_depth_flat.png");
// → /assets/game2d/ui-pack/PNG/Grey/Default/button_square_depth_flat.png
```

## Recommended starter packs

Listed in `public/assets/game2d/recommended.json` (copied on `pack add game2d`):

| AssetVault id | Use |
|---------------|-----|
| `kenney/ui-pack` | buttons, panels |
| `kenney/platformer-characters` | character sprites |
| `kenney/pixel-platformer` | platform tileset |
| `kenney/digital-audio` | SFX |
| `kenney/tiny-dungeon` | optional top-down tiles |

Run `node scripts/game2d-assets.mjs starter` to install all CC0 packs above.

## Agent workflow

1. **Grey-box first** — prove the learning loop with `<pixiGraphics>` (no files).
2. **`assetvault search <topic>`** — pick a **CC0** pack (`info` shows license).
3. **`game2d-assets add <id>`** — install before referencing paths in code.
4. **Use `game2dAsset()`** — never hardcode lesson-relative paths.
5. **Don't break build** — guard sprite loads until files exist, or keep Graphics fallback.
6. **Non-CC0** — pass `--accept-license` and credit the author in the lesson README.

## CLI reference

```bash
npx @assetvault/cli search <query> [--license CC0] [--tag tileset] [--json]
npx @assetvault/cli info <id>
npx @assetvault/cli add <id> --to public/assets/game2d [--force]
npx @assetvault/cli verify [lockfile]
```

Home: https://github.com/ssota-labs/assetvault · npm: `@assetvault/cli`
