# Faraday — GTM Stage 1 런칭 계획

> 기준일: **2026-07-12** (갱신) · 짝 문서: [GTM.md](GTM.md) · [VISION.md](VISION.md) · [DEMO-IDEATION.md](DEMO-IDEATION.md)
>
> **한 줄:** Stage 1 “배포” = **스킬(플러그인) + npm 패키지 스위트**를 얼리어답터 제작자 손에 넣는 것.
> 유저는 콘텐츠로 유입되고, Claude Code / Codex에서 스킬을 설치·테스팅하며,
> 결과물은 **데모 링크**로 보여준다.

---

## 0. 2026-07-12 현황 스냅샷 (centralize 이후)

| 자산 | 상태 | 런칭 함의 |
|---|---|---|
| 모노레포 `@faraday-academy/{cli,runtime,three,tutor}` | ✅ PR #10 merge | **CLI만 publish하면 안 됨** — 레슨이 런타임을 npm pin |
| 스킬/플러그인 (Claude + Codex) | ✅ URL → `ssota-labs/faraday-academy` | 설치 스모크는 클린 Claude/Codex 세션에서 확인 |
| `examples/voyage-log` (C-B) | ✅ 6노드 + `vercel.json` | 라이브 URL 없음 · Vercel install은 npm 패키지 필요 |
| 단편 데모 S1–S4 | ❌ 미작성 | 콘텐츠 Wow 앵커 부족 |
| npm `@faraday-academy/*` | ❌ registry 404 | 외부 `npx` / 예제 Vercel / 콜드 세션 전부 막힘 |
| `faraday deploy` | ❌ 미구현 | 런칭 우회: `pnpm build` + Vercel/static |

**런칭 정의는 유지.** 인프라/플랫폼은 Stage 2+. 오늘 목표는 soft launch 퍼널이 **실제로 끊기지 않게** 만드는 것.

---

## 1. Stage 1 런칭 정의

### 성공 정의 (Launch Done)
외부 제작자 1명이 **콘텐츠를 보고** → **Claude Code 또는 Codex에 Faraday 스킬을 설치**하고 → **자기 주제 레슨 1개를 scaffold→author→check→dev**까지 돌리고 → **배포된 데모 URL**을 열어볼 수 있다.

### North Star (GTM.md 정렬, soft launch)
- **L0:** 스킬 설치 성공 + 첫 레슨 생성 성공 (dogfood ≥3)
- **L1 (런칭 후 1주):** 외부 제작자 ≥5명이 레슨 1개 완성
- **L2 (검증 게이트):** 풀 코스 1개 실제 배포 + 학생 인게이지 + 재제작(retention)

### 의도적으로 오늘 안 하는 것
- 웹 플랫폼 / 관리형 AI / 결제 / 마켓 (Stage 2+)
- `faraday deploy` CLI 완성 (우회: `vercel` / static host)
- 월드·LMS 스펙 100% (voyage-log로 “존재 증명”)

---

## 2. 퍼널 (콘텐츠 → 스킬 → 테스팅 → 데모)

```
[콘텐츠]  트위터/쓰레드/블로그/릴스
    │  CTA: “Claude Code에서 Faraday 깔고 같은 거 만들어봐”
    ▼
[설치]  marketplace add ssota-labs/faraday-academy → install faraday
    │  (Codex: marketplace add 또는 Path B copy)
    ▼
[프롬프트]  “내 슬라이드/이 주제로 인터랙티브 레슨 만들어줘”
    │  스킬 Discover → Design → Build → Verify
    ▼
[로컬]  npx @faraday-academy/cli → pnpm i (runtime/three/tutor pin) → check → dev
    ▼
[데모]  미리 올린 live demo + “fork this”
    │  유저 결과물도 vercel preview로 공유
    ▼
[피드백]  Discord/GH Discussions/폼 → retention 추적
```

**스무스함 체크리스트:**
1. 콘텐츠의 install 한 줄이 **복붙 가능**하고 **실제로 동작**
2. CLI가 **npx로 즉시** 돌아감 + **의존 패키지가 registry에 존재**
3. 첫 프롬프트 예시가 콘텐츠·README·스킬에 **동일**
4. 실패 시: `pnpm` 없음 / Gateway 키 / marketplace URL — **트러블슈팅 3줄**
5. “성공” = **브라우저에서 조작 가능한 URL**

