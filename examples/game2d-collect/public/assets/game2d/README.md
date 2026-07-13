# game2d assets — AssetVault

This folder is created by `faraday pack add game2d` as `public/assets/game2d/`.

**Nothing is vendored in the pack.** Install CC0 art with
[**AssetVault**](https://github.com/ssota-labs/assetvault) (`@assetvault/cli`):

```bash
# one pack
node scripts/game2d-assets.mjs add kenney/ui-pack

# starter bundle (UI + characters + tiles + SFX — see recommended.json)
node scripts/game2d-assets.mjs starter

# search the catalog
pnpm exec assetvault search dungeon
```

Files land here:

```text
public/assets/game2d/
  ui-pack/…
  platformer-characters/…
  assetvault.lock.json
  recommended.json
```

Use in code: `game2dAsset("ui-pack/PNG/…")` → `/assets/game2d/ui-pack/PNG/…`

Full guide: `.faraday/packs/game2d/assetvault.md`
