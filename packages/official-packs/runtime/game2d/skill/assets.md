# Assets & licenses — do you need to download? Can you just use them?

## Short answers

| Question | Answer |
|----------|--------|
| Does the Faraday pack ship Kenney PNGs? | **No.** Packs stay small. Only a README lands in `public/assets/game2d/`. |
| Do **you** (or the agent) download assets? | **Yes**, when the lesson leaves grey-box Graphics and needs real sprites/SFX. Drop files into `public/assets/game2d/…`. |
| Can we legally use Kenney packs? | **Yes.** Kenney is **CC0 (public domain)**. Free for commercial/edu use. **Attribution not required** (still nice). You may redistribute. |
| OpenGameArt / itch.io? | **Check each pack.** Mix of CC0, CC-BY, CC-BY-SA, proprietary free. CC-BY ⇒ credit the author in the lesson README. |

## Workflow

1. Prototype with `<pixiGraphics>` (no files) — prove the learning loop.
2. Pick a **CC0** pack from the table below.
3. Download the ZIP from the site (browser) **or** have the authoring agent fetch it if network policy allows.
4. Unzip into:

```text
public/assets/game2d/
  sprites/
  tiles/
  ui/
  audio/
```

5. Reference as Vite public URLs: `/assets/game2d/tiles/…`.
6. If the license is **not** CC0, add a one-line credit in the lesson `README.md`.

You do **not** need to re-host assets on Faraday's npm — lesson `public/` is enough.

## Recommended catalog (prefer CC0)

| Source | License | URL | Notes |
|--------|---------|-----|-------|
| **Kenney.nl** | CC0 | https://kenney.nl/assets | Best default. Platformer, UI, audio, tiny dungeon, etc. |
| Kenney — New Platformer Pack | CC0 | https://kenney.nl/assets/new-platformer-pack | Characters + tiles |
| Kenney — UI Pack | CC0 | https://kenney.nl/assets/ui-pack | Buttons / panels |
| Kenney — Digital Audio | CC0 | https://kenney.nl/assets/digital-audio | SFX |
| Kenney — Tiny Dungeon | CC0 | https://kenney.nl/assets/tiny-dungeon | Top-down RPG-ish |
| **OpenGameArt** | varies | https://opengameart.org | Filter by CC0/CC-BY; verify each page |
| **itch.io Assets** | varies | https://itch.io/game-assets/free | Filter license carefully |
| **Lospec** | palettes / free art | https://lospec.com | Pixel palettes + some free sheets |
| **Game-Icons.net** | CC-BY | https://game-icons.net | Icons — **credit required** |
| **jsfxr / ChipTone** | generated | https://sfxr.me / ChipTone | Prototype SFX you own |

## License cheat sheet

- **CC0** — use, modify, sell, no credit required.
- **CC-BY** — use/modify OK; **must credit** the author.
- **CC-BY-SA** — credit + share alike (derivatives under same license) — awkward for closed lessons; prefer CC0.
- **"Free for educational use only"** — fine for Faraday lessons; don't ship in a paid commercial product without checking.

## What agents should do

- Prefer **Kenney CC0** when inventing a demo.
- Never paste copyrighted Disney/Nintendo art into `public/`.
- Record non-CC0 credits in the lesson README.
- Keep grey-box Graphics until assets are actually on disk (don't break `pnpm build` with missing `/assets/…` paths — or guard with a placeholder texture).
