# 커리큘럼 워크스페이스 — 레포/앱/플랜 모델 + 오케스트레이션 (spec)

> 짝 문서: [terminology.md](terminology.md)(핵심 용어 SSOT) ·
> [world-seed.md](world-seed.md)(코스 코어·셸 어댑터) ·
> [module-packs.md](module-packs.md)(CLI 팩).
> 목적: **큰 커리큘럼을 long-running task로 안전하게 제작**한다 — 계획을 파일로
> 영속화하고, 렉쳐를 파일 단위로 격리해 서브에이전트가 병렬로 만들 수 있게 한다.

---

## 0. 문제

설계(Discover→Curriculum→Learning path)는 촘촘한데, **"12개 렉쳐를 실제로 만들어
나가는 실행 단계"** 가이드가 없었다. 한 컨텍스트에서 다 만들면 컨텍스트가 오염되고,
계획을 영속화하지 않아 재시작이 불가능했다. 또 "world"가 커리큘럼 전체를 뜻하는 것처럼
오용됐다(코어는 이미 `Curriculum*`, "world"는 프레젠테이션 한 종류).

## 1. 컨테인먼트 (3단)

- **레포 : 앱 = 1:N** — 도메인이 다른 독립 프로젝트들. 예: `general-physics`(학부),
  `elementary-physics`(초등)은 audience·방법론·팩이 다른 **별개 앱**. 서로 import/iframe
  하지 않고, 링크로만 연결.
- **앱 : 플랜 = 1:N** — 플랜(커리큘럼/트랙)은 **앱 안**에 산다. 한 앱이 여러 플랜 보유 가능.
- **플랜 : 렉쳐(파일) = 1:N** — 렉쳐는 `src/lesson/nodes/<id>.tsx` 파일 1개.

```
repo/
  AGENTS.md                         # faraday init 이 배치 (레포 계약)
  apps/
    <app>/                          # faraday new — 독립 vite 프로젝트 = 1 커리큘럼
      .faraday/
        packs/                      # 이 앱의 팩 (audience, lecture-design + 런타임 팩)
        provenance.json
        plan/                       # ← 플랜은 앱 안. 여러 개 가능
          index.md
          <plan-id>/
            overview.md             # 브리프·audience·방법론·팩결정·노드 테이블(status)
            nodes/<id>.md           # 노드=파일: outcome·interaction·check·source·status
      src/lesson/
        lesson.tsx                  # 고정 엔트리 = 모듈스코프 curriculum 조립 (오케스트레이터 소유)
        nodes/<id>.tsx              # 렉쳐 = 파일 (서브에이전트 소유, 격리 단위)
```

## 2. 커맨드 (`packages/cli`)

- **`faraday init <first-app>`** — 레포 부트스트랩: 루트 `AGENTS.md` + `apps/<first-app>/`
  스캐폴드(내부적으로 `new` 1회). 설계는 팩을 읽으므로 **스캐폴드가 선결**.
- **`faraday new <name>`** — 앱 증분 추가. 레포 루트(=`apps/` 보유 디렉토리)에서 실행하면
  `apps/<name>/`, 그 외에는 `<name>/` 단독(하위호환).
- 각 앱은 `.faraday/plan/`을 갖고 스캐폴드된다(빈 `index.md` 스텁).

## 3. 파일 충돌 봉쇄 (소유권 규칙)

| 주체 | 소유·기록 |
|---|---|
| 서브에이전트(노드당) | `src/lesson/nodes/<id>.tsx` + `.faraday/plan/<plan>/nodes/<id>.md` status |
| 오케스트레이터 | `src/lesson/lesson.tsx`(모듈스코프 `curriculum` 조립), `overview.md`, `plan/index.md` |

module-scope여야 하는 건 `curriculum` **객체 리터럴**뿐(진행 상태가 identity로 키잉 —
[world-seed.md](world-seed.md)). 렉쳐 컴포넌트는 파일에서 import. 두 서브에이전트가 같은
파일을 쓰지 않으므로 병렬 fan-out이 안전. 앱끼리는 별개 프로젝트라 상위 격리는 자동.

