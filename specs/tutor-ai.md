# 튜터 AI — 설계 (spec, draft)

> 짝: [vision](../docs/content/docs/vision.mdx) · [world-seed.md](world-seed.md).
> 참조 아키텍처: `../mirror-dimension` (교육판이 따라야 할 정본 스택).
> **제약(사용자 확정)**: 챗봇은 **무조건 mirror-dimension의 Vercel AI SDK 설계 + 챗 UI 컴포넌트**를
> 따른다(추후 우리 Vercel 배포에 연결). 로컬에서도 동작해야 하고, **workflow agent loop로 durable**하게.

---

## 0. 왜 서버가 필요한가 (Faraday의 전환점)

지금까지 Faraday 레슨은 **정적 Vite SPA**였다. 튜터 AI는 mirror-dimension처럼 **durable workflow
agent loop**를 서버에서 돌린다 → **튜터는 서버-백드 opt-in 기능**이다. 다행히 **`workflow/vite`
플러그인**이 있어 Next.js 없이 Vite 앱에서 durable workflow를 돌릴 수 있고, API 라우트는 Vercel
Functions(`api/`)로 붙인다. 즉 Faraday 텍스트북은 **정적 프론트 + `api/` 함수 + workflow**의
하이브리드가 된다.

---

## 1. 참조 아키텍처 (mirror-dimension, 실제 코드)

스택: `ai@^7` · `@ai-sdk/react@^4`(useChat) · `@ai-sdk/workflow@^1`(WorkflowAgent·WorkflowChatTransport)
· `workflow@^4.5`(WDK) · AI Gateway 모델 문자열(`anthropic/claude-haiku-4.5`).

**서버 — durable run 시작 + 스트림** (`app/api/chat/route.ts`):
```ts
const run = await start(runDimensionAgent, [{ messages, dimensionId }]);   // workflow/api
const uiChunks = run.readable.pipeThrough(createModelCallToUIChunkTransform()); // @ai-sdk/workflow
return createUIMessageStreamResponse({ stream: uiChunks, headers: { 'x-workflow-run-id': run.runId } });
```
**재연결(durable 핵심)** (`app/api/chat/[runId]/stream/route.ts`): `getRun(runId).getReadable({ startIndex })`
→ 같은 transform → 진행 중/완료 run에 `startIndex`부터 재생. 타임아웃·새로고침·네트워크 단절 후
client가 여기로 재접속.

**durable agent loop** (`app/workflows/dimension-agent.ts`):
```ts
export async function runDimensionAgent(input) {
  'use workflow';                        // 함수 전체 = 하나의 durable run (sandboxed VM)
  await ensureSessionStep(...);          // Node 의존 작업은 'use step' 경계 안에서
  const agent = new WorkflowAgent({ model: MODEL_ID, reasoning, instructions, tools, prepareStep });
  const result = await agent.stream({ messages, writable: getWritable<ModelCallStreamPart>(), toolsContext });
  return { ... };
}
```
(고급 요소: 롤링 프롬프트 캐시 브레이크포인트 + 오래된 tool 출력 compaction — v0는 생략 가능, 나중에.)

**client** (`components/studio/studio-session.tsx`):
```ts
const transport = new WorkflowChatTransport({ api: '/api/chat', prepareSendMessagesRequest: ... });
const { messages, sendMessage, status, stop } = useChat({ id, messages, transport });
```
**챗 UI**: `components/ui/{message-scroller,message,bubble}.tsx`(shadcn 챗 프리미티브) +
`components/chat/{chat-message,chat-input,assistant-markdown,tool-group}.tsx`. mirror-dimension은
`base-mira` shadcn = **우리 style-faraday와 동일 계열** → 이식이 깔끔하다.

---

## 2. Faraday 적용 — `faraday new --tutor` (서버-백드 opt-in)

`--tutor` 스캐폴드가 추가하는 것:

