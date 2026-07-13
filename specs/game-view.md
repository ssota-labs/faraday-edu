# Game view — 유아·초등 게임형 렉쳐 프레젠테이션 (spec)

> 짝 문서: [terminology.md](terminology.md) · [world-seed.md](world-seed.md).
> 상태: **v0.1** — `game-view` 팩 + `assets-2d` / `assets-3d` 스킬 팩.

---

## 1. 문제

| 뷰 | 느낌 | 유아·초등에 맞나 |
|---|---|---|
| **Slide view** | 한 화면 한 비트, prev/next | △ 발표·키오스크엔 OK, **탐험·대사·이동**엔 부족 |
| **Textbook view** | 읽기·자습 | ✗ 유아 |
| **Course shell** (map2d / world3d) | **코스** 안 렉쳐 **간** 이동 | ○ 순서 탐험은 OK, **한 렉쳐 안** 스토리는 별도 |
| **Game view** (신규) | **캐릭터 이동 · 대사 · 장면 전환** | ✓ 유아·초등 CRA |

`kids` 팩은 지금 **SlideDeck + CRA** 프리셋이다. **진짜 게임 루프**(걷기, NPC 대사, 배경 바뀜)는 **렉쳐 프레젠테이션** 층에 `game-view`로 둔다.

---

## 2. 계층 (복습)

```
Lecture
  ├── slide-view      — 압축 슬라이드
  ├── textbook-view   — 자습 텍스트
  └── game-view       — 2D/3D 장면 + 대사 + 이동 (슬라이드 아님)
```

**Course shell** (`map2d`, `world3d`, `world3dRpg`)과 혼동 금지:

- **Course shell** = 여러 렉쳐를 맵에서 고르는 **바깥** 껍데기
- **Game view** = **한 렉쳐**를 플레이하는 **안쪽** 형식

둘 다 쓸 수 있다: 코스 맵에서 렉쳐 진입 → 그 렉쳐가 `<GameView>`.

---

## 3. Game view — 동작 모델 (v0)

### 3.1 비트 시퀀스 (슬라이드가 아님)

한 **장면(scene)** 은 **비트(beats)** 의 스크립트다:

| 비트 | 역할 |
|---|---|
| `scene` | 배경·BGM 힌트 (화면 전환) |
| `move` | 캐릭터 스프라이트 위치 이동 (CSS transition) |
| `dialogue` | 하단 대사창 (VN 스타일, 유아 read-aloud) |
| `wait` | 탭/자동 진행 전 잠깐 멈춤 |
| `interaction` | `<Challenge>` / `<SketchPad>` 등 임베드 |
| `choice` | 분기 (선택지) |

학습자는 **탭(또는 스페이스)** 으로 대사를 넘기고, `move`는 재생 중 애니메이션, `interaction`은 미션 클리어 후 진행.

### 3.2 2D vs 3D

| 티어 | 런타임 | 유아 기본 |
|---|---|---|
| **2D game view** | `<GameView>` (copy-in, Canvas/CSS) | **v0 기본** — 스프라이트·타일·대사 |
| **3D game view** | `three` + `world3dRpgPack` 또는 전용 3D 씬 | v1 — 걸어다니는 3D, 에셋 팩 의존 |

v0는 **2D `<GameView>`** 로 대사·이동·장면전환을 닫고, 3D는 기존 `world3dRpg` + `assets-3d` 스킬로 확장.

### 3.3 Audience

| Audience | 권장 프레젠테이션 |
|---|---|
| **Preschool / 유아 (~3–6)** | **game-view** (2D), 짧은 대사, 큰 탭 타깃, CRA |
| **Children / 초등 (~6–12)** | game-view 또는 slide-view + course shell |
| 그 외 | slide / textbook |

---

## 4. 에셋 팩

[world-seed.md](world-seed.md) §5 티어와 정렬:

| 티어 | 팩 | 내용 |
|---|---|---|
| T0 | `assets-2d`, `assets-3d` | 큐레이션 CC0 카탈로그 + 제작 파이프라인 **스킬** |
| T1 | (에이전트 생성) | procedural `Scene3D` / SVG / AI 스프라이트 |
| T2 | 제작자 | `public/assets/**`, `public/models/**` |
| T3 | 팩 번들 | 공식 팩 `examples/assets/` (추후) |

### 4.1 `assets-2d` (skill + 카탈로그)

- **소스:** Kenney.nl (CC0), OpenGameArt, itch.io CC0 번들
- **생성:** [ybuild-ai/ai-game-art-pipeline-skill](https://github.com/ybuild-ai/ai-game-art-pipeline-skill) (스프라이트 시트·배경·크로마키), Ludo.ai / spritesheets.ai (API·MCP)
- **레슨 경로:** `public/assets/sprites/`, `public/assets/backgrounds/`
- **GameView:** `characters.foo.sprite` → URL

### 4.2 `assets-3d` (skill)

- **소스:** Poly Haven (CC0), Khronos glTF samples, Kenney 3D, NASA 3D
- **생성:** Meshy / Tripo (text→GLB), Sorceress 3D Studio; **procedural-first** (`three` 팩)
- **레슨 경로:** `public/models/*.glb` → `<Model>`
- **2D 폴백:** 3D→스프라이트 시트 (ai-game-art-pipeline, Sorceress 3D-to-2D)

---

## 5. 팩 배치

```
lecture/
  game-view/      # <GameView> runtime + 저작 스킬
  assets-2d/      # 2D 에셋 카탈로그 + 제작 스킬 (skill-only)
  assets-3d/      # 3D 에셋 카탈로그 + 제작 스킬 (skill-only)
  kids/           # audience 프리셋 → game-view + CRA 가리킴
```

---

## 6. 로드맵

| 단계 | 내용 |
|---|---|
| **v0** (done) | `<GameView>` 2D, `game-view` / `assets-2d` / `assets-3d` 팩, 유아 audience |
| **v1** (done) | `playAudio`/`stopAudio`, `celebrate` beat, `interaction` + `useGameInteraction()` |
| **v2** (done) | `tilemap` / `tileWalk` canvas layer (PixiJS는 저자 opt-in) |
| **v3** (template) | `GameView3D.template.tsx` — `three` 팩 설치 후 복사 |