## 4. 오케스트레이션 루프

1. `init`/`new` (스캐폴드 선결) → 팩(audience/lecture-design) 읽고 설계.
2. 로드맵 sign-off → `.faraday/plan/<plan-id>/` 작성(overview + nodes/<id>.md 브리프, status: todo).
3. 프레젠테이션 셸 먼저 stub 노드로 조립(맵·언락 확인) → 노드마다 **clean-session 서브에이전트**
   (faraday-author)에 **해당 노드 브리프만** 전달 → 렉쳐 파일 1개 작성·검증 → status 갱신.
4. tier 체크포인트: `pnpm check` + 프레젠테이션 화면 실구동(시각 MUST는 HTTP 200으로 못 잼).
5. **재개**: 새 세션/리셋 후 plan 폴더 읽고 첫 todo/building 노드부터. 계획이 메모리, 채팅이 아님.

스킬 문서: [orchestration.md](../plugins/claude-code/skills/faraday/references/orchestration.md).

## 5. 용어 & 코스 셸 모델

용어 SSOT: [terminology.md](terminology.md). 요약:

- **Curriculum** (상위) → **Course** (렉쳐 모음) → **Lecture** (주제 단위) → **Presentation**
  (슬라이드 뷰 / 텍스트북 뷰 / 게임 뷰).
- **코스 셸** = 코스 안 렉쳐 간 탐색 (`course/` 팩: `map2d`, `linear`). 렉쳐 **안**의 슬라이드·
  텍스트북 뷰와 혼동하지 않는다.
- **팩 카테고리:** `course/` · `lecture/` · `runtime/` · `methodology/`.
- **내부 배관(작가 안 보임):** `CourseHost`(구 `CourseHost`)가 진행·언락·상태를 소유하고,
  코스 셸 팩이 탐색 UI를 꽂는다.

## 6. 두 스킬 세트 동일화

claude-code / codex 스킬은 `references/**`를 **byte-identical**로 유지한다(claude-code 정본).
`scripts/sync-skills.mjs`(mirror / `--check`)가 SSOT, `stage1-cold-e2e`가 CI 가드. `SKILL.md`는
per-agent overlay(codex `$faraday` 안내 / claude-code 슬래시 명령·deploy 동사)만 다르다.
audience/lecture-design 지식 SSOT = `packages/official-packs/*/skill/`(codex의 인라인
audience.md/pedagogy.md는 제거하고 팩으로 통일).

## 7. Phase 3 상태

- **프레젠테이션 = 팩 (완료).** `map2d`를 base 런타임에서 빼고 **copy-in opt-in 팩**
  (`packages/official-packs/course/map2d/`)으로 분리했다. `faraday pack add map2d` →
  `src/lesson/map2d/`로 복사, `import { map2dPack } from "./map2d"`. `linearPack`은
  런타임 내장 fallback으로 유지, `world3dPack`은 `three` 팩. 코어 `CourseHost` + port는
  런타임 유지(배관). map2d는 default:false — 프레젠테이션은 하나만 고르는 opt-in이라
  batteries-included 9개 default에서 예외(테스트 `OPT_IN_PACKS`로 명문화). 작가용 문서
  (worlds.md/packs.md/SKILL.md)에서 프레젠테이션을 "설치하는 팩"으로 표현. labs는 프리뷰용
  로컬 복사본(`apps/labs/src/pack-map2d.tsx`) 유지.
- **LMS/진행률 경계 (미결)** — 앱↔렉쳐가 링크로만 연결될 때: (A) 월드가 유일 상태 소유자 +
  완료 토큰, (B) 공유 스토리지 키 스키마. 런타임 단계에서 결정.
- **`new` 앱 위치** — 현재 `apps/<name>/` 기본값. 레포 루트 직속 옵션은 미도입.
