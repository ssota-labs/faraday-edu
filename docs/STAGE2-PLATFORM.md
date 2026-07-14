# Faraday Stage 2 웹 플랫폼 — 제품·아키텍처·정책 계획

> 상태: accepted direction · 2026-07-14
>
> 범위: 웹 제작 에이전트, Artifact Router 배포, 학습자 인증, LMS, 평가, 관리형 튜터,
> 공개·유료 코스, 코스 커뮤니티.
>
> 상위 문서: [VISION.md](VISION.md) · [GTM.md](GTM.md) · 구현 정본 참조: [ssota](https://github.com/ssota-labs/ssota)
>
> 권한 표: [PLATFORM-API-PERMISSIONS.md](PLATFORM-API-PERMISSIONS.md) ·
> 위협 모델: [PLATFORM-THREAT-MODEL.md](PLATFORM-THREAT-MODEL.md) ·
> 코드: `apps/platform`, `packages/platform-*`

---

## 0. 이 문서의 지위와 용어

이 문서는 GTM Stage 2 이후 웹 플랫폼의 **구현 정본**이다. 여기서 사용하는 `P0`~`P7`은
GTM Stage와 다른 **플랫폼 내부 구현 페이즈**다.

- **GTM Stage 2**: 웹 제작 에이전트로 비기술 제작자의 툴 장벽 제거
- **GTM Stage 3**: 학생 수요, 유료 코스, 결제 활성화
- **이 문서의 P0~P7**: 위 두 Stage를 안전하게 구현하기 위한 기술 순서

기존 CLI/BYOK/자체 호스팅 경로는 유지한다. 웹 플랫폼은 이를 대체하지 않고 관리형 경로를 추가한다.

---

## 1. 확정된 제품 결정

### 1.1 사용자와 시장

1. 특정 학교와 계약하는 B2B 학교 관리 제품이 아니라 **누구나 가입하는 오픈 플랫폼**으로 시작한다.
2. 지금은 조직·학교 단위 멀티테넌시, SSO, 학교 관리자, 기관별 데이터 파티션을 만들지 않는다.
3. 한 계정은 코스에 따라 제작자이면서 학생일 수 있다. 전역 `user.role`로 둘 중 하나를 고정하지 않는다.
4. 제작자는 웹 에이전트로 코스를 만들고, 학생은 공개된 코스를 수강한다.
5. 공개된 코스의 접근 방식은 **무료 공개형**과 **유료 공개형**으로 나눈다.

### 1.2 배포

1. 플랫폼 코스는 **정적 Vite 프론트엔드**로 빌드한다.
2. 빌드 결과는 immutable artifact로 저장한다.
3. 모든 코스는 하나의 Vercel 프로젝트에 배포된 **Artifact Router**를 통해 서빙한다.
4. 코스별 Vercel Project/Deployment를 만들지 않는다.
5. publish와 rollback은 Vercel 재배포가 아니라 도메인이 가리키는 release 포인터의 원자적 교체다.
6. LMS, 평가, 튜터, 결제, 커뮤니티 서버는 생성된 코스와 분리된 중앙 플랫폼 API가 담당한다.
7. production 코스 도메인은 신뢰된 Course Shell을 반환하고, 제작자 생성 artifact는 별도 origin의
   sandboxed iframe에서 실행한다.

### 1.3 LMS와 평가

1. 제작자는 임의의 SQL·테이블이 아니라 버전된 선언형 LMS manifest를 설정한다.
2. 생성된 프론트엔드는 신뢰 경계 밖에 두고 학생 session/API token을 전달하지 않는다. 클라이언트가
   보낸 점수·완료·권한을 그대로 믿지 않는다.
3. 평가는 **연습(`PRACTICE`)**과 **공식 평가(`OFFICIAL`)**로 분리한다.
4. 공식 평가 정답, 채점 규칙, 시도 정책은 서버에 봉인하고 서버가 판정한다.

### 1.4 튜터와 커뮤니티

1. 튜터 프론트는 UI와 스트리밍 transport만 담당한다.
2. Workflow, system instruction, grounding, AI Gateway, 비용 통제는 중앙 서버가 담당한다.
3. 커뮤니티는 코스별 비동기 게시판으로 시작한다. 실시간 채팅과 개인 DM은 초기 범위가 아니다.

---

## 2. 현재 범위가 아닌 것

- 학교·학원 조직 계정, 조직 관리자, SSO/SAML, 학교별 계약
- 코스별 Vercel 프로젝트 또는 제작자 소유 서버 함수
- 제작자가 만드는 임의 DB schema, migration, SQL, backend endpoint
- 유료 콘텐츠의 완전한 DRM 또는 브라우저 전달 후 복사 방지
- 실시간 단체 채팅, 학생 간 개인 메시지
- 팩 마켓과 제작자 간 팩 판매(GTM Stage 4)
- 생성된 앱에 플랫폼 service key, AI Gateway key, 결제 secret 제공

향후 조직 기능을 추가하더라도 현재 모든 행에 미리 `tenant_id`를 넣지는 않는다. 대신 `owner_id`,
`course_id`, `user_id`를 명시하고 외래키와 접근 정책을 엄격히 둬 마이그레이션 가능한 모델을 유지한다.

---

## 3. 시스템 경계

```text
┌──────────────────────── Control Plane ────────────────────────┐
│ Studio UI · 제작 에이전트 · 소스/버전 · 빌드 · Quality Gate   │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                    isolated build sandbox
                               │
               source snapshot + manifest + dist/
                               ▼
┌──────────────────────── Artifact Plane ───────────────────────┐
│ Supabase Storage · immutable build · preview · release        │
└──────────────────────────────┬─────────────────────────────────┘
                               │ release pointer
                               ▼
┌──────────────────────── Delivery Plane ───────────────────────┐
│ one Vercel project · Artifact Router · trusted Course Shell   │
│ sandboxed UGC artifact origin · CDN                           │
└──────────────────────────────┬─────────────────────────────────┘
                               │ scoped learner token
                               ▼
┌──────────────────────── Service Plane ────────────────────────┐
│ Auth · Entitlement · LMS · Assessment · Tutor · Community     │
│ Postgres/RLS · Workflow/AI Gateway · Payment provider         │
└────────────────────────────────────────────────────────────────┘
```

### 3.1 권장 도메인

| 도메인 | 역할 |
|---|---|
| `faraday.com` | 랜딩·탐색·코스 상세 |
| `studio.faraday.com` | 제작 에이전트와 관리 화면 |
| `api.faraday.com` | 인증된 중앙 API |
| `{courseSlug}.learn.faraday.com` | 신뢰된 Course Shell |
| `{buildHash}.artifact.faraday.com` | sandboxed 생성 artifact |
| `{buildId}.preview.faraday.com` | iframe preview |

정확한 도메인은 바뀔 수 있지만, **Studio/Preview/Learning/API origin 분리** 원칙은 바꾸지 않는다.
광범위한 `.faraday.com` 쿠키를 발급하지 않고 각 표면에 필요한 최소 권한 토큰만 제공한다.

### 3.2 인프라 선택

- build artifact와 sealed bundle의 초기 저장소는 **Supabase Storage**로 한다.
- 공개 artifact와 sealed bundle은 bucket 및 접근 정책을 분리한다.
- 코스·release·LMS·평가·권한 데이터는 관계형 Postgres 모델로 관리한다.
- Supabase Postgres/Auth 채택 여부는 P0에서 운영·인증 요구를 검증해 확정한다.
- 생성 앱은 어떤 선택에서도 Supabase나 중앙 API에 직접 연결하지 않는다. Course Shell의 제한된
  `postMessage` bridge만 사용한다.

---

## 4. SSOTA 정렬

Faraday Stage 2 플랫폼 앱은 [ssota-labs/ssota](https://github.com/ssota-labs/ssota)의 개발 환경,
스킬, 검증 게이트, Vercel-native 런타임 패턴을 **정본(reference implementation)** 으로 따른다.

Faraday Stage 2는 두 개의 공개 ssota 레포를 역할별로 참조한다.

| 레포 | 역할 | Faraday 대응 |
|---|---|---|
| [ssota-labs/ssota](https://github.com/ssota-labs/ssota) | 범용 워크스페이스 SaaS — `studio-*` **인프라** 패키지, harness, WDK, Supabase | 구현 정본: sandbox/build/renderer, 스킬·CI·품질 게이트 |
| [ssota-labs/mirror-dimension](https://github.com/ssota-labs/mirror-dimension) | 디자인 툴(dimension) 호스티드 Studio — Stage 2+ `apps/web` | **제품 아날로그**: 코스 = dimension, Studio Agent + 서브도메인 배포 UX |

`mirror-dimension`의 Stage 1(스킬·CLI)은 Faraday CLI(Stage 1)와 대응하고, Stage 2+ 인앱 Studio는
`studio.faraday.com` 제작 경험의 직접 참조 모델이다. ssota의 `packages/studio-sandbox` 등은
mirror-dimension이 소비하는 **구현 레이어**이며, Faraday는 ssota 인프라 패턴 + mirror-dimension
Studio UX를 **교육 오픈 플랫폼** 도메인으로 변형한다.

이 절은 제품 정책(§1~§3)을 바꾸지 않는다. **구현 방식·에이전트 규율·품질 게이트**만 ssota와
정렬한다.

### 4.1 레이어 대응

| Faraday Stage 2 | ssota 대응 | 비고 |
|---|---|---|
| `studio.faraday.com` (제작 Studio) | mirror-dimension `apps/web` + ssota `studio-sandbox` | Vercel Sandbox 격리 빌드, 2-pane Studio Agent |
| `api.faraday.com` (중앙 API) | `apps/mcp` / route handlers | 필요 시 MCP 앱 분리 |
| Artifact Router + release pointer | `packages/studio-build` + delivery | 코스별 서브도메인 라우팅은 Faraday 고유 |
| trusted Course Shell | `packages/studio-renderer` | JSON-render / platform-owned UI |
| sandboxed UGC artifact iframe | `studio-preview-runtime` + artifact origin | 학생 session/token 미전달 |
| 중앙 Tutor API (WDK) | `packages/agent-runtime` + `withWorkflow` | 레슨 colocated Nitro 대신 플랫폼 WDK |
| LMS / Auth / Entitlement | `packages/adapter-postgres` + Supabase Auth | typed graph가 아닌 course/enrollment 모델 |
| Quality Gate / harness | `scripts/harness/*` + `.github/workflows/harness.yml` | docs↔contract 동기화 |

핵심 대응 원리:

- **에이전트가 만든 콘텐츠** = artifact (UGC)
- **플랫폼이 소유한 신뢰 UI** = Course Shell / renderer
- **격리 실행** = Vercel Sandbox
- **durable 에이전트** = Vercel WDK (`workflow/next`)

### 4.2 기술 스택 정렬

Stage 2 플랫폼 앱(`apps/platform` 예정)은 ssota와 동일한 Vercel-native 스택을 우선한다.

| 영역 | ssota 선택 | Faraday Stage 2 |
|---|---|---|
| 웹 앱 | Next.js 16 (`apps/web`) | Next.js 16 (`apps/platform`) |
| 워크스페이스 | pnpm + Turborepo | 기존 monorepo에 `apps/platform` 추가 |
| DB / Auth | Supabase + Drizzle | P0에서 채택 여부 확정, 생성 앱 직접 접근 금지 |
| AI | Vercel AI Gateway + `ai` v7 | 중앙 Tutor API (P4) |
| durable agent | `workflow` + `@ai-sdk/workflow` + `withWorkflow(nextConfig)` | Studio 에이전트(P2) + Tutor(P4) |
| 격리 빌드 | `packages/studio-sandbox` | P2 agent sandbox |
| artifact 빌드 | `packages/studio-build` | P1/P2 build pipeline |
| UI | `@ssota/ui` (Base UI + shadcn) | `@faraday-academy/runtime` UI + platform DS |
| 계약 | `packages/contracts` (Zod) | `packages/platform-contracts` (Zod) |
| 테스트 | Vitest + Playwright | 동일 |

`apps/web/next.config.ts`에서 확인된 WDK 통합 패턴을 플랫폼 앱에도 적용한다.

```ts
const { withWorkflow } = await import("workflow/next");
let result = withWorkflow(nextConfig);
// dev: withEmulate(result) — 외부 OAuth/커넥터 e2e용 (P5 이후)
```

로컬 개발은 WDK “Local World”로 동작하며, Vercel 배포 없이도 durable workflow를 검증할 수 있다.

Node.js 버전은 ssota가 **24.x**를 사용한다. Stage 2 플랫폼 앱은 `apps/platform` 수준에서 Node 24를
채택하고, 기존 CLI/lesson toolchain(Node 22)과 분리한다.

### 4.3 스킬·에이전트 체계

ssota는 `.agents/skills/`에 스킬 정본을 두고, Claude/Cursor 미러는 `pnpm harness:mirrors`로
동기화한다. Faraday도 동일한 **정본 + 미러 + lock** 패턴을 따른다.

Stage 2 플랫폼 작업 시 우선 로드할 ssota 스킬:

| 스킬 | 용도 |
|---|---|
| `next-best-practices` | Next.js 16 App Router, RSC, route handlers |
| `next-cache-components` | 캐시 전략 |
| `vercel-composition-patterns` | Vercel + Next 아키텍처 |
| `vercel-react-best-practices` | React/Vercel 패턴 |
| `ai-sdk` | AI SDK / Gateway |
| `chat-sdk` | 채팅 UI 패턴 |
| `playwright-best-practices` | e2e 작성 규칙 |
| `playwright-cli` | CLI 기반 e2e |
| `agent-browser` | E2E 이후 탐색적 UI 검증 |
| `supabase` / `supabase-postgres-best-practices` | Auth / DB / RLS |
| `deploy-to-vercel` / `vercel-cli-with-tokens` | 배포 |
| `stripe-best-practices` | P5 유료 코스 |

Faraday 고유 스킬(`faraday`, `lecture-design`, `audience` 등)은 **코스 저작·교수법**에 쓰고,
**플랫폼 앱 구현**에는 ssota의 Next.js/Vercel/Playwright 스킬군을 우선한다.

스킬 라우팅 규칙(AGENTS.md 패턴):

```text
플랫폼 UI/Next.js 작업     → next-best-practices, vercel-*, shadcn
DB/Auth 작업              → supabase, supabase-postgres-best-practices
e2e 작업                  → playwright-best-practices, playwright-cli, agent-browser
배포 작업                 → deploy-to-vercel, vercel-cli-with-tokens
코스 저작/교수법           → faraday pack skills
```

P0에서 `skills-lock.json`과 `harness:mirrors`를 도입해 스킬 드리프트를 CI에서 잡는다.

### 4.4 검증·e2e·CI 정렬

ssota `AGENTS.md`의 **Frontend 작업 완료 정의**를 Faraday Stage 2 플랫폼 UI에도 적용한다.

```text
1. 구현 + 정적 검증 (lint, typecheck)
2. Playwright E2E (기능·회귀 SSOT)
3. agent-browser / Computer Use (탐색적 UI 검증)
4. PR/요약에 스크린샷·비디오 첨부
```

검증 티어:

| Tier | 범위 | 게이트 |
|---|---|---|
| 1 | UI 컴포넌트 | `verify:quick` + unit test |
| 2 | contracts / page spec | `verify:quick` + contracts test + e2e grep |
| 3 | adapter / migration | `verify:quick` + test + `e2e:ci` |
| 4 | 머지 전 | `verify:final` + 완료 증거 |

루트 스크립트(이식 목표):

```bash
pnpm harness:docs        # docs/STAGE2-PLATFORM.md ↔ platform-contracts 동기화
pnpm harness:boundaries  # packages 경계 스캔
pnpm harness:mirrors     # 스킬 미러 동기화
pnpm verify:quick        # docs + env + boundaries + lint + typecheck
pnpm verify:final        # harness 전체 + test + e2e:ci
```

Playwright 구조:

| config | 용도 | Faraday 적용 시점 |
|---|---|---|
| `playwright.config.ts` | 메인 e2e (포트 3100/3101, dev와 분리) | P1~P3 |
| `playwright.billing.config.ts` | 결제 e2e | P5 |
| `playwright.emulate.config.ts` | 외부 OAuth 에뮬레이션 | P5 |

`e2e/global-setup.ts` 패턴을 P0~P1에서 이식한다.

1. Supabase health check
2. 없으면 `supabase start`
3. smoke account 로그인 실패 시 `db:migrate` + `db:seed`
4. 재로그인 확인

CI:

| 워크플로우 | 역할 | Faraday 이식 |
|---|---|---|
| `harness.yml` | docs↔contract, boundary, skill mirrors, lint | P0 |
| `oss-build.yml` | cloud env 없이 `JOB_RUNNER=inline`, `AUTH=local` 빌드 | P1 |

`oss-build`는 플랫폼 core가 Supabase/Vercel secret 없이도 typecheck/build 가능함을 강제한다.

### 4.5 이식 매트릭스

#### 직접 이식 (P0~P1)

- Next.js / Vercel / Playwright / Supabase **스킬군** mirror
- `harness.yml` + `scripts/harness/check-*.mjs` 패턴
- `verify:quick` / `verify:final`
- `e2e/global-setup.ts` (Supabase bootstrap)
- `oss-build.yml` (cloud leak 검사)
- `skills-lock.json` + `harness:mirrors`
- AGENTS.md **4단계 UI 완료 정의**

#### ssota 아키텍처 참고 (P1~P4)

- `withWorkflow(next.config.ts)` — Studio/Tutor durable 실행
- `studio-build` + `studio-sandbox` — P2 격리 빌드
- `studio-renderer` — trusted Course Shell
- 헥사고날 패키지 (`core` / `contracts` / `adapter-*`)
- RLS deny-all + 서버만 DB 접근
- `emulate` + `withEmulate` — OAuth/결제 e2e (P5)

#### Faraday 고유 (ssota에서 가져오지 않음)

- Artifact Router + 코스 서브도메인 라우팅
- `CourseDefinition` / LMS manifest / assessment schema
- `PRACTICE` / `OFFICIAL` 평가 분리
- `PUBLIC_FREE` / `PUBLIC_PAID` entitlement
- trusted Course Shell ↔ UGC iframe bridge
- 교육 도메인 스킬 (`faraday` pack)

### 4.6 권장 모노레포 스캐폴드

Stage 2 착수 시 ssota 패턴을 따른 초기 구조:

```text
apps/
  platform/                 # Next.js 16 — Studio + Course Shell + API
  platform-mcp/             # (선택) MCP/API 분리

packages/
  platform-contracts/       # course, LMS, assessment, entitlement (Zod)
  platform-core/            # ports + use-cases
  platform-adapter-supabase/
  platform-studio-build/
  platform-studio-sandbox/
  platform-artifact-router/

e2e/
  global-setup.ts
  playwright.config.ts
  playwright.billing.config.ts

.agents/skills/
  next-best-practices/      # ssota mirror
  vercel-*/
  playwright-*/
  supabase/
  faraday-platform/         # Faraday 플랫폼 전용
```

기존 `packages/cli`, `packages/runtime`, `packages/tutor`, `packages/official-packs`는 Stage 1
경로로 유지한다. Stage 2는 **새 앱/패키지 트리**로 추가하고 lesson toolchain과 경계를 분리한다.

### 4.7 페이즈별 ssota 정렬 체크리스트

| Faraday 페이즈 | ssota에서 가져올 것 |
|---|---|
| P0 | harness:docs, contracts Zod, skill mirrors, auth bootstrap 패턴, UI DoD 문서화 |
| P1 | studio-build delivery, oss-build CI, Playwright 메인 config |
| P2 | studio-sandbox, withWorkflow, build worker 격리·quota |
| P3 | e2e global-setup, adapter-postgres, RLS deny-all |
| P4 | agent-runtime + WDK tutor run, AI Gateway 계측 |
| P5 | playwright.billing, emulate OAuth, stripe-best-practices |
| P6 | community e2e + moderation audit 패턴 |
| P7 | verify:final, DR/backup, cost dashboard |

### 4.8 리스크와 주의

| 항목 | 내용 | 대응 |
|---|---|---|
| ssota vs mirror-dimension 혼동 | ssota = 인프라·harness, mirror-dimension = 호스티드 Studio 제품 | §4.1·§4.9 역할 표를 정본으로 유지 |
| 라이선스 | ssota는 Sustainable Use License | **패턴·스킬·harness는 참고**, 코드 복사는 LICENSE 검토 |
| `studio-sandbox` 내부 | 구현 세부는 README/e2e로 역산 | P2에서 Vercel Sandbox API와 함께 설계 |
| `emulate` 패키지 | npm 공개 여부 별도 확인 | 없으면 Playwright mock/intercept로 대체 |
| 도메인 모델 차이 | ssota typed graph ≠ Faraday course | 포트/계약/harness 패턴만 이식 |
| Node 버전 | ssota 24 vs Faraday CLI 22 | `apps/platform`만 Node 24 |
| “환각 없는 튜터” 마케팅 | ssota도 측정 가능한 품질 주장 사용 | 인용률·거부 정확도·누출 회귀 테스트로 표현 |

ssota 정렬은 Faraday의 **Artifact Router·교육 도메인·오픈 플랫폼 정책**을 대체하지 않는다.
구현 속도와 품질 게이트를 ssota에서 가져오되, 제품 경계는 이 문서 §1~§3과 §6 이후 절이 우선한다.

### 4.9 채팅 표면 아키텍처

플랫폼에는 **서로 다른 세 가지 대화·커뮤니케이션 표면**이 있다. 하나의 `/api/chat`로 합치지 않는다.
각 표면은 origin, 인증, durable run 소유권, grounding, UI mount 지점이 다르다.

```text
┌─ A. Creator Studio chat ─────────────────────────────────────┐
│ origin: studio.faraday.com                                    │
│ UI: 좌 채팅 · 우 preview iframe (derivePreviewUrl)           │
│ API: POST /api/studio/chat  →  runStudioAgent (WDK)           │
│ tools: sandbox read/write, build, manifest, quality gate      │
│ 참조: mirror-dimension studio-session, dimension-agent        │
└───────────────────────────────────────────────────────────────┘

┌─ B. Learner Tutor chat ─────────────────────────────────────┐
│ origin: {courseSlug}.learn.faraday.com (trusted Course Shell) │
│ UI: Shell overlay — UGC iframe 밖, docked Tutor 패널          │
│ API: POST /api/tutor/runs  →  GET .../stream (WDK reconnect)  │
│ grounding: sealed bundle + LMS projection (서버 조립)         │
│ 평가 중: officialAttemptId로 answer leakage 정책 강제           │
└───────────────────────────────────────────────────────────────┘

┌─ C. Course community ────────────────────────────────────────┐
│ origin: Course Shell widget / community 서브경로               │
│ 형태: 비동기 게시판 (thread/post) — 실시간 채팅 아님 (§11)     │
│ API: REST — /v1/courses/:id/community/*                       │
└───────────────────────────────────────────────────────────────┘
```

#### A. Creator Studio chat (P2)

mirror-dimension Stage 2+ `apps/web` 패턴을 따른다.

| 항목 | mirror-dimension | Faraday Stage 2 |
|---|---|---|
| 제작 단위 | `dimension` | `course` / `course_version` |
| 채팅 transport | `WorkflowChatTransport` | 동일 |
| route | `POST /api/chat` | `POST /api/studio/chat` |
| workflow | `dimension-agent` | `studio-agent` (Faraday skill/pack registry) |
| preview | `derivePreviewUrl` → sandboxed iframe | `{buildId}.preview.faraday.com` |
| run 소유권 | `recordRunOwner` (user/project) | `recordRunOwner` (user/course draft) |
| 세션 | 대화·파일 상태 DB persist | draft snapshot + 대화 이력 persist |

Studio UI 레이아웃:

```text
┌────────────────── studio.faraday.com ──────────────────┐
│  [채팅 패널]          │  [preview iframe]              │
│  WorkflowChatTransport│  derivePreviewUrl(buildId)     │
│  tool calls 로그      │  postMessage (preview 계약만)   │
│  build/quality 결과   │  플랫폼 cookie·secret 없음      │
└──────────────────────────────────────────────────────┘
```

에이전트 sandbox는 Vercel Sandbox(ssota `studio-sandbox`)에서 소스를 수정하고, quality gate 통과 후
artifact를 업로드한다. Studio 채팅에는 **학습자 session·entitlement·공식 정답**이 들어가지 않는다.

참조 구현 (mirror-dimension, 패턴 이식 — LICENSE 검토 후):

- `apps/web/components/studio/studio-session.tsx` — 2-pane Studio 세션
- `apps/web/app/api/chat/route.ts` — chat route + run 소유권
- `apps/web/app/workflows/dimension-agent.ts` — durable agent + tool wiring

#### B. Learner Tutor chat (P4)

학습자 튜터는 **신뢰된 Course Shell overlay**다. 생성된 UGC iframe 안에 Tutor를 mount하지 않는다.

| 항목 | standalone lesson (Stage 1) | 플랫폼 (Stage 2) |
|---|---|---|
| Tutor mount | 레슨 앱 내부 (`<Tutor>`) | Course Shell overlay |
| API | colocated `POST /api/chat` (Nitro+WDK) | 중앙 `POST /api/tutor/runs` |
| endpoint 설정 | `api: "/api/chat"` 고정 | configurable + Shell이 주입 |
| grounding | 레슨 `.env` / 로컬 번들 | sealed bundle (서버만 조회) |
| 평가 연동 | pack 수준 정책 | `officialAttemptId` → 서버가 lock 모드 결정 |

요청 흐름:

```text
UGC iframe
  └─ requestTrustedSurface({ kind: "TUTOR" })
       └─ Course Shell overlay open
            └─ POST /api/tutor/runs { courseVersionId, nodeId, messages, officialAttemptId? }
                 └─ 서버: entitlement · grounding · budget · exam policy
                      └─ WDK run → SSE stream → reconnect by runId
```

wire protocol은 기존 tutor pack의 POST/SSE/runId/reconnect를 **가능한 한 유지**한다(§10.3).
conversation/run ID는 Shell session에 영속해 새로고침 후 같은 run에 재연결한다.

#### C. Course community (P6)

커뮤니티는 채팅 SDK·WDK 대상이 **아니다**. REST 기반 비동기 게시판(§11)이며, Course Shell
widget 또는 deep link로 노출한다. enrollment/entitlement 없이는 읽기·쓰기 불가.

#### 공통 원칙

1. **origin 분리** — Studio / Learning / Preview / Artifact는 서로 다른 cookie scope.
2. **run 소유권** — 모든 durable agent run은 user + 리소스(course/draft)에 귀속; reconnect마다 검증.
3. **UGC 무토큰** — 생성 iframe에는 learner session, tutor token, API capability를 전달하지 않음(§13.2).
4. **grounding 서버 조립** — 클라이언트가 보낸 `context`·system instruction·answer key 무시(§10.2).
5. **라우트 분리** — `/api/studio/chat` ≠ `/api/tutor/runs`; 합치지 않음.

---


## 5. Artifact Router

### 5.1 Artifact 모델

빌드 결과는 수정하지 않는다.

```text
artifacts/{projectId}/{buildHash}/
  index.html
  assets/*
  faraday.release.json
  faraday.public-manifest.json
```

서버 전용 산출물은 공개 artifact와 분리한다.

```text
sealed/{courseVersionId}/
  grounding-bundle
  official-answer-keys
  grading-policy
```

`faraday.release.json` 최소 필드:

```ts
interface ReleaseManifest {
  schemaVersion: number;
  buildHash: string;
  courseId: string;
  courseVersionId: string;
  runtimeVersion: string;
  createdAt: string;
  entrypoint: "index.html";
  files: Array<{ path: string; sha256: string; bytes: number }>;
}
```

`files`는 `faraday.release.json` 자신을 제외한다. manifest 자체의 hash/signature는 release DB record에
별도로 저장해 self-reference를 피한다.

### 5.2 Preview 흐름

1. 제작 에이전트가 격리된 sandbox에서 소스를 수정한다.
2. typecheck, build, manifest validation, quality gate를 실행한다.
3. `dist/`를 build hash 경로에 업로드한다.
4. preview record가 build를 가리킨다.
5. Studio는 별도 origin의 sandboxed iframe을 연다.
6. Studio와 iframe은 허용된 `postMessage` 계약으로만 통신한다.

Preview 보안 기본값:

- 별도 origin
- 제한된 iframe `sandbox`
- 엄격한 CSP
- 짧은 수명의 preview token
- platform cookie 접근 금지
- 외부 네트워크 목적지 allowlist 또는 명시적 경고
- secret과 서버 전용 bundle 미주입
- preview 최초 navigation과 하위 asset 요청에만 유효한 host-scoped signed cookie

### 5.3 Publish 흐름

```text
validated build
  → immutable course_version
  → public artifact + sealed bundle 확정
  → release 생성
  → release 상태 READY
  → course.active_release_id 원자적 교체
```

publish 중 실패하면 기존 release를 유지한다. 새 release가 `READY`가 되기 전에는 production alias를
바꾸지 않는다.

### 5.4 Request 흐름

```text
GET https://physics.learn.faraday.com/
  1. hostname → course 조회
  2. Course Shell 반환
  3. 무료: guest access grant 또는 user entitlement 확인
     유료: user entitlement 확인
  4. active_release 조회
  5. artifact용 host-scoped read-only cookie 발급
  6. https://{buildHash}.artifact.../index.html 을 sandboxed iframe으로 로드
  7. 학습 이벤트·평가·튜터·커뮤니티는 Shell이 처리
```

- 무료 코스 hash asset: `Cache-Control: public, max-age=31536000, immutable`
- 유료 코스 hash asset: entitlement 확인 후 release-scoped signed delivery; module/CSS 요청에는
  artifact host의 HttpOnly cookie가 자동 첨부되며 공유 public cache는 금지
- `index.html`과 release pointer: 짧게 캐시하거나 재검증

Artifact cookie에는 LMS·평가·튜터 권한이 없고 해당 release를 읽는 권한만 둔다. 생성 iframe에는
학생 session이나 course capability token을 전달하지 않는다.

### 5.5 Rollback

rollback은 이전 `READY` release로 `active_release_id`를 교체한다. 원자성은 control-plane의 포인터
변경에 한정되며, 이미 캐시된 index가 만료되는 짧은 수렴 구간은 허용한다.

- DB transaction으로 원자적 전환
- rollback 이력과 수행자 기록
- 기존 학습 이벤트는 자신이 발생한 `courseVersionId` 유지
- rollback 때문에 과거 성적이나 평가 정의를 재해석하지 않음

### 5.6 Artifact Router 불변 정책

Artifact Router는 플랫폼 코스의 장기 배포 모델이다. 코스 수가 늘어도 코스별 Vercel 프로젝트로
전환하지 않는다. 서버 기능이 필요한 경우에도 코스에 서버를 붙이지 않고 중앙 서비스의 명시적 API를
확장한다.

CLI 사용자의 자체 배포는 별도 경로로 계속 허용한다.

### 5.7 인증 bootstrap

학습 도메인은 플랫폼 전체 session cookie를 공유하지 않는다.

1. Course Shell에 session이 없으면 auth origin으로 이동한다.
2. `state`, PKCE, 허용된 `return_to`를 검증한 one-time code를 발급한다.
3. learning origin의 backend가 code를 교환한다.
4. `{courseSlug}.learn...`에만 적용되는 host-only, HttpOnly, Secure cookie를 설정한다.
5. Course Shell이 중앙 API를 호출하고 UGC iframe에는 제한된 결과/명령만 전달한다.

CSRF, code replay, open redirect를 P0 위협 모델과 계약 테스트에 포함한다.

---

## 6. 사용자·소유권·접근 정책

### 6.1 최소 모델

```text
users
creator_profiles
courses
course_collaborators
course_versions
builds
releases
enrollments
entitlements
```

- `courses.owner_id`: 최초 소유자
- `course_collaborators`: 필요한 경우에만 editor/viewer 권한 제공
- `enrollments`: 학습 관계와 진도 컨텍스트
- `entitlements`: 콘텐츠에 들어갈 수 있는 최종 권한의 정본

무료와 유료 모두 entitlement를 사용한다.

```ts
type EntitlementStatus =
  | "PENDING"
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED"
  | "REFUNDED"
  | "DISPUTED";
```

entitlement에는 `source`, `providerReference`, `startsAt`, `expiresAt`, `courseId`, grant/revoke 사유를
기록한다. 무료 guest access는 DB 행을 무한 생성하지 않고 짧은 수명의 stateless signed grant로 처리한다.

### 6.2 코스 상태

```ts
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type CourseAccess = "PUBLIC_FREE" | "PUBLIC_PAID";
```

- 모든 publish 코스는 공개 landing page를 갖는다.
- `PUBLIC_FREE`: 시작 시 무료 entitlement 발급
- `PUBLIC_PAID`: 결제 완료 후 entitlement 발급
- `ARCHIVED`: 신규 등록 차단. 기존 구매자의 접근 정책은 별도 보존

초대 전용·학교 전용 타입은 지금 추가하지 않는다.

비로그인 무료 방문자는 짧은 수명의 guest entitlement를 사용할 수 있다. 로그인 전 진도를 서버에
보존할지는 §18의 정책 결정 전까지 로컬에만 저장한다.

### 6.3 무료 ↔ 유료 변경

- 변경은 새 course version이 아니라 course commerce policy 변경으로 기록한다.
- 무료에서 유료로 바꿀 때 기존 등록자는 기본적으로 기존 entitlement를 유지한다.
- 유료에서 무료로 바꿔도 기존 구매·정산 기록은 삭제하지 않는다.
- 가격·접근 정책의 변경 이력을 감사 로그에 남긴다.

### 6.4 유료 콘텐츠 보호의 한계

로그인, entitlement, signed delivery로 비구매자의 직접 접근을 막는다. 그러나 브라우저로 전달된
HTML/JS/미디어의 완전한 복사를 보장하지 않는다. 고가 미디어는 별도 signed URL과 만료 정책을 사용한다.
LMS, 공식 성적, 튜터, 커뮤니티 API는 artifact URL을 알아도 entitlement 없이 사용할 수 없다.

---

## 7. 코스 버전과 선언형 manifest

### 7.1 불변 버전

publish된 `course_version`은 수정하지 않는다. 제작자가 수정하면 draft에서 새 버전을 만들고 다시
publish한다.

모든 학습 데이터는 다음을 포함한다.

- `courseId`
- `courseVersionId`
- 안정적인 `nodeId` / `assessmentId`
- event 또는 schema version

enrollment는 학습을 시작한 `courseVersionId`에 pin한다. 새 release가 나와도 진행 중 학습자를 자동
이동시키지 않는다. 제작자가 migration map을 제공하고 플랫폼이 검증한 경우에만 새 버전으로 이동한다.
기존 구매자가 새 버전에 접근할 수 있는지는 entitlement의 course scope로 결정하되, 공식 평가 기록은
항상 원래 version에 남긴다.

### 7.2 제작자가 설정할 수 있는 것

```json
{
  "schemaVersion": 1,
  "nodes": [],
  "outcomes": [],
  "assessments": [],
  "completionRules": [],
  "gradingPolicy": {},
  "customMetadata": {}
}
```

제작 에이전트는 이 manifest를 생성·수정할 수 있다. 플랫폼은 JSON Schema와 의미 검증을 수행한다.

현재 React `Course`와 별도로 직렬화 가능한 플랫폼 계약을 정의한다.

```ts
interface CourseDefinition {
  schemaVersion: number;
  courseId: string;
  nodes: Array<{
    id: string;
    lessonComponentId: string;
    requires?: string[];
    completionRule?: unknown;
  }>;
}
```

`lessonComponentId`는 artifact module registry에 연결한다. `packState`는 JSON만 허용하고 pack별
schema, 최대 크기, version, migration 정책을 둔다.

제작자가 할 수 없는 것:

- SQL 실행
- 테이블·인덱스·RLS 생성
- 임의 backend route 배포
- service role key 접근
- 플랫폼의 정본 진도·성적을 직접 변경

---

## 8. LMS 정책

### 8.1 Event + Projection

학습 상호작용은 append-only event로 받고, 서버 projection이 현재 진도를 계산한다.

```ts
interface LearningEvent {
  eventId: string; // idempotency key
  schemaVersion: number;
  courseId: string;
  courseVersionId: string;
  learnerId: string;
  sessionId: string;
  nodeId?: string;
  type: string;
  occurredAt: string;
  payload: unknown;
}
```

서버는 인증된 사용자에서 `learnerId`를 결정한다. 클라이언트가 보낸 사용자 ID를 신뢰하지 않는다.

### 8.2 정본과 비정본

| 데이터 | 판정 주체 |
|---|---|
| 화면 열기, 컨트롤 조작, 연습 시도 | 클라이언트 이벤트 허용 |
| 로그인 사용자, enrollment, entitlement | 서버 |
| 공식 평가 점수·통과 | 서버 |
| 선행 조건과 공식 완료 | 서버 |
| XP·보상 중 성적/접근에 영향을 주는 값 | 서버 |

클라이언트는 optimistic UI를 보여줄 수 있지만 서버 결과와 충돌하면 서버가 우선한다.

UGC interaction만으로 충족되는 제작자 정의 progress는 학습 편의 상태이지 인증된 성취 증명이 아니다.
공식 통과·성적·credential에 영향을 주는 completion은 trusted assessment grant처럼 서버가 검증한
근거만 사용한다.

### 8.3 저장과 동기화

- 이벤트는 `eventId`로 중복 제거
- 네트워크 단절 시 로컬 queue 후 재전송
- 동일 사용자의 여러 기기는 서버 projection으로 수렴
- 이벤트 원본은 감사·재계산에 필요한 기간 동안 보관
- 대시보드는 이벤트 전체가 아니라 projection/aggregate를 기본 조회

### 8.4 현재 런타임에서의 이행

현재 자산은 개념과 UI의 출발점으로 재사용하되 플랫폼 wire contract로 그대로 사용하지 않는다.

- `Course`, `Progress`, `CourseEvent`: `CourseDefinition`과 명령/이벤트 계약 설계의 입력
- `CourseHost.onEvent`: 비정본 interaction intent를 bridge로 보내는 연결점
- `progression.ts`: 잠금·완료 검증을 보강한 뒤 서버와 규칙 공유
- `useLmsRecorder`: standalone/local 모드 유지
- `ProgressDashboard`: 플랫폼 query 결과를 받는 UI로 확장

현재 이벤트에는 event ID, schema/course/user/session/time이 없고 localStorage 배열 덮어쓰기 방식이므로
새 Platform Event Adapter가 필요하다. 플랫폼 모드의 local recorder는 standalone fallback으로만 두고,
offline queue는 별도 구현한다. `complete`와 XP는 클라이언트 이벤트가 아니라 서버 command 결과로
확정한다.

---

## 9. 평가 정책

### 9.1 공통 타입

```ts
type AssessmentMode = "PRACTICE" | "OFFICIAL";
```

모든 assessment에는 안정적인 `assessmentId`, `itemId`, `assessmentVersionId`가 있어야 한다.
`OFFICIAL`은 해당 코스 안에서 플랫폼이 무결성을 보장하는 제작자 지정 성적이라는 뜻이며, 국가·학교의
공인 시험 또는 자격 인증을 의미하지 않는다.

### 9.2 연습(`PRACTICE`)

- 목적: 피드백과 숙달
- 클라이언트 즉시 채점 허용
- 기본 무제한 재시도
- 힌트와 튜터 허용
- LMS에 시도와 학습 패턴 기록
- 공식 성적에는 미반영
- 정답이 public artifact에 포함될 수 있음

### 9.3 공식 평가(`OFFICIAL`)

- 목적: 성취 판정과 성적
- 문제와 응답 UI는 UGC iframe이 아니라 신뢰된 Course Shell의 assessment renderer가 표시
- 정답과 채점 정책은 sealed bundle에만 저장
- 서버가 attempt 생성, 응답 접수, 채점, 제출 확정
- public item version hash와 sealed grading key hash를 publish 시 결속
- attempt 생성 시 item set, 선택지 순서, assessment version을 서버가 고정
- 응시 횟수·제한 시간·마감·재응시 정책 지원
- 제한 시간과 마감은 서버 시각 기준
- 응답 저장과 최종 제출은 idempotency key 사용
- 제출된 attempt는 덮어쓰지 않고 새 상태 전이로 기록
- 점수에 사용한 assessment version을 영구 연결
- 튜터는 평가 중 비활성화하거나 제한된 평가 모드로 동작
- 클라이언트가 보낸 `correct`, `score`, `passed` 무시
- 통과 시 서버가 progression에 assessment grant를 기록
- 접근성 accommodation은 attempt 생성 전에 서버 정책으로 적용

### 9.4 상태 모델

```text
NOT_STARTED → IN_PROGRESS → SUBMITTED → GRADED
                         └→ EXPIRED
```

관리자 수동 변경 기능을 나중에 추가하더라도 원본 점수를 덮어쓰지 않고 adjustment와 사유를 별도 기록한다.

---

## 10. 관리형 AI 튜터 정책

### 10.1 경계

프론트:

- Tutor UI
- `UIMessage` 상태
- SSE 표시
- 중단·재연결

서버:

- 인증과 entitlement
- conversation/run 소유권
- system instruction
- grounding bundle 조회
- Workflow 실행
- AI Gateway 호출
- rate limit과 예산
- 대화 보존 정책
- 공식 평가 모드

### 10.2 요청 계약 방향

```ts
interface PlatformTutorRequest {
  messages: UIMessage[];
  courseVersionId: string;
  nodeId?: string;
  conversationId?: string;
  officialAttemptId?: string;
}
```

클라이언트가 보낸 임의의 `context`, system instruction, answer key는 무시한다. 서버가 배포 시 봉인된
bundle과 LMS 상태에서 grounding을 구성한다.

### 10.3 현재 구현에서 필요한 변경

채팅 표면 분리와 mount 지점은 §4.9를 따른다.

- `@faraday-academy/tutor`의 `api: "/api/chat"` 고정을 configurable endpoint로 변경
- Course Shell이 인증과 course context를 소유하고 trusted tutor overlay를 렌더
- 플랫폼 빌드에서는 lesson-local Tutor UI/Nitro/API/Workflow를 제거하고 UGC에는 tutor overlay open
  intent만 제공
- 기존 POST/SSE/runId/reconnect wire protocol은 가능한 한 유지
- run/conversation을 user/course에 귀속하고 reconnect마다 소유권 검증
- conversation/run ID를 Shell session에 영속해 새로고침 후 재연결
- standalone/BYOK tutor pack은 기존 colocated 경로 유지

### 10.4 비용과 안전 기본값

- 사용자·코스·제작자 단위 사용량 기록
- 요청 rate limit, 동시 run 제한, 일/월 비용 상한
- budget 초과 시 명확한 사용자 메시지와 추가 호출 차단
- 공식 평가 진행 중 answer leakage 정책 강제
- grounding 밖 질문에는 답변 제한 또는 거부
- 모델·프롬프트·grounding bundle 버전을 run에 기록

AI 비용을 제작자에게 전가할지, 유료 코스 가격에 포함할지는 상업 정책으로 남기되 사용량 계측은 첫
버전부터 넣는다.

---

## 11. 커뮤니티 정책

### 11.1 MVP

```text
course_spaces
threads
posts
comments
reactions
reports
moderation_actions
```

- 코스별 질문·공지 게시판
- enrollment/entitlement 보유자만 작성
- 제작자는 공지, 고정, 잠금, 숨김 가능
- 신고와 moderation audit log 제공
- 생성 코스에는 platform widget 또는 deep link로 노출

### 11.2 초기 제외

- 학생 간 DM
- 익명 게시
- 실시간 채팅
- 무제한 파일 업로드
- 플랫폼 전체 공개 소셜 피드

미성년 가능성을 고려해 표시 이름·프로필 정보·보존 데이터를 최소화한다.

---

## 12. 중앙 Platform SDK와 API

생성 코드는 Supabase, 중앙 API, 결제·Workflow 서비스에 직접 접근하지 않는다. 아래 SDK는 신뢰된
Course Shell에서 실행되며, UGC에는 별도의 제한된 bridge API만 노출한다.

```ts
faraday.auth.session()
faraday.course.entitlement()
faraday.lms.enterNode(nodeId)
faraday.lms.completeNode(nodeId)
faraday.lms.track(type, payload)
faraday.assessment.start(assessmentId)
faraday.assessment.submit(attemptId, responses)
faraday.tutor.send(...)
faraday.community.open()
```

UGC bridge가 허용하는 것은 비정본 interaction 보고, practice UI 상태, trusted overlay 열기 요청이다.
공식 응답·성적, 사용자 프로필, tutor token, community 데이터는 bridge를 통해 UGC에 반환하지 않는다.

```ts
interface UgcBridge {
  emitInteraction(input: { eventId: string; type: string; nodeId?: string; payload?: unknown }): void;
  requestTrustedSurface(input: {
    kind: "OFFICIAL_ASSESSMENT" | "TUTOR" | "COMMUNITY";
    resourceId?: string;
  }): void;
}
```

Shell은 iframe의 exact origin, `event.source`, message schema, course version, rate limit을 검증하고
`MessageChannel` handshake 후에만 요청을 받는다. learner/course identity는 Shell이 서버 session에서
채우며 UGC 입력을 사용하지 않는다.

초기 API 표면:

```text
POST /v1/enrollments
GET  /v1/courses/:courseId/entitlement
POST /v1/lms/events:batch
GET  /v1/courses/:courseId/progress
POST /v1/assessments/:id/attempts
POST /v1/assessment-attempts/:id/submit
POST /v1/tutor/runs
GET  /v1/tutor/runs/:runId/stream
GET  /v1/courses/:courseId/community/threads
POST /v1/courses/:courseId/community/threads
```

API 규칙:

- versioned path 또는 versioned DTO
- idempotency key
- exact-origin CORS
- 사용자·코스 권한을 매 요청 검증
- SDK가 없어도 계약 테스트 가능한 HTTP API
- 오류 코드는 UI가 복구 행동을 결정할 수 있도록 구조화

---

## 13. 데이터와 보안 정책

### 13.1 기본 원칙

- 최소 수집
- 목적별 보존 기간
- 사용자 데이터 export/delete 경로
- private bucket 기본
- secret은 build/preview/browser에 주입하지 않음
- RLS와 서버 authorization을 함께 적용
- audit log: publish, rollback, 가격, entitlement, 공식 성적 변경
- Supabase Storage의 release object overwrite 금지와 삭제 권한 분리
- DB PITR, object inventory, cross-location backup, KMS 서명키 복구 절차

### 13.2 생성 코드 신뢰 경계

제작자가 만든 프론트엔드는 플랫폼 내부 코드가 아니라 **사용자 생성 코드**로 취급한다.

- 학습자 전체 roster를 생성 앱에 전달하지 않음
- 학생 앱 token은 자기 데이터와 현재 코스에만 제한하고 짧게 만료
- 플랫폼 login session과 course capability token을 생성 코드에 전달하지 않음
- 공식 평가·튜터·커뮤니티는 trusted Shell UI에서 렌더
- 제작자 analytics는 Studio의 플랫폼 UI에서 제공
- wildcard credentialed CORS 금지
- 코스별 origin 분리
- 외부 script와 connect target 정책 검사
- official answer key와 service credential을 public bundle에서 검사

### 13.3 미성년 정책

오픈 플랫폼에서는 실제 연령대를 통제하기 어렵다. 학생 인증을 출시하기 전에 최소한 다음을 확정한다.

- 최소 가입 연령과 보호자 동의가 필요한 지역
- 프로필 공개 범위
- 대화·커뮤니티 보존 기간
- 신고 및 삭제 처리
- 튜터 안전 정책

법률 준수 여부를 제품 문구로 선언하기 전에 별도 법률 검토를 거친다.

---

## 14. Quality Gate

### 14.1 Build gate

- dependency/install 재현성
- typecheck/build
- 일회성 build worker, CPU·메모리·시간·파일 quota
- install script 정책, lockfile 검증, package allow/deny와 취약점·라이선스 검사
- build 중 outbound network 제한과 secret-free 환경
- source snapshot→artifact provenance/SBOM
- required manifest와 stable ID
- artifact 파일 hash
- bundle 크기와 route fallback
- 금지 secret·server answer key scan
- 외부 네트워크/CSP 검사

### 14.2 Curriculum/LMS gate

- 고아·도달 불가 노드 없음
- 선행 조건 deadlock 없음
- completion rule 유효성
- 모든 event/assessment ID의 고유성과 안정성
- official assessment가 server grading contract를 사용

### 14.3 Tutor gate

- grounding source 존재
- 자료 밖 질문 거부
- 공식 평가 정답 누출 테스트
- prompt/version 기록
- cost limit과 rate limit
- durable reconnect

### 14.4 Release gate

- public artifact와 sealed bundle 분리 확인
- public item hash와 sealed grading key binding 확인
- preview smoke test
- entitlement별 접근 테스트
- 이전 release rollback 가능
- release와 course version의 1:1 참조 확인

---

## 15. 구현 페이즈

### P0 — 계약과 위협 모델

산출물:

- creator/learner identity kernel과 auth bootstrap
- course/LMS/assessment manifest v1
- course version과 release 상태 모델
- Platform SDK 인증 방식
- trusted Course Shell ↔ sandboxed UGC bridge
- public artifact vs sealed bundle 계약
- 무료·유료 entitlement 상태 모델
- 생성 코드 위협 모델과 origin/CSP 정책
- 최소 이용약관, 콘텐츠 라이선스·신고·삭제, 개인정보 export/delete 정책

완료 조건:

- 하나의 샘플 코스를 manifest → build → release로 표현 가능
- 공식 정답이 public artifact에 없음을 자동 검증
- UGC가 learner session/token을 읽을 수 없음
- login→learning origin one-time code 교환의 CSRF/replay 테스트 통과
- API 권한 표가 문서화됨

### P1 — Artifact Plane과 Router

산출물:

- build artifact upload
- release manifest와 file integrity
- preview domain과 iframe
- wildcard learning domain router와 trusted Course Shell
- publish/atomic alias/rollback
- guest signed grant와 public-free access

완료 조건:

- Vercel 재배포 없이 코스 publish와 rollback
- 두 코스가 서로 다른 origin/artifact로 동시 동작
- 오래된 hash asset과 새 index의 캐시 충돌 없음
- private artifact의 index/module/CSS 요청이 host-scoped cookie로 동작

### P2 — 웹 제작 Studio

산출물:

- 프로젝트·파일·대화 UI
- 제작자 session과 project ownership
- 격리된 agent sandbox
- Faraday skill/pack registry와 version pin
- build log, quality result, preview loop
- draft/source snapshot

완료 조건:

- 새 사용자가 로컬 도구 없이 코스 생성→수정→preview→publish
- 실패한 build가 production release를 변경하지 않음
- sandbox에 플랫폼 secret이 노출되지 않음

### P3 — 학습자 인증과 LMS

산출물:

- user session, free enrollment/entitlement
- Platform LMS adapter
- event batch ingest와 idempotency
- progress projection
- 학생 자기 진도
- 제작자 roster/aggregate dashboard
- 사용자 학습 데이터 export/delete 최소 기능

완료 조건:

- 여러 기기에서 진도가 서버 상태로 수렴
- 클라이언트가 위조한 XP/완료가 공식 projection을 변경하지 못함
- 이전 course version의 기록이 새 버전 publish 후 유지

### P4 — 평가와 관리형 튜터

산출물:

- PRACTICE/OFFICIAL authoring schema
- 공식 attempt·server grading·sealed answer key
- trusted official assessment renderer
- 중앙 Tutor API/Workflow/Gateway
- sealed grounding
- LMS context 연결
- 평가 모드와 비용 상한

완료 조건:

- 공식 정답과 점수가 public bundle/클라이언트 요청에 없음
- public item과 sealed grading key의 hash binding 검증
- 튜터가 course version에 맞는 grounding만 사용
- refresh 후 같은 workflow run에 재연결
- quota 초과 시 추가 비용이 발생하지 않도록 차단

### P5 — 유료 코스

산출물:

- product/price/order/payment/entitlement
- 공개 landing + 구매 gate
- paid artifact delivery
- 환불·취소·접근 정책
- 기본 fraud/chargeback/webhook abuse 방어
- 제작자 매출·사용량 화면

완료 조건:

- 결제 성공 전 콘텐츠/LMS/튜터 접근 차단
- webhook 재전송이 중복 entitlement를 만들지 않음
- 환불과 기존 학습 데이터 처리 정책이 일관됨

정산 방식과 Merchant of Record는 P5 착수 전 확정한다. 데이터 모델에서는 결제 provider 상태와
entitlement를 분리해 provider 교체 가능성을 남긴다.

### P6 — 코스 커뮤니티

산출물:

- thread/post/comment/reaction
- enrollment 기반 접근
- 공지·고정·잠금
- 신고·숨김·moderation log
- 연령·표시 이름·보존·신고 처리 정책
- 코스 widget/deep link

완료 조건:

- entitlement가 없는 사용자는 비공개 커뮤니티를 읽거나 쓰지 못함
- 제작자 moderation과 사용자 신고 흐름이 동작
- 삭제·숨김 이력이 감사 가능

### P7 — 운영 강화와 공개 확장

산출물:

- 고급 abuse/fraud 탐지
- AI·storage·bandwidth 비용 대시보드
- export/delete 운영 자동화와 SLA
- disaster recovery와 artifact restore
- accessibility/performance regression gate
- 검색·추천·SEO

완료 조건:

- 서비스별 비용 상한과 경보
- DB PITR/backup과 object inventory로 release metadata 복구 후 artifact 무결성 검증
- 사용자 탈퇴·데이터 삭제 정책을 실행 가능

---

## 16. 페이즈 의존성과 병렬화

```text
P0
 ├── P1 Artifact Router ── P2 Studio
 └── P3 Learner/LMS

P1 + P3 ───────────────┬── P4 Assessment/Tutor
                       ├── P5 Paid Courses
                       └── P6 Community

P1~P6 ── P7 Operations
```

- P0 계약 없이 Studio부터 만들지 않는다. 에이전트가 생성할 API와 manifest가 흔들리기 때문이다.
- creator/learner identity kernel은 P0에 포함하므로 P2 Studio가 P3보다 먼저 진행될 수 있다.
- P1과 P3는 P0 이후 병렬 진행 가능하다.
- P4는 P1의 version/sealed delivery와 P3의 learner/LMS identity가 모두 필요하다.
- P5는 P1의 private artifact delivery와 P3의 entitlement가 모두 필요하다.
- P6는 P1의 trusted Shell과 P3의 enrollment/entitlement가 모두 필요하다.
- 개인정보·저작권·안전·fraud의 최소 정책은 각 기능 출시 gate에 포함하고 P7까지 미루지 않는다.

---

## 17. 출시 정책과 지표

### 제작자 지표

- 첫 preview 성공률
- 첫 publish 성공률
- 생성 시작→publish 시간
- quality gate 자동 수정률
- 두 번째 코스 제작률

### 학생/LMS 지표

- 무료 enrollment→첫 노드 시작률
- 코스 완료율과 재방문
- 연습 재시도 후 향상
- 공식 평가 제출·통과

### 유료 지표

- landing→구매 전환
- 유료 코스 활성 학습률
- 환불률
- creator GMV
- 코스별 AI 비용/매출 비율

### 플랫폼 지표

- publish/rollback 성공률
- LMS event ingest 오류·중복률
- Tutor first-token latency와 reconnect 성공률
- build/storage/egress/AI 단위 비용

단순 가입자 수보다 **제작 성공, 실제 학습, 재제작, 유료 학습 지속**을 우선한다.

---

## 18. 남은 정책 결정

구현 방향은 확정됐지만 다음은 해당 페이즈 착수 전에 결정해야 한다.

1. 플랫폼과 제작자 중 누가 Merchant of Record가 되는가
2. 환불 시 코스 접근을 즉시 회수할지, 기간 종료까지 유지할지
3. 관리형 튜터 비용을 제작자 예산, 구매 가격, 학생 추가 사용 중 어디에 포함할지
4. 무료 코스의 비로그인 진도를 서버에 익명 저장할지, 로그인 전에는 로컬에만 둘지
5. 공식 평가 결과 공개 시점과 제작자 수동 재채점 정책
6. 최소 가입 연령, 보호자 동의, 커뮤니티 표시 이름 정책
7. 제작자 업로드 콘텐츠의 저작권 신고·삭제 절차

이 결정들은 Artifact Router, immutable course version, 중앙 API라는 기반을 바꾸지 않는다.

---

## 19. 최종 원칙

1. **정적 생성물, 중앙 서비스** — 코스는 자유롭게 만들되 권한·데이터·AI는 플랫폼이 소유한다.
2. **Artifact는 불변, release는 포인터** — 빠른 publish와 안전한 rollback의 기반이다.
3. **생성 프론트는 불신** — secret, 정답, 정본 성적을 브라우저에 두지 않는다.
4. **제작 자유는 선언형 계약 안에서** — 임의 DB가 아니라 versioned manifest와 SDK를 제공한다.
5. **연습은 학습을 위해 유연하게, 공식 평가는 서버에서 엄격하게** 처리한다.
6. **무료·유료 모두 entitlement로 통일**해 접근·LMS·튜터·커뮤니티 권한을 한 경로로 검증한다.
7. **오픈 플랫폼 우선** — 학교용 복잡성을 미리 만들지 않되 데이터 소유권과 감사 가능성은 처음부터 지킨다.
