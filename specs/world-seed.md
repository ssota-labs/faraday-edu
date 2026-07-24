# 커리큘럼 / 월드 씨앗 — 설계 (spec, draft)

> 짝 문서: [vision](../docs/content/docs/vision.mdx)(아키텍처) ·
> [gtm](../docs/content/docs/planning/gtm.mdx)(고객). Historical STEM stack note.
> 목적: 낱개 레슨을 **탐험 가능한 커리큘럼**으로 묶되, 선형 코스부터 자유도 높은 게임
> 월드까지를 **갈아끼우는 스킬팩(헥사고날)**으로 지원한다. 코어는 고정, 월드는 어댑터.

---

## 0. 두 가지 원칙 (이 스펙을 관통)

1. **Stage 1은 콘텐츠·학습 UX를 수평 검증한다.** 인프라는 MCP/CLI + BYOK + 자동배포로 얇게
   가되, 커리큘럼/월드 · 로컬 LMS · 튜터AI까지 사용 가능한 흐름을 닫는다. 플랫폼 스테이지는
   제작 마찰을 제거하고 인증·서버 정본·공식평가·결제 같은 다사용자 신뢰 인프라를 추가한다.
2. **월드는 헥사고날로 agnostic하게 갈아끼운다.** 코어(진행·상태·레슨임베딩·LMS/튜터 훅)는
   프레젠테이션을 모른다. 2D/3D/비게임은 포트에 꽂히는 **스킬팩 어댑터**. 다른 제작자의 팩을
   그대로 갈아끼울 수 있다 → Stage 4 팩 마켓의 기반.

---

## 1. 헥사고날 구조

```
                    ┌───────────────────────────────┐
   Driving          │      CURRICULUM CORE          │      Driven
   (사람/에이전트)   │  (잠긴 런타임, 프레젠테이션    │   (갈아끼우는 스킬팩)
                    │   agnostic)                   │
  authoring ───────▶│  · 커리큘럼 그래프(노드+엣지)  │◀─ WorldPack 포트 ─┐
  (curriculum.ts,   │  · 진행 엔진(locked/available/ │                   │
   world.config)    │    complete, 언락 규칙)        │   ┌─ pack-linear (비게임, =Course)
                    │  · 학습자 상태/세이브/재개      │   ├─ pack-map2d  (2D 맵/보드)
  student play ────▶│  · 이벤트 out(enter/complete/  │   ├─ pack-world3d(R3F 3D 월드)
                    │    pass/xp)                    │   └─ pack-tree   (스킬트리/그래프)
                    │  · 훅: LMS / 튜터AI            │◀─ AssetProvider 포트 ─┐
                    └───────────────────────────────┘   (공통 에셋/procedural/…)
```

- **코어는 팩을 모른다.** 그래프 + 진행상태를 주고 `navigate(nodeId)`/`enterLesson(nodeId)`
  인텐트를 받을 뿐. (우리 `Scene3D`가 렌더만 하고 상태/물리는 밖에 있는 것과 같은 분리.)
- **팩은 진행 로직·상태를 소유하지 않는다.** 오직 (a) 월드를 자기 스타일로 렌더, (b) 표준
  컨트롤 표면 노출, (c) 입력 → 네비게이션 인텐트 변환.

---

## 2. 코어 (잠금)

- **커리큘럼 그래프**: `Node`(레슨 호스트 or 관문/평가) + `Edge`(선행/경로). 팩-agnostic.
- **진행 엔진**: 노드 상태(잠김/가능/진행중/완료), 언락 규칙(선행 완료·평가 통과·XP 임계).
- **학습자 상태**: 진행/세이브/재개. (Stage1: 로컬/파일 → 플랫폼: 중앙 LMS DB)
- **이벤트 아웃**: `nodeEntered / lessonCompleted / assessmentPassed / xpGained …`
  → LMS(진행 집계)와 튜터AI("지금 어디, 무엇을 했나" 컨텍스트)가 구독.

---

## 3. 포트 (계약)

- **`WorldPack`** (갈아끼우는 어댑터): `render(graph, progress, { onNavigate, onEnterLesson })`.
  진행 로직 금지 — 렌더 + 인텐트만.
- **`AssetProvider`**: 에셋 참조 → 실제 에셋 해석(§5의 티어). 팩 간 공유.
- **`ControlSurface`** (표준): 우리 Workbench/플로팅 패널 + 표준 HUD를 재사용. 팩은 이 안을
  채운다(§4).

> 헥사고날의 핵심: 팩은 **같은 포트**에 꽂히므로 `pack: "world3d" → "map2d"`를 콘텐츠 수정
> 없이 갈아끼울 수 있다.

---

## 4. 표준 컨트롤 / 패널 / HUD (공통 규격)

우리 `Workbench` + `ControlGroup` 플로팅 패널을 **모든 팩이 공유하는 표준 표면**으로. 규격
슬롯(팩이 메커니즘을 채움):

- **Progress HUD**: 완료/전체 노드, 현재 목표, XP/퀘스트 상태
- **Navigation**: 맵/카메라/텔레포트 (팩이 방식 결정)
- **Journal/Inventory** (옵션): 수집물·노트
- **Settings**: 무드·a11y