- **deps**: `ai@^7`, `@ai-sdk/react@^4`, `@ai-sdk/workflow@^1`, `workflow@^4.5`, `@ai-sdk/gateway`(또는 env).
- **`vite.config.ts`**: `import { workflow } from "workflow/vite"` 플러그인 추가.
- **`api/chat.ts`** + **`api/chat/[runId]/stream.ts`**: Vercel Functions 라우트 (§1의 route 패턴 그대로).
- **`src/faraday/tutor/agent.ts`**: durable 워크플로우 `runTutorAgent`(`'use workflow'` + `WorkflowAgent`).
  Node 의존은 `'use step'`으로. instructions = 레슨/커리큘럼 콘텐츠 그라운딩(§4).
- **`src/faraday/tutor/`** (벤더·잠금): mirror-dimension 챗 UI를 style-faraday로 이식
  (`MessageScroller`·`Message`·`Bubble`·`ChatMessage`·`ChatInput`) + `<Tutor>` 컴포넌트
  (`useChat` + `WorkflowChatTransport`). 플로팅 패널로 텍스트북에 임베드.
- **모델**: AI Gateway 문자열. **빌드 시 live 조회**
  (`curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '.data[].id'`)로 최신 확인 —
  기억 금지. 비용 민감한 튜터라 기본은 haiku 계열, prop으로 override.

정적 2D/3D 레슨(튜터 미사용)은 여전히 서버 없이 정적 배포. 튜터를 켤 때만 서버가 붙는다.

---

## 3. 로컬 vs Vercel — 둘 다 durable

| | 로컬 | Vercel (플랫폼) |
|---|---|---|
| 실행 | `workflow/vite` + 로컬 dev가 `api/` 라우트+workflow 런타임 구동 (세부: `node_modules/workflow/docs/getting-started/`의 vite 가이드 — 빌드 시 확인) | Fluid Compute Functions + WDK durable run |
| AI 키 | **BYO AI Gateway 키**(`AI_GATEWAY_API_KEY`) | **우리 키**(AI Gateway), 사용량 미터링; 부담 주체는 플랫폼 상업 정책에서 확정 |
| durable | WDK 로컬 durable run + `[runId]/stream` 재연결 | WDK + Observability(`npx workflow web <runId>`) |

durable의 의미: 새로고침/타임아웃/네트워크 단절이 나도 `WorkflowChatTransport`가
`{api}/{runId}/stream?startIndex=`로 재접속해 **같은 run을 이어서** 스트림. 긴 에이전트 루프가 끊겨도
안전.

---

## 4. 그라운딩 (튜터 게이트의 근거)

- **v0**: `runTutorAgent`의 `instructions`(=mirror-dimension `composeCharter` 대응)에 **현재 레슨/커리큘럼
  콘텐츠**를 주입 + 규칙(소크라테스식·정답 누출 금지·자료 밖이면 거부). client가 `prepareSendMessagesRequest`로
  `lessonId`/context를 함께 보냄.
- **later**: 제작자 자료 **RAG 툴**(`'use step'`으로 검색) + **그라운딩 게이트**(출처 밖 답변 시 실패) +
  **리허설 게이트**(배포 전 가상 학생 질문으로 자동 채점 — VISION §8).

---

## 5. 빌드 중 확정된 사실 (버전 매치 bundled 문서 + 실제 스캐폴드 검증)

1. **Vite durable 셋업 = Vite + Nitro + Workflow** (열린 항목 1 해소). `workflow/vite` 단독이 아니라
   **Nitro**가 서버 프레임워크로 `api/**` 라우트를 서빙한다. `pnpm dev`(=vite) 하나가 프론트+api를 함께
   구동(로컬 :3000, 점유 시 자동 증가) — **`vercel dev` 불필요**. 배포는 Vercel 무설정.
   - `vite.config.ts`: `plugins: [react(), tailwindcss(), nitro(), workflow()]` + `nitro: { serverDir: "./" }`.
   - api 라우트는 **h3 핸들러**: `defineEventHandler`, `event.req.json()`, `getRouterParam`/`getQuery` (`nitro/h3`).
   - **nitro 버전**: 안정 `3.0.0`은 deprecated이고 `serverDir` 유저 config가 없다(그 버전엔 resolved 옵션).
     workflow 문서가 요구하는 `serverDir`를 지원하는 **현재 beta(`3.0.260610-beta`, `latest`)로 핀**. 안정
     3.0.x가 나오면 교체.
   - **[dev 블로커, 클린세션 검증에서 발견·수정] `nodeLinker: hoisted` 필수.** Workflow DevKit의 step
     번들러(`@workflow/builders` esbuild, `format:'esm'`)가 pnpm 중첩 `.pnpm` 스토어를 통해 resolve할 때
     `ajv`의 내부 `require("./core.js")`를 잘못 external 처리 → `pnpm dev`에서 매 모델 step이 500(“Dynamic
     require ... is not supported”), 키가 있어도 **튜터가 절대 응답 안 함**. `prod vite build`는 정상(ajv를
     `.output/server`에 번들). 해결: 스캐폴드가 `pnpm-workspace.yaml`에 `nodeLinker: hoisted`를 넣어
     node_modules를 평탄화 → ajv 상대 require가 정상 resolve/번들. **튜터 프로젝트에만** 적용(비튜터는 strict
     pnpm 유지). 검증: dev에서 Dynamic-require 0·핸들러에러 0, `GatewayAuthenticationError`(=키만 없음)까지 도달.
