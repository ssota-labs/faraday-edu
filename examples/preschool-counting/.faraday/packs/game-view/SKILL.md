# Pack: `game-view` — 2D game presentation (index)

Load when a lecture (especially **preschool / 유아 ~3–6** or young elementary) should
feel like a **small game**: characters move, dialogue appears, backgrounds change —
**not** a slide deck and not a scrolled page.

## When it fits

- 유아·저학년: 짧은 대사, 큰 탭 타깃, CRA (만지기 → 그림 → 기호)
- 스토리로 개념을 전달 (NPC가 설명, 아이가 캐릭터를 움직임)
- `slide-view`는 **한 장 한 장**; `game-view`는 **연속 장면 + 이동**

## When it doesn't

- 성인·자습·긴 전개 → `textbook-view`
- 발표용 압축 슬라이드 → `slide-view`
- **코스 전체** 맵 탐험만 → `course/map2d` or `three` (course shell)

## Build surface

```tsx
import { Lecture } from "@faraday-academy/runtime/blocks";
import { GameView } from "./game-view";

<Lecture
  title="Count the apples"
  views={[
    {
      id: "game",
      label: "Play",
      content: (
        <GameView
          storageKey="apple-count-v1"
          startSceneId="meadow"
          scenes={[
            {
              id: "meadow",
              characters: [
                { id: "kid", sprite: "/assets/sprites/kid.png", x: 15, y: 72 },
                { id: "bear", sprite: "/assets/sprites/bear.png", x: 75, y: 70 },
              ],
              beats: [
                { type: "scene", background: "/assets/backgrounds/meadow.png" },
                { type: "dialogue", speaker: "Bear", text: "How many apples do you see?" },
                { type: "move", characterId: "kid", x: 40, y: 72 },
                { type: "dialogue", speaker: "You", text: "Let me count!" },
                // { type: "interaction", content: <Challenge … /> },
              ],
            },
          ]}
        />
      ),
    },
  ]}
/>
```

### Beat types

| type | role |
|---|---|
| `scene` | Background image/color — screen transition |
| `move` | Animate character to x/y (0–100%) |
| `dialogue` | Bottom text box — tap/Space to advance |
| `wait` | Brief pause |
| `interaction` | Embed `<Challenge>`, `<SketchPad>`, etc. |
| `choice` | Branching buttons |

## Assets

Install **`assets-2d`** (auto-required). Put sprites in `public/assets/sprites/`,
backgrounds in `public/assets/backgrounds/`. See `.faraday/packs/assets-2d/`.

## Quality

See [../quality.md](../quality.md).