> 셸과 LMS/튜터 연동점은 표준 → 팩이 뭐든 UX 일관성 + 통합 지점 안정.

---

## 5. 에셋 전략 (점진적)

- **T0 공통 라이브러리**: 큐레이션 CC0(아이콘·타일·스프라이트·프리미티브·fox식 GLB). 팩 agnostic.
- **T1 에이전트 생성**: procedural(우리 Scene3D 헬퍼, 에이전트가 그리는 SVG 스프라이트/타일맵).
- **T2 제작자 에셋**: `public/`에 GLB·이미지 투입.
- **T3 팩 번들 에셋**: 팩이 자기 아트를 동봉.

> **T0+T1부터(자주 쓰이는 + 에이전트가 만들 수 있는 것)** 시작 → 간단한 three.js/웹 게임엔진으로 고도화.

---

## 6. 게임 엔진 진행 (팩 내부에 캡슐화)

- 지금: **R3F(+Rapier)** = 3D 팩 / **SVG·Canvas** = 2D 팩. 무거운 엔진 없음.
- 다음: R3F+Rapier 위 얇은 "월드 키트"(이동·포탈·미니맵) = `pack-world3d` 내부 / Canvas·Pixi
  2D 키트 = `pack-map2d` 내부.
- **엔진 선택은 팩(어댑터) 안**에 있다 → 코어는 agnostic, 팩은 swap 가능.

---

## 7. 제작자가 저작하는 것

- **`curriculum.ts`**: 그래프. `Node{ id, title, lesson, unlock, reward }` + `Edge`. 팩-agnostic.
- **`world.config.ts`**: `{ pack: "world3d", mood/theme, assets, layout hints }` — 팩 선택 + 팩별 설정.
- **레슨**: 우리가 이미 만드는 Faraday 레슨.
- 코어가 `curriculum.ts` + 진행상태를 읽고, 선택된 팩이 렌더.

---

## 8. 퀄리티 게이트 (월드 티어)

- **도달성**: 고아/도달불가 노드 없음.
- **진행 건전성**: 데드락 없음, 완주 가능.
- **팩 계약 준수**: 팩이 `WorldPack` 포트를 올바르게 구현(진행 로직 미소유, 인텐트만).
- **성능 / a11y**: 3D에서도 키보드 네비 가능.

---

## 9. Stage 1 적용 (콘텐츠·학습 UX 완결)

- 팩 **최소 2종** 동봉: `pack-linear`(보유, =`<Course>`) + 게임 팩 1종(`pack-map2d` 또는
  `pack-world3d`) → "게임형 커리큘럼"이 기능적으로 존재.
- **swap 아키텍처를 지금 세팅** → Stage 4 팩 마켓은 "팩 저작·판매를 여는 것"으로 축소된다.
- LMS·튜터 훅을 코어 이벤트로 지금 뚫어둠 → 같은 Stage 1 안에서 LMS/튜터도 수평으로 닫힘.

---

## 10. v2 계약 확장 — 게임형 팩용 seam (동결)

`pack-world3d-rpg`(WASD 아바타·물리·근접 진입) 프로토타입에서 **정말 게임같은 팩**이 필요로 한
seam이 드러나 `WorldPackProps`에 추가·동결했다. 원칙: **제네릭하게** — 코어는 "플레이어·인벤토리"가
뭔지 끝까지 모른다.

- **`onComplete(nodeId)`** — 레슨 없이 **게임플레이로** 노드 완료(스킬체크·보스·체크포인트).
- **`onReward(xp)`** — 애드혹 XP(수집물·보너스).
- **`packState` / `setPackState(state)`** — 코어가 저장하지만 **해석하지 않는 opaque 블롭**
  (아바타 위치·인벤토리·퀘스트 플래그·타이머). 이게 있어야 게임 팩이 월드↔레슨 토글을 넘어
  실제 상태를 유지할 수 있고, 코어는 여전히 agnostic. (localStorage에 `progress`와 함께 영속.)

> 검증: `world3dRpgPack`이 `packState`에 아바타 위치를 저장/복원하며 같은 코어/포트 위에서
> 걸어다니는 3D 월드로 렌더됨(빌드·타입체크 통과). 실시간 이동은 foreground 브라우저 필요(프리뷰
> 탭은 hidden → rAF 스로틀).

아직 안 넓힌 seam(스펙만): **`renderLesson(nodeId)` 슬롯** — 레슨을 화면 전체 전환이 아니라
월드 안 오버레이/대화창으로 띄우기(NPC 대화식). v3 후보.

## 11. 미결정 / 다음

1. `curriculum.ts` 선언 API 확정(노드/엣지/언락 DSL) — mirror-dimension `defineBlueprint` 참고.
2. 세이브/진행 상태 저장소 추상화(Stage1 파일 ↔ 플랫폼 DB) 포트화 — 이미 `useCurriculumState`가 seam.
3. `renderLesson` 슬롯(v3) — 인월드 레슨.
4. 팩을 스킬로 패키징하는 규격(메타-스킬) — VISION §3a와 연결. (마켓 seam)