2. **`useChat`/`WorkflowChatTransport`** (열린 항목 2 해소) — `useChat({ transport })` → `{ messages,
   sendMessage, status, stop }`, `status ∈ {ready,submitted,streaming,error}`. `WorkflowChatTransport({
   api, prepareSendMessagesRequest })`가 `x-workflow-run-id`로 자동 재접속. 서버 `start()`→`run.readable`,
   재연결은 `getRun(id).getReadable({startIndex})`. **주의**: `convertToModelMessages`는 **async**(설치 버전
   `ai@7.0.17`) — `await` 필요.
3. **AI Gateway 인증** (열린 항목 3 해소) — 로컬 `.env.local`의 `AI_GATEWAY_API_KEY`(BYO), Vercel은 OIDC 자동.
   모델 문자열은 `ai`가 내장 gateway로 해석(별도 `@ai-sdk/gateway` 명시 불필요, `ai`가 transitive로 가져옴).
4. 챗 UI 이식 — `bubble`/`message`만 그대로 이식(base-ui+cva, 자립적). `message-scroller`는 미벤더 shadcn
   프리미티브 의존이라 **경량 auto-scroll**로 대체, `chat-input`은 이미지업로드/모델셀렉터 제거한 경량판.

**검증**: `faraday new --tutor` → `pnpm install/typecheck/build` 통과, `pnpm dev`에서 workflow 컴파일
(“1 workflow, 9 steps”), `POST /api/chat` 200 + `x-workflow-run-id` + SSE(`type:start/start-step`),
`GET /api/chat/{runId}/stream?startIndex=0` 같은 run 재생(durable resume). 실제 토큰 스트림만 실 키 필요.

---

## 6. 단계

- **v0 — 완료 (built & verified)**: `--tutor` 스캐폴드 = Vite+**Nitro**+Workflow. `api/chat`(+`[runId]/stream`
  재연결), `workflows/tutor-agent.ts`(WorkflowAgent, 레슨 콘텐츠 그라운딩·소크라테스·정답 누출 금지),
  벤더·잠금된 챗 UI + `<Tutor>`(useChat+WorkflowChatTransport), 로컬 BYO Gateway 키로 durable 동작.
  정적 2D/3D 레슨은 서버 없이 그대로. **후속**: compaction/롤링 캐시 브레이크포인트, RAG 툴(`'use step'`),
  그라운딩·리허설 게이트, reasoning/tool 파트 렌더, 세션 영속(리로드 복원).
- **platform**: 단일 Vercel Artifact Router + 중앙 Tutor API, 우리 Gateway 키와 사용량 계측,
  Connect 결제, 학생 인증 = VISION Phase 2~3. 상세: [STAGE2-PLATFORM.md](../docs/STAGE2-PLATFORM.md).

---

## 7. 다른 v0 컴포넌트(LMS)와의 관계

LMS v0(이벤트 스트림 대시보드)는 순수 클라이언트라 이미 만들었다. 튜터는 서버-백드라 성격이 다르다
— 나중에 튜터가 LMS 이벤트(어디서 막혔나)를 컨텍스트로 읽어 개입하는 연결이 자연스럽다(코어
`onEvent` 스트림 공유).