---

## 3. 오늘 부족한 것 (갭 — 갱신)

| # | 갭 | 심각도 | 현재 상태 | 왜 막히나 |
|---|---|---|---|---|
| 1 | **`@faraday-academy/*` npm 미배포 (4패키지)** | 🔴 Blocker | 전부 registry 404 · cli/runtime `private: true` | `npx`·레슨 `pnpm i`·voyage-log Vercel install 즉시 사망 |
| 1b | **publish 기술 게이트** | 🔴 Blocker | runtime/three/tutor가 **소스(.ts/.tsx) export** · three/tutor peer에 `workspace:^` | publish 전 `files`/peer 버전 치환·org 권한·라이선스 확정 필요 |
| 2 | **플러그인 marketplace URL 불일치** | 🔴 Blocker | 코드/README: `titanism/faraday-edu` · 실제 레포: **`ssota-labs/faraday-academy`** (구 `faraday-edu` rename) | `/plugin marketplace add` 실패 |
| 3 | **공개 데모 링크 0개** | 🔴 Blocker | voyage-log는 코드만 · S1–S4 없음 | 콘텐츠 CTA가 갈 곳 없음 |
| 4 | **콘텐츠 → 설치 → 첫 레슨 퍼널** | 🟠 High | 문서에 카피 있음, 실채널 미발행 | 스킬 올려도 유입 0 |
| 5 | **`faraday deploy` 미구현** | 🟡 Medium | 스킬이 vercel/`pnpm build` 우회 | 런칭 블로커 아님 |
| 6 | **외부 콜드 세션 E2E** | 🟠 High | 레포 내부 smoke만 | centralize 이후 경로 재검증 필수 |
| 7 | **라이선스 / 공개 정책** | 🟡 Medium | `UNLICENSED` | npm 신뢰·오픈소스 신호 |

**이미 있는 것:**
- 레슨 CLI (2D / `--3d` / `--physics` / `--tutor`) + `doctor` / `upgrade`
- Claude Code · Codex 플러그인
- CourseHost / packs / LMS (runtime)
- C-B `examples/voyage-log` (Vercel 설정 포함)
- 공개 GitHub: `https://github.com/ssota-labs/faraday-academy` (구 `faraday-edu`)

---

## 4. Workstream A — 제품/배포 레일 (Blockers first)

### A1. npm 패키지 스위트 publish 🔴

순서 고정: **runtime → three / tutor → cli** (peer/dependency 방향).

| 패키지 | 역할 | publish 전 체크 |
|---|---|---|
| `@faraday-academy/runtime` | 모든 레슨 필수 pin | `private` 해제 · `files`에 blocks/runtime/world/lms/ui/styles/lib · 라이선스 |
| `@faraday-academy/three` | `--3d` / `--physics` | peer `workspace:^` → `0.1.0` · `files` |
| `@faraday-academy/tutor` | `--tutor` | peer `workspace:^` → `0.1.0` · `files` |
| `@faraday-academy/cli` | `npx` 엔트리 | `private` 해제 · templates 포함 · 핀 버전이 위 패키지와 일치 |

**결정 필요 (Day 0):**
- [ ] npm org `@faraday-academy` 소유/권한 확인
- [ ] 라이선스: MIT 또는 Apache-2.0
- [ ] 소스 패키지 전략 유지 확인 (Vite가 `.tsx` transpile — 의도된 계약이면 README에 명시)
- [ ] (선택) Changesets / `pnpm -r publish` 워크플로
- [ ] 검증: 클린 머신 `npx @faraday-academy/cli@latest new demo --skip-install` 후 `pnpm i && pnpm check`

### A2. 플러그인 설치 경로 수정 🔴
- [ ] 전수 `titanism/faraday-edu` (및 문서의 `ssota-labs/faraday-edu`) → **`ssota-labs/faraday-academy`**
  - `.claude-plugin/marketplace.json`
  - `plugins/claude-code/**`, `plugins/codex/**` README·plugin.json
  - `plugins/README.md` · `examples/README.md` · 스킬/런칭 카피
