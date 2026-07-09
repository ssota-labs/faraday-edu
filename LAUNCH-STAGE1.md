# Faraday — GTM Stage 1 런칭 계획

> 기준일: 2026-07-09 · 짝 문서: [GTM.md](GTM.md) · [VISION.md](VISION.md)
>
> **한 줄:** Stage 1 “배포” = **스킬(플러그인)을 얼리어답터 제작자 손에 넣는 것**.
> 유저는 콘텐츠로 유입되고, Claude Code / Codex에서 스킬을 설치·테스팅하며,
> 결과물은 **데모 링크**로 보여준다.

---

## 0. 오늘 배포하려면 뭐가 부족한가 (갭 요약)

| # | 갭 | 심각도 | 현재 상태 | 왜 막히나 |
|---|---|---|---|---|
| 1 | **`@faraday-kit/cli` npm 미배포** | 🔴 Blocker | `package.json` `private: true`, registry 404 | 스킬/README가 `npx @faraday-kit/cli@latest`를 호출 → 외부 유저 퍼널 즉시 사망 |
| 2 | **플러그인 마켓플레이스 URL 불일치** | 🔴 Blocker | docs: `titanism/faraday-edu` · 실제 공개 레포: `ssota-labs/faraday-edu` · `titanism/…` 없음 | `/plugin marketplace add`가 실패 |
| 3 | **공개 데모 링크 0개** | 🔴 Blocker | 예제는 템플릿 안 `docs/examples/*.tsx`뿐 | 콘텐츠 CTA(“이거 봐”)가 갈 곳이 없음 |
| 4 | **콘텐츠 → 설치 → 첫 레슨 퍼널 미설계** | 🟠 High | GTM.md에 아이디어만 | 스킬 배포해도 “다음에 뭐 하지?”가 끊김 |
| 5 | **`faraday deploy` CLI 미구현** | 🟡 Medium | 스킬은 `vercel deploy` / `pnpm build` 우회 | 딸깍 배포 약속과 어긋남. 런칭은 우회로 가능 |
| 6 | **외부 콜드 세션 E2E 미검증** | 🟠 High | 레포 내부 smoke(PR #3)만 | 진짜 유저 환경(클린 Claude/Codex)에서 깨질 수 있음 |
| 7 | **라이선스 / 패키지 공개 정책** | 🟡 Medium | `UNLICENSED` + `private: true` | npm publish·오픈소스 신뢰 신호 부족 |
| 8 | **Stage 1 “수평 feature-complete” vs 런칭 MVP** | 🟡 Scope | VISION은 월드·LMS·튜터·deploy까지 | **오늘 런칭은 스킬+레슨+튜터+데모로 축소**해도 가설 검증 가능. 월드/LMS는 “이미 있음”을 데모로 보여주되, 완성도 게이트는 후순위 |

**이미 있는 것 (런칭 자산):**
- 레슨 CLI (2D / `--3d` / `--physics` / `--tutor`)
- Claude Code 플러그인 (skill + `/faraday-*` + subagent)
- Codex 플러그인 (skill + AGENTS.md + marketplace)
- CurriculumHost / packs / LMS 컴포넌트 (템플릿에 존재)
- 공개 GitHub: `https://github.com/ssota-labs/faraday-edu`

---

## 1. Stage 1 런칭 정의 (오늘 기준)

### 성공 정의 (Launch Done)
외부 제작자 1명이 **콘텐츠를 보고** → **Claude Code 또는 Codex에 Faraday 스킬을 설치**하고 → **자기 주제 레슨 1개를 scaffold→author→check→dev**까지 돌리고 → **배포된 데모 URL**을 열어볼 수 있다.

### North Star (GTM.md 정렬, soft launch)
- **L0 (오늘):** 스킬 설치 성공 + 첫 레슨 생성 성공 (dogfood 3명 이상)
- **L1 (런칭 후 1주):** 외부 제작자 ≥5명이 레슨 1개 완성
- **L2 (검증 게이트):** 풀 코스 1개 실제 배포 + 학생 인게이지 + 재제작(retention)

### 의도적으로 오늘 안 하는 것
- 웹 플랫폼 / 관리형 AI / 결제 / 마켓 (Stage 2+)
- `faraday deploy` 완성 (우회: `vercel` / static host)
- 월드·LMS의 스펙 완성도 100% (데모 1개로 “존재 증명”만)

---

## 2. 퍼널 (콘텐츠 → 스킬 → 테스팅 → 데모)

```
[콘텐츠]  트위터/쓰레드/블로그/릴스
    │  CTA: “Claude Code에서 Faraday 깔고 같은 거 만들어봐”
    ▼
[설치]  marketplace add ssota-labs/faraday-edu → install faraday
    │  (Codex: marketplace add 또는 Path B copy)
    ▼
[프롬프트]  “내 슬라이드/이 주제로 인터랙티브 레슨 만들어줘”
    │  스킬 Discover → Design → Build → Verify
    ▼
[로컬]  npx @faraday-kit/cli new … → pnpm check → pnpm dev
    ▼
[데모]  우리가 미리 올려둔 live demo + “fork this” 예제
    │  유저 결과물도 vercel preview로 공유
    ▼
[피드백]  Discord/GH Discussions/폼 → retention 추적
```

**스무스함 체크리스트 (퍼널이 끊기면 안 되는 지점):**
1. 콘텐츠의 install 한 줄이 **복붙 가능**하고 **실제로 동작**
2. CLI가 **npx로 즉시** 돌아감 (로컬 클론 불필요)
3. 첫 프롬프트 예시가 콘텐츠·README·스킬에 **동일**
4. 실패 시: `pnpm` 없음 / Gateway 키 / marketplace URL — **트러블슈팅 3줄**이 콘텐츠에 있음
5. “성공”의 정의가 **브라우저에서 조작 가능한 URL** (로컬만이면 공유·바이럴 불가)

---

## 3. Workstream A — 스킬/제품 배포 (Blockers first)

### A1. CLI를 npm에 올린다 🔴
- [ ] `private: true` 해제 전략 결정 (publish용 워크플로 또는 `publishConfig`)
- [ ] 패키지명 확정: `@faraday-kit/cli` (스킬과 일치 유지)
- [ ] 라이선스: MIT 또는 Apache-2.0 중 하나 명시
- [ ] `files` 필드에 `bin`/`src`/`templates` 포함 확인 (이미 있음)
- [ ] `npm publish --access public` (스코프 패키지)
- [ ] 검증: 클린 머신에서 `npx @faraday-kit/cli@latest help` / `new demo --skip-install`

### A2. 플러그인 설치 경로를 고친다 🔴
- [ ] 모든 docs/README/marketplace owner URL을 **`ssota-labs/faraday-edu`**로 통일  
  (현재 `titanism/faraday-edu`는 존재하지 않음)
- [ ] Claude: `/plugin marketplace add ssota-labs/faraday-edu` → `/plugin install faraday@faraday`
- [ ] Codex: `codex plugin marketplace add ssota-labs/faraday-edu` + Path B 폴백 유지
- [ ] `.claude-plugin/marketplace.json` owner.url 수정
- [ ] 클린 Claude Code / Codex 세션에서 **설치만** 스모크

### A3. 콜드 세션 E2E (스킬 품질 게이트) 🟠
외부 유저 시뮬레이션 — 레포를 모르는 에이전트 세션:

| 시나리오 | 에이전트 | 입력 | 통과 기준 |
|---|---|---|---|
| S1 2D 레슨 | Claude Code | “복리 이자 인터랙티브 레슨” | check 0 + dev에서 조작 |
| S2 3D | Claude Code | “케플러 제2법칙 `--3d`” | mood 설정 + 렌더 |
| S3 튜터 | Claude Code | “이진 탐색 + tutor” | `/api/chat` 스트림 (키 있을 때) |
| S4 Codex | Codex | `$faraday` 동일 주제 | S1과 동등 |
| S5 PDF→레슨 | 둘 중 하나 | 샘플 슬라이드/MD 첨부 | Discover 질문 → 레슨 |

실패 시 스킬 `references/` / 커맨드 패치 후 재검증. **E2E 통과 전 콘텐츠 대량 배포 금지.**

### A4. 배포 UX (런칭 최소) 🟡
- [ ] 스킬 Ship 단계에 **고정 레시피** 명시: static → `pnpm build` + 호스트 / tutor → `vercel`
- [ ] (선택) `faraday deploy` 스텁 또는 문서화만 — 런칭 블로커 아님
- [ ] 튜터 데모용 Vercel 프로젝트 + Gateway OIDC 한 번 연결해 두기

### A5. 런칭 체크리스트 (Go / No-Go)
- [ ] `npx @faraday-kit/cli@latest new …` 외부에서 성공
- [ ] marketplace add (실제 org) 성공
- [ ] S1–S4 중 최소 Claude 2개 + Codex 1개 통과
- [ ] 데모 URL ≥3 라이브 (아래 B)
- [ ] 콘텐츠 #1에 install CTA + 데모 링크 포함

---

## 4. Workstream B — 데모 링크 배포

콘텐츠와 퍼널의 **시각적 앵커**. “말”이 아니라 “만져보는 URL”.

### B1. 데모 세트 (단편 4 + 커리큘럼 1)

상세 아이디에이션·노드맵·카피 훅: [DEMO-IDEATION.md](DEMO-IDEATION.md).

| ID | 주제 | 플래그 | 보여주는 것 | 호스트 |
|---|---|---|---|---|
| S1 | 복리의 폭주 | 2D | 슬라이더→차트 즉각 반응 | static |
| S2 | 케플러 쓸기 | `--3d` | 공간·mood·조작 | static |
| S3 | 갈톤 보드 500알 | `--physics` | 떨어뜨리면 정규분포 | static |
| S4 | 이진 탐색 + 튜터 | `--tutor` | 그라운딩 챗 (답 비누출) | Vercel (OIDC) |
| C★ | **항해 일지 (C-B)** ✅ | CurriculumHost + `world3dPack` | 맵 언락 + 코스 샷 | `examples/voyage-log` → Vercel |

구현: [`examples/voyage-log/`](examples/voyage-log/) · 아이디에이션: [DEMO-IDEATION.md](DEMO-IDEATION.md).

### B2. 데모 운영 규칙
- 각 데모 페이지 하단에 고정 CTA:  
  **“Claude Code / Codex에서 만들기”** + install 한 줄 + 복붙 프롬프트
- 소스: `examples/` 또는 별도 `demos/` 브랜치/레포에 고정 커밋 → 재현 가능
- URL 네이밍: `faraday-demo-interest.vercel.app` 등 읽기 쉬운 이름
- README “Example lessons” 섹션을 **라이브 링크로 교체** (지금은 서술만)

### B3. “Fork this” 루프 (GTM §5)
콘텐츠에 데모 임베드/GIF → 링크 → 같은 프롬프트로 재생성 → 유저가 자기 URL을 회신.  
마케팅 = 제품 루프.

---

## 5. Workstream C — 콘텐츠 계획

타겟: **이미 Claude Code / Codex를 쓰는 제작자** (과외 대학생·TA·코스 작가).  
메시지: *“자기 수업을 딸깍으로 고퀄 인터랙티브 교재(+튜터)로.”*

### C1. 콘텐츠 기둥 (3종)

| 기둥 | 역할 | 포맷 | CTA |
|---|---|---|---|
| **P1. Wow 데모** | 인지 | 30–60s 스크린 / 쓰레드 | 데모 링크 → 설치 |
| **P2. 따라하기** | 활성화 | “슬라이드 넣고 이 말 하면 됨” 튜토리얼 | 복붙 프롬프트 |
| **P3. Before/After** | 전환 | 정적 PDF vs Faraday 레슨 | “내 자료로 해봐” |

### C2. 런칭 주 발행 계획 (최소)

| # | 제목 앵글 | 기둥 | 필수 첨부 |
|---|---|---|---|
| 1 | “Claude Code한테 수업 맡겼더니 교재가 나왔다” | P1 | D1 또는 D3 링크 |
| 2 | “복붙 프롬프트 하나: 내 PDF → 인터랙티브 레슨” | P2 | install 3줄 + 프롬프트 |
| 3 | “같은 케플러 법칙, 슬라이드 vs 만지는 3D” | P1+P3 | D2 |
| 4 | “튜터AI가 퀴즈 답을 안 알려주는 이유” | P1 | D3 (그라운딩) |
| 5 | (예비) “맵에서 노드 깨고 다음 레슨 언락” | P1 | D4 |

채널: 제작자가 있는 곳 우선 (X/Threads, Claude/Codex 커뮤니티, 교육×AI 디스코드).  
한 채널에서 **#1 반응 보고** #2–#3 증폭.

### C3. 모든 콘텐츠에 넣는 고정 블록 (복붙)

```text
Install (Claude Code):
  /plugin marketplace add ssota-labs/faraday-edu
  /plugin install faraday@faraday

Then say:
  “Turn this topic into an interactive Faraday lesson: <topic>.
   Scaffold, author, run pnpm check and pnpm dev, then give me the URL.”

Live demo: <demo-url>
Repo: https://github.com/ssota-labs/faraday-edu
```

### C4. 콘텐츠 KPI (런칭 주)
- 발행 수 ≥3
- 데모 링크 클릭 (가능하면 UTM)
- 스킬 설치 시도 / GH star / “만들어봤어요” 회신 수
- **핵심:** 외부 세션에서 레슨 생성 성공 제보 ≥3

---

## 6. 실행 순서 (오늘 → 런칭)

의존 순서만 지킨다. 병렬 가능한 것은 표시.

```
Day 0 (오늘) — 블로커 제거
  ├─ A1 npm publish 준비·배포          ─┐
  ├─ A2 marketplace URL 전수 수정       ─┼─ 병렬
  └─ B1 데모 3개 빌드·호스팅 시작       ─┘

Day 0–1 — 퍼널 검증
  ├─ A3 콜드 세션 E2E (Claude + Codex)
  ├─ B2 데모 CTA 푸터 + README 링크
  └─ C3 고정 CTA 블록 확정

Go/No-Go 게이트 (A5)
  └─ 통과 시에만 콘텐츠 #1 발행

런칭 주
  ├─ C2 콘텐츠 #1→#3
  ├─ 피드백 수집 → 스킬 핫픽스
  └─ L0 지표 집계 (설치·첫 레슨·데모 트래픽)
```

---

## 7. 역할 / 산출물

| 산출물 | 위치 |
|---|---|
| 이 런칭 계획 | `LAUNCH-STAGE1.md` (본 문서) |
| 스킬·플러그인 | `plugins/claude-code`, `plugins/codex` |
| CLI 패키지 | `@faraday-kit/cli` on npm |
| 데모 | Vercel 프로젝트 × N + README 링크 |
| 콘텐츠 초안 | 발행 채널 + (선택) Notion 캘린더 |

---

## 8. 리스크 (런칭 한정)

1. **npm/스코프 권한** — `@faraday-kit` org 미보유 시 패키지명 변경이 스킬 전면 수정으로 번짐 → 오늘 중 org/권한 확인.
2. **튜터 데모 비용** — Gateway 남용 → 데모에 레이트리밋/짧은 context, 또는 녹화본+간헐 라이브.
3. **marketplace UX 변동** — Codex 플러그인 시스템 유동적 → Path B(copy skill)를 콘텐츠에 항상 병기.
4. **기대치 과대** — “풀 코스+LMS+월드”를 첫 CTA에 넣으면 이탈 → 첫 CTA는 **레슨 1개 + 데모**.

---

## 9. 한 장짜리 결론

**오늘 부족한 것:** (1) npm CLI, (2) 올바른 marketplace 설치 URL, (3) 만져보는 데모 링크, (4) 콘텐츠→설치→프롬프트가 한 줄로 이어지는 퍼널.

**런칭 순서:** CLI publish + URL 수정 → 데모 3개 배포 → 콜드 E2E → 콘텐츠 #1.

**검증:** 외부 제작자가 스킬로 레슨을 만들고, 데모/자기 URL을 공유하면 Stage 1 soft launch 성공.
