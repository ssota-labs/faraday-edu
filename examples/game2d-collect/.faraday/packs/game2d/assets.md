# Assets & licenses — AssetVault workflow

## Short answers

| Question | Answer |
|----------|--------|
| Does the Faraday pack ship Kenney PNGs? | **No.** Packs stay small. AssetVault installs archives into `public/assets/game2d/`. |
| How do I get assets? | **`@assetvault/cli`** (devDependency). See [assetvault.md](assetvault.md). |
| Can we legally use Kenney packs? | **Yes.** AssetVault catalogs CC0 Kenney packs. `info <id>` shows license + source. |
| Manual ZIP download still OK? | Yes, but prefer AssetVault — verified SHA-256 + lock file. |

## Workflow

1. Prototype with `<pixiGraphics>` (no files) — prove the learning loop.
2. Search: `node scripts/game2d-assets.mjs search platformer` (or `pnpm exec assetvault search …`).
3. Install: `node scripts/game2d-assets.mjs add kenney/ui-pack`  
   Or install the starter bundle: `node scripts/game2d-assets.mjs starter`
4. Reference URLs via `game2dAsset("ui-pack/PNG/…")` from `src/lesson/game2d`.
5. Commit `public/assets/game2d/assetvault.lock.json` when assets ship with the lesson.
6. Non-CC0 packs need `--accept-license` + a credit line in the lesson README.

Full CLI guide: **[assetvault.md](assetvault.md)**

## Legacy / other sources

AssetVault is the **default** path. For packs not yet in the registry:

| Source | License | URL |
|--------|---------|-----|
| **Kenney.nl** (direct) | CC0 | https://kenney.nl/assets |
| **OpenGameArt** | varies | https://opengameart.org |
| **itch.io Assets** | varies | https://itch.io/game-assets/free |
| **Game-Icons.net** | CC-BY | https://game-icons.net — credit required |

## License cheat sheet

- **CC0** — use, modify, sell, no credit required.
- **CC-BY** — use/modify OK; **must credit** the author.
- **CC-BY-SA** — credit + share alike — awkward for closed lessons; prefer CC0.

## What agents should do

- Run **`game2d-assets starter`** or **`add`** before referencing sprite paths.
- Prefer **CC0** packs from AssetVault search results.
- Never paste copyrighted franchise art into `public/`.
- Keep grey-box Graphics until assets are on disk (don't break `pnpm build`).
