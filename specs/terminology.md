# Faraday 핵심 용어 (terminology spec)

> 상태: **동결 (v0.2)**. 팩 구조 개편·런타임 리네임의 SSOT.
> 짝 문서: [curriculum-workspace.md](curriculum-workspace.md) · [module-packs.md](module-packs.md) ·
> [world-seed.md](world-seed.md).

---

## 1. 계층

```
Curriculum (커리큘럼)          ← 가장 상위. 학문·프로그램 단위
  └── Course (코스)              ← 렉쳐 모음 + 순서·의존성
        └── Lecture (렉쳐)         ← 주제 1단위 + 공통 outcome
              └── Presentation     ← 렉쳐 소비 방식 (학습자가 선택)
                    ├── SlideView
                    ├── TextbookView
                    └── GameView? (audience별)
                          └── Mode: 일반 보기 | 자유 모드 (각 뷰 컴포넌트 소유)
```

**두 종류의 「탐색/표현」을 구분한다:**

| 구분 | 용어 | 범위 | 예 |
|---|---|---|---|
| **코스 셸** (course shell) | 코스 안 **렉쳐 간** 탐색 | Course | 16주 목록, 2D 맵, 3D 월드 |
| **렉쳐 프레젠테이션** | **한 렉쳐** 소비 방식 | Lecture | 슬라이드 뷰, 텍스트북 뷰 |

---

## 2. 정의

### Curriculum — 커리큘럼

학문·프로그램·도메인을 포괄하는 **가장 상위** 단위. 여러 코스·트랙을 담을 수 있다.
앱(`faraday new`)·플랜(`.faraday/plan/`)이 이 층에 해당한다.

### Course — 코스

**렉쳐의 모음** + 순서·선행 관계·(선택) 언락. 「일반물리학」처럼 부르는 단위.
학습자는 코스 셸(목록·맵)로 다음 렉쳐를 고른다.

### Lecture — 렉쳐

**주제 1단위.** 공통 수업 목표·학습 결과(outcome)가 있다. 「16주차 중 1주」.
렉쳐에 들어가면 **프레젠테이션 뷰 탭**(슬라이드 / 텍스트북 / …)을 선택한다.
제작 단위: `src/lesson/lectures/<id>/` (또는 전환기 `nodes/<id>.tsx`).

### Presentation — 프레젠테이션 (렉쳐 뷰)

| 뷰 | 느낌 | 용도 |
|---|---|---|
| **SlideView** | 발표·강의, 화면당 한 비트 | 수업 따라가기, 압축 전달 |
| **TextbookView** | 교재·A4, 조밀한 전개 | 자습, 스크롤·검색 |
| **GameView** | 탐험·몰입 | 아동 등 audience 프리셋 |

각 뷰는 **일반 보기**(콘텐츠 소비)와 **자유 모드**(전체 축소 조망 + 필기)를 스스로 제공한다.
인터랙티브(시뮬, 그래프, 퀴즈)는 모든 뷰에 들어갈 수 있다.

### Course shell — 코스 셸

코스 안에서 렉쳐 간 이동 UI. 팩 카테고리 `course/`:

- `linear` — 목록형 (런타임 내장 `linearPack`)
- `map2d` — 2D 맵
- `world3d` — 3D 월드 (`three` 팩)

---

## 3. 코드·문서 매핑 (마이그레이션)

| 새 용어 | 이전 (레거시) | 비고 |
|---|---|---|
| Curriculum (상위) | 앱·플랜 | 타입 없음, 문서만 |
| Course | `Curriculum` 타입, `<Course>` (→ `LinearCourse`), `CourseHost` | Phase 4 완료; deprecated aliases 유지 |
| Lecture | `CurriculumNode`, `nodes/<id>.tsx`, `<Lesson>` | |
| SlideView | `deck` 팩 | → `slide-view`, `<SlideDeck>` |
| TextbookView | (없음) | `textbook-view` 팩 |
| Course shell | `curriculum/` 팩, `linearPack`, `map2d` | → `course/` |
| SRS `deckId` | 변경 없음 | 플래시카드 덱 — 슬라이드와 무관 |

---

## 4. 팩 폴더 (`official-packs/`)

```
official-packs/
├── course/           # 코스 셸 — 렉쳐 간 탐색
│   └── map2d/
├── lecture/          # 렉쳐 — 프레젠테이션·도구
│   ├── slide-view/   # (구 deck)
│   ├── textbook-view/
│   ├── notes/
│   ├── srs/
│   ├── exam/
│   └── storybook-game2d/
├── runtime/          # three, tutor
└── methodology/      # audience, lecture-design
```

CLI 카테고리: `course` · `lecture` · `runtime` · `methodology`.

---

## 5. 저자·에이전트에게 숨기는 구현명

설계·스킬 문서에서는 아래를 **직접 언급하지 않는다** (구현 디테일):

- `<SlideDeck>` — 슬라이드 뷰 일반 모드 엔진 (`Paged` deprecated)

---

## 6. 마이그레이션 페이즈

| Phase | 내용 |
|---|---|
| 0 | 이 문서 + 관련 스펙 갱신 |
| 1 | 팩 폴더 재배치, `deck` → `slide-view`, `deck` CLI alias |
| 2 | `<Paged>` → `<SlideDeck>`, `Paged` deprecated re-export |
| 3 | `textbook-view` 팩, `<Lecture>` 셸 (뷰 탭) |
| 4 | `Curriculum*` → `Course*` 타입·`CourseHost` 리네임 (완료) |