- [ ] Claude: `/plugin marketplace add ssota-labs/faraday-academy` → `/plugin install faraday@faraday`
- [ ] Codex: marketplace add + Path B(copy) 병기
- [ ] 클린 세션에서 **설치만** 스모크
- [ ] (확인) `faraday-edu` 구 URL이 redirect로 살아도 **문서·CTA는 canonical 이름만** 쓴다

### A3. 콜드 세션 E2E (centralize 이후) 🟠

| 시나리오 | 에이전트 | 입력 | 통과 기준 |
|---|---|---|---|
| S1 2D | Claude Code | “복리 이자 인터랙티브 레슨” | check 0 + dev 조작 |
| S2 3D | Claude Code | “케플러 제2법칙 `--3d`” | mood + 렌더 |
| S3 튜터 | Claude Code | “이진 탐색 + tutor” | `/api/chat` 스트림 (키 있을 때) |
| S4 Codex | Codex | `$faraday` 동일 | S1 동등 |
| S5 PDF→레슨 | 둘 중 하나 | 샘플 MD/슬라이드 | Discover → 레슨 |

**E2E 통과 전 콘텐츠 대량 배포 금지.**

### A4. 배포 UX (런칭 최소) 🟡
- [ ] 스킬 Ship 단계 고정 레시피: static → `pnpm build` + 호스트 / tutor → `vercel`
- [ ] (선택) `faraday deploy` 스텁 — 블로커 아님
- [ ] 튜터 데모용 Vercel + Gateway 연결

### A5. Go / No-Go
- [ ] `npx @faraday-academy/cli@latest new …` + registry에서 runtime install 성공
- [ ] marketplace add (실제 org) 성공
- [ ] S1–S4 중 Claude ≥2 + Codex ≥1 통과
- [ ] 데모 URL ≥3 라이브 (아래 B; voyage-log 포함 가능)
- [ ] 콘텐츠 #1에 install CTA + 데모 링크

---

## 5. Workstream B — 데모 링크

상세: [DEMO-IDEATION.md](DEMO-IDEATION.md).

### B1. 데모 세트

| ID | 주제 | 플래그 | 상태 | 호스트 |
|---|---|---|---|---|
| S1 | 복리의 폭주 | 2D | ❌ 미작성 | static |
| S2 | 케플러 쓸기 | `--3d` | ❌ 미작성 (voyage 노드와 중복 가능) | static |
| S3 | 갈톤 보드 | `--physics` | ❌ 미작성 | static |
| S4 | 이진 탐색 + 튜터 | `--tutor` | ❌ 미작성 | Vercel |
| C★ | **항해 일지 (C-B)** | CourseHost + `world3dPack` | ✅ 코드 준비 | `examples/voyage-log` → Vercel |

**최소 런칭 세트 제안:** C★ + S1 + (S2 **또는** S4). S2는 voyage 첫 노드로 대체 가능하면 단편 제작 비용 절감.

### B2. 운영 규칙
- 각 데모 하단 CTA: **“Claude Code / Codex에서 만들기”** + install 한 줄 + 복붙 프롬프트
- URL: `faraday-demo-*.vercel.app` 등 읽기 쉬운 이름
- README “Example lessons”를 **라이브 링크로 교체**
- voyage-log Vercel Root Directory = `examples/voyage-log` (이미 `vercel.json`)

### B3. “Fork this” 루프
콘텐츠에 데모 → 같은 프롬프트로 재생성 → 유저가 자기 URL 회신.

---

## 6. Workstream C — 콘텐츠

타겟: **이미 Claude Code / Codex를 쓰는 제작자.**  
메시지: *“자기 수업을 딸깍으로 고퀄 인터랙티브 교재(+튜터)로.”*

### C1. 기둥
| 기둥 | 역할 | CTA |
|---|---|---|
| P1 Wow 데모 | 인지 | 데모 링크 → 설치 |
| P2 따라하기 | 활성화 | 복붙 프롬프트 |
| P3 Before/After | 전환 | “내 자료로 해봐” |

### C2. 런칭 주 최소 발행
1. “Claude Code한테 수업 맡겼더니 교재가 나왔다” (P1 + C★/S1)
2. “복붙 프롬프트 하나: PDF → 인터랙티브 레슨” (P2 + install)
3. “슬라이드 vs 만지는 3D / 맵 언락” (P1+P3)
4. (예비) “튜터가 퀴즈 답을 안 알려주는 이유” (S4)

