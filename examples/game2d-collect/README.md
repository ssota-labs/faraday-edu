# Collect the shapes (`game2d-collect`)

Minimal **game2d** + **AssetVault** example: move a Kenney platformer character to
catch falling shapes and complete a counting `<Challenge>`.

## Setup

From this folder:

```bash
pnpm install
node scripts/game2d-assets.mjs add kenney/platformer-characters
node scripts/game2d-assets.mjs add kenney/ui-pack
```

Kenney packs are CC0. Downloaded assets live under `public/assets/game2d/` and are
git-ignored — only `recommended.json` and `README.md` are tracked.

## Run

```bash
pnpm dev
```

Then open the URL Vite prints (or `pnpm preview` on port 4173 after `pnpm build`).

## Verify

```bash
pnpm typecheck
pnpm check
```

Without assets, the lesson still runs using colored shape fallbacks.