### C3. 고정 CTA 블록

```text
Install (Claude Code):
  /plugin marketplace add ssota-labs/faraday-academy
  /plugin install faraday@faraday

Then say:
  “Turn this topic into an interactive Faraday lesson: <topic>.
   Scaffold, author, run pnpm check and pnpm dev, then give me the URL.”

Live demo: <demo-url>
Repo: https://github.com/ssota-labs/faraday-academy
```

### C4. KPI
- 발행 ≥3 · 데모 클릭 · 설치/회신 · **외부 레슨 성공 제보 ≥3**

---

## 7. 실행 순서 (의존 그래프)

```
Phase 0 — 권한/정책 (병렬, 블로커)
  ├─ npm @faraday-academy org 접근
  └─ 라이선스 결정 (MIT/Apache-2.0)

Phase 1 — 배포 레일 (병렬 가능한 축)
  ├─ A1 publish 준비 + npm publish (runtime→addons→cli)
  ├─ A2 marketplace URL 전수 수정
  └─ B1 voyage-log Vercel 프로젝트 생성 (A1 완료 후 install 가능)

Phase 2 — 데모·검증
  ├─ B1 단편 최소 세트 (S1 + 선택 S4) 작성·호스팅
  ├─ B2 CTA 푸터 + README 라이브 링크
  └─ A3 콜드 E2E (Claude + Codex)

Go/No-Go (A5)
  └─ 통과 시에만 콘텐츠 #1

Phase 3 — Soft launch
  ├─ C2 콘텐츠 #1→#3
  ├─ 피드백 → 스킬/패키지 핫픽스
  └─ L0 집계
```

**병렬 팁:** A2(URL 수정)는 A1과 완전 병렬. 데모 저작도 A1과 병렬 가능하되 **호스팅은 A1 이후**.

---

## 8. 역할 / 산출물

| 산출물 | 위치 |
|---|---|
| 이 런칭 계획 | `docs/LAUNCH-STAGE1.md` |
| Notion 미러 | [Faraday GTM Stage 1 런칭 계획](https://app.notion.com/p/398346dac45681ab9394f4fb3bf1cafa) |
| 스킬·플러그인 | `plugins/claude-code`, `plugins/codex` |
| npm 스위트 | `@faraday-academy/{cli,runtime,three,tutor}` |
| 데모 | Vercel × N + README 링크 |
| 커리큘럼 데모 | `examples/voyage-log` |

---

## 9. 리스크 (런칭 한정)

1. **npm org / 스코프 권한** — `@faraday-academy` 미보유 시 패키지명 변경이 스킬·템플릿·핀 전면 수정으로 번짐 → Phase 0에서 확인.
2. **소스 패키지 + peer `workspace:`** — publish 실수 시 외부 `pnpm i` 실패. dry-run + 클린 머신 검증 필수.
3. **튜터 데모 비용** — Gateway 남용 → 레이트리밋 또는 녹화+간헐 라이브.
4. **marketplace UX 변동** — Codex Path B를 콘텐츠에 항상 병기.
5. **기대치 과대** — 첫 CTA는 **레슨 1개 + 데모**. 풀 LMS/월드 완성을 약속하지 않음.

---

## 10. 한 장짜리 결론

**지금 부족한 것:** (1) `@faraday-academy/*` 4패키지 npm, (2) marketplace URL을 `ssota-labs/faraday-academy`로 통일, (3) 만져보는 데모 URL, (4) 콘텐츠→설치→프롬프트 한 줄 퍼널.

**centralize 이후 핵심 변화:** CLI 단독 publish로는 부족하다. 레슨·voyage-log·콜드 세션이 모두 **runtime/three/tutor registry**에 달려 있다.

**런칭 순서:** org/라이선스 → npm 스위트 + URL 수정 → voyage-log(+단편) 호스팅 → 콜드 E2E → 콘텐츠 #1.

**검증:** 외부 제작자가 스킬로 레슨을 만들고, 데모/자기 URL을 공유하면 Stage 1 soft launch 성공.
