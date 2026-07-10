# Skill 성능 평가 루프 — 블랭크 서브에이전트 방법론

faraday 스킬/템플릿의 품질을 올릴 때 쓰는 검증 방법론. 2026-07-10 세션에서
정립·검증됨 (루프 3회 + 대조 실험 다수). 다음 세션에서 이 문서만 읽고 같은
루프를 재현할 수 있어야 한다.

## 0. 원칙 (창작자 피드백에서 온 불변 규칙)

1. **기준 먼저, 실험은 그 다음.** 퀄리티가 떨어진다고 느끼면 먼저 그 기준을
   측정 가능한 MUST로 문서화(`references/quality-bar.md`)하고 합의한 뒤 루프를
   돈다. 인상 평가 금지 — MUST별 pass/fail.
2. **변인 통제.** 한 번에 한 변인(스킬 지침 / 템플릿 프리미티브 / 문서)만
   수정하고 재실행. 결함 수정은 배치로 묶더라도, 루프 간 비교가 가능하게
   "무엇이 바뀌었는지"를 명시한다.
3. **범용으로만 고친다 — 과적합 절대 금지.** 수정은 전부 주제 비의존적이어야
   한다(제네릭 HUD·블록·버그픽스). 검증 주제(케플러 등)에 특화된 코드가
   템플릿/스킬에 들어가면 실패. 일반화 확인이 필요하면 다른 주제로 한 번 더.
4. **서브에이전트는 완전 블랭크.** 사전 컨텍스트 없음. 스킬(SKILL.md)이 유일한
   방법론 소스, CLI(platform/packages/cli/bin/faraday.mjs)가 유일한 도구. **품질 기준을 프롬프트에
   누설하지 않는다** — 스킬을 통해 스스로 발견하는지가 검증 대상이다.
5. **에이전트 자기평가는 신뢰하지 않는다.** 오케스트레이터가 빌드된 앱을 직접
   구동해 실제 픽셀로 채점한다. 에이전트가 "구조상 PASS"라고 한 시각적 MUST는
   전부 미채점으로 간주.
6. **모델은 sonnet.** 약한 모델이 첫 실행에 통과해야 가이드에 실린 것이다
   (fable이 통과하는 건 증거가 약함). 설계-전용 프로브도 sonnet.
7. **수렴 판단.** 블랭크 에이전트가 콘텐츠 개입 없이 전 MUST 통과 + 남은
   결함이 잠긴 프리미티브(에이전트 소관 밖)뿐이면 루프 종료. 동일 조건
   재실행은 교정이 아니라 확인 — 하지 않는다.

## 1. 루프 구조

```
기준 정립/보강 (quality-bar.md MUST)
  → 스킬·템플릿 수정 (범용) + codex 미러 + scaffold 문서 동기화
  → 블랭크 sonnet 에이전트 실행 (풀 빌드)
  → 오케스트레이터 직접 채점 (스크린샷·구동·콘솔)
  → 결함 발견 → 한 변인 수정 → 재실행 … 수렴까지
```

저렴한 변형 — **설계-전용 프로브** (스캐폴드/빌드 없음, ~1-2분, 지침 픽업
확인용): Discover+design 단계만 실행시키고 방법론/레이아웃/평가폼/유도 방식
선택과 그 이유를 보고받는다. 특정 문서 갭을 좁게 검증할 때, 그리고 **대조
실험**(같은 주제 × 5개 대상 → 설계가 갈라지는지; 명시적 요구가 기본값을
오버라이드하는지)에 쓴다.

## 2. 서브에이전트 프롬프트 템플릿 (풀 빌드)

그대로 복사해 쓰되 `{{창작자_요청}}`, `{{스크래치_디렉토리}}`만 바꾼다.
검증된 표준 요청은 §6 참고.

```
You are a fresh courseware-authoring agent with NO prior context about this
codebase. Work exactly as the faraday skill directs you — it is your only
methodology source.

A course creator asks (their words):

"{{창작자_요청 — 한국어, 자연스러운 창작자 말투. 기준 용어 누설 금지}}"

The creator is not available for follow-up questions; make reasonable
discovery assumptions and note them.

Ground rules:
- The faraday skill lives at {{repo}}/plugins/claude-code/skills/faraday/SKILL.md
  — read it FIRST, then load its referenced files as the skill instructs for
  each phase. Follow it faithfully, including its quality rubric, its
  interaction-craft guidance, and its assessment guidance.
- The CLI npm package is NOT published; whenever the skill says
  `npx @faraday-kit/cli@latest`, use `node {{repo}}/platform/packages/cli/bin/faraday.mjs` instead.
- Create the project inside {{스크래치_디렉토리}} (create the parent dir if needed).
- Do NOT read or copy from any platform/examples/voyage-log/src/lesson/** file except
  where a skill reference explicitly points you to a specific file there.
- Do NOT edit anything under the repo itself (platform/, plugins/).
- Run the verification gates the skill requires (pnpm check / typecheck /
  build). Visual driving of the built app is the orchestrator's job — do not
  leave servers running when you finish.

Final report (returned to an orchestrator — be precise, under 550 words):
1. Absolute project dir.
2. Curriculum shape (nodes, summaries/xp present?) + first-lesson structure in
   order. For EACH interactive: what the learner manipulates and HOW
   (drag-on-canvas / overlay button / panel) and what motion it has. For EACH
   check: which FORM (component) and why it fits the outcome. How the central
   formula(s) arrive (derived how?).
3. Verification level reached with actual command results.
4. Self-grade vs the quality rubric, MUST by MUST across all applicable
   surfaces — flag anything you could not verify yourself.
5. Anything unclear/missing/contradictory in the skill/docs.
```

보고 형식 2·4번이 핵심: 조작 방식/모션/폼 선택 이유/공식 도착 방식을 말로
쓰게 하면 지침 미준수가 보고서에서 먼저 드러나고, "미검증 플래그"는
오케스트레이터 채점 범위를 정해준다. 5번(문서 갭)은 매 루프 실제 개선을
낳았다 — 반드시 읽고, 정당하면 성문화한다.

## 3. 오케스트레이터 채점 절차

1. `.claude/launch.json`에 스캐폴드 dev 서버 항목 추가(`pnpm --dir <path> dev
   --port <p> --strictPort`) → preview_start. **launch.json은 로컬 전용 —
   커밋 금지.**
2. **Surface 1 (월드)**: 풀 뷰포트 스크린샷 — 풀블리드/HUD(상태 플레이트·틱·
   XP·브리핑·힌트)/노드 상태 가독/mood. **좁은 뷰포트(≤700px)에서도** 전 노드
   프레이밍 확인.
3. **Surface 2 (레슨)**: 노드 진입 → 섹션별 스크린샷 — 프로즈 분량, 인터랙션
   종류 수, TeX, 유도(Derivation), 차트, 리드아웃 위치(hud), 체크 폼↔목표
   동사 일치.
4. **Surface 3 (인터랙션 필)**: 실제로 조작 — 드래그가 객체에서 되는지, 상태
   변화가 이어지는지(순간이동 금지), 어포던스, Play/Pause·미션 클리어.
5. **평가 플로우 E2E**: 총괄 체크 정답 → `complete()` → 맵 복귀 → XP/언락
   확인까지 실제로 돌린다.
6. **진위 스팟체크**: 파생값 하나를 독립 재계산해 화면 값과 대조.
7. 콘솔 에러 0, 라이트+다크 양쪽.
8. 결과는 MUST별 체크리스트로 기록. 어느 MUST든 fail → 변인 수정 → 재루프.
9. 종료 후: preview_stop, 스크래치 삭제, launch.json 삭제.

### 하네스 트릭 모음 (이거 모르면 채점이 막힌다)

- **스크롤 후 스크린샷이 검정**: 스크롤 대신
  `document.documentElement.style.transform = 'translateY(-Npx)'`로 콘텐츠를
  끌어올려 캡처. 끝나면 원복.
- **hidden 탭은 rAF 동결**: 애니메이션(비행·스트리밍 TeX·컨페티)이 안 움직이는
  건 버그가 아님. 검증은 rAF 목킹 — `window.requestAnimationFrame`을 큐로
  패치 **→ 클릭 → 매크로태스크 대기(React passive effect가 구독하도록
  setTimeout ≥50ms) →** 가짜 타임스탬프로 콜백 펌핑.
- **React는 같은 틱의 포인터 이벤트를 배칭**: 합성 드래그/드로잉은 pointerdown
  후 move들을 `setTimeout(16)` 간격으로 나눠 보내야 상태가 커밋된다.
- **`setPointerCapture`는 합성/해제된 pointerId에 throw** — 템플릿 훅은
  try/catch 가드됨. 커스텀 구현 채점 시 참고.
- **드래그 타깃 셀렉터 함정**: cursor:grab이 `<g>`에 있을 수 있고, r 큰
  원이 태양(비조작)일 수 있다. 소스에서 핸들 위치를 확인하고 잡을 것.
  이동 리스너가 window에 붙는 구현이면 move는 window에 dispatch.
- **노드 포커스 강제**: `localStorage`의 `faraday:progress:<제목>` JSON에서
  `progress.current`를 바꾸고 reload → 브리핑 Enter/Revisit으로 진입.
- **R3F 캔버스 클릭은 합성 이벤트로 안 됨** — 브리핑 패널 버튼이나 상태 조작을
  쓴다.
- 첫 페인트 전 스크린샷은 3D가 검게 나옴 — 2~3초 대기 후 재촬영.

## 4. 수정 반영 시 체크리스트

- [ ] `plugins/claude-code/skills/faraday/**` 수정 후 **codex 미러**:
      references는 `cp`로 동일하게, SKILL.md만 개별 편집(의도적 diff 3곳 유지).
      `diff -rq plugins/claude-code/skills/faraday/references
      plugins/codex/skills/faraday/references`로 SYNC 확인.
- [ ] **scaffold 문서 동기화**: `platform/packages/cli/templates/starter/AGENTS.md`,
      `docs/authoring.md`, `docs/quality-bar.md`(skill quality-bar의 사본) —
      블랭크 에이전트가 프로젝트 안에서 읽는 건 이쪽이다.
- [ ] 템플릿 코드 수정 후 `node --test src/generate.test.mjs` (5개).
- [ ] 새 스캐폴드에서 `pnpm check && pnpm typecheck && pnpm build`.
- [ ] 실행 중인 검증 프로젝트에는 벤더 사본을 직접 `cp`로 핫패치(HMR)해서
      즉시 확인 가능 — 단, 그 프로젝트의 `pnpm check`는 이후 실패하므로
      스로어웨이에서만.

## 5. 지금까지의 창작자 피드백 원장 (요구 → 반영 위치)

빠짐없이. 새 세션에서 기준을 읽을 때 이 맥락이 근거다.

1. **"3D/2D 게임 팩은 화면 꽉 채우고 상태창도 게임처럼 (HMD/게임 상태창).
   헤더·영역 구분·여백 많으면 게임 같지 않다."**
   → quality-bar Surface 1; `CurriculumHost` immersive 모드 + `world/hud.tsx`;
   map2d/world3d 풀블리드; FitCamera.
2. **"교재가 빈약. 한 장의 목표는 개념 설명이지 인터랙션 하나가 아니다 —
   인터랙션 여러 개 + 텍스트 중간중간 + 컨트롤 패널형 + 차트/그래프(진짜 수식
   그래프) 시뮬 + LaTeX 전부 + 실행 가능한 코드(vercel ai elements artifact
   참고). 인터랙티브 아래 카드 나열은 이상함."**
   → quality-bar Surface 2; TeX/CodeCell/Chart xType/Readout+hud 슬롯;
   interactive-design "From interaction to chapter".
3. **"기준을 정립해 문서화하고 만족할 때까지 서브에이전트 루프. 하나 수정하고
   재루프(변인 통제). 서브에이전트는 아무것도 모르는 상태로 우리 CLI·스킬
   기반. 3D 로드맵 + 케플러 앞단까지만 검증. 과적합 절대 금지."**
   → 이 문서 §0–§3.
4. **"누구를 위한 대상인지 확인하는 절차가 없다. 대상별 개념 전달 방법론을
   연구/알려진 방법에서 찾아 대상마다 하나만. 제작자 교수법 우선, 우리 것은
   default."**
   → `references/audience.md` (CRA/5E/Peer Instruction/Mayer/Merrill) +
   discovery 게이트. 명시된 2-행 스팬은 어린 행 아크 + 높은 행 엄밀함.
5. **"교재 레이아웃 타입도 대상 따라 달라질 수 있다(태블릿 가로형/책 세로형).
   단 1:1 대응은 아니고 요구가 우선. 같은 주제로 대상 전부 테스트."**
   → audience.md Layout 표 + `<Paged>`; 검증: 옴의 법칙 × 5 대상 설계 프로브
   (실무자+태블릿 요구 = 오버라이드 케이스 포함).
6. **"인터랙티브 애니메이션 퀄리티가 낮다. 컨트롤 패널 필수 아님, 슬라이더만
   조정 아님 — 캔버스 위 버튼, 플로팅 카드 패널도 좋다. 기준 같이 정하고
   만족까지 스킬 수정+서브에이전트(sonnet)+평가 루프."**
   → quality-bar Surface 3; `runtime/motion.ts`(useAnimatedValue/useRafLoop/
   useSvgDrag); Workbench controls 옵션화 + hud 클릭 가능;
   interactive-design "Craft".
7. **"공식이 결과만 띡 나온다 — 실제로 유도해주는 것처럼."**
   → `<Derivation>` (한 줄씩 + 단계별 근거 노트) + Surface 2 MUST
   "derived, not decreed".
8. **"퀴즈 고도화 — 객관식만이 아니라 실제 답 입력, 태블릿 펜슬 입력, 미션/
   게임식으로 깨야 하는 것. 종류를 구분하고 만드는 스킬 + 전체 교재 흐름
   (개념→시뮬→퀴즈/과제)이 대상별 방법론에 입각. 퀴즈 종류마다 컴포넌트 정의."**
   → `references/assessment.md` (5폼×목표동사×대상) + NumericAnswer/SketchPad/
   Challenge + quality-bar "form matches verb".
9. **"퀴즈 맞추면 confetti 같은 애니메이션 / 공식이 스트리밍(교수 판서, 텍스트
   애니메이션 리서치) / 코드 하이라이트 + 카드와 동일 배경 + 콘솔 대비 명확."**
   → `celebrate.ts` 자동 발화; `<TeX block stream>`(clip-path 와이프+펜 캐럿,
   Derivation 새 줄 자동); CodeCell 토크나이저+투명 textarea 오버레이+CONSOLE
   인셋 패널.
10. **"카드 헤더 상단 패딩이 카드 패딩과 겹친다 — 헤더 플러시를 기본으로."**
    → 근본 원인: `.style-faraday .cn-*`(특이도 0,2,0)가 단일 유틸리티를 이겨
    `py-0`이 무효. `data-flush` 카드 변형으로 해결(Workbench/CodeCell 기본).
    교훈: cn-* 컴포넌트는 유틸리티로 못 고침 — 스타일 레이어/토큰/data-flush로.
11. **운영**: PR 머지 후엔 새 브랜치를 따서 진행; "띄워줘" 요청 시 dev 서버를
    유지하고 localhost 포트 안내; 루프 산출물은 검증 후 스크래치에서 삭제.

## 6. 검증된 표준 시나리오 (재사용)

- **풀 빌드 (E2E 기준선)** — "우주역학 입문 코스, 고딩~학부1(JS 기초), 3D
  별자리 로드맵 잠금해제, 커리큘럼 5-6노드 골격 + 첫 레슨(케플러)만 풀 퀄리티,
  나머지 스텁, 콘텐츠 영어." 3회 수행: loop1(게임셸+교재), loop2(FitCamera
  발견), loop3(전 레이어 — Surface 3·평가폼·Derivation 첫 통합, 첫 실행 통과).
- **풀 빌드 (Surface 3 특화)** — "고1 물리 포물선 운동, 각도·속도 직접 조작."
  드래그-네이티브 주제. sonnet 첫 실행 통과.
- **풀 빌드 (평가폼 특화)** — "중2 일차함수, 기울기·절편 감 잡고 문제도 직접."
- **설계 프로브 (대상 대조)** — 옴의 법칙 V=IR × {초등4 / 고1 / 공대1 /
  성인 교양 뉴스레터 / 실무자+태블릿 명시}. 기대: CRA+Paged / 5E+scroll /
  PI+scroll / Mayer+scroll / Merrill+**Paged(요구 오버라이드)**.
- **설계 프로브 (유도 픽업)** — "고1 등차수열 합 공식, 공식만 외우게 하지
  말고." 기대: Derivation 단계들이 인터랙션에 앵커링.
- **풀 빌드 (튜터 / Surface 4 특화)** — "확률 오개념(몬티 홀·도박사의 오류),
  고딩~학부1, 정답을 들어도 안 믿고 계속 따지는 걸 스스로 납득할 때까지." 프롬프트에
  '튜터/챗' 한 마디 없이 open-explain이 최강 성과인 토론형 주제만 준다 → 블랭크 sonnet이
  스킬만 보고 `--tutor`를 스스로 채택하는지(결정 MUST). 오케스트레이터 채점은 픽셀이 아니라
  **실 키 curl SSE 행동**: 그라운딩+소크라테스, 적대 프로브 (a)"정답 숫자만 내놔"=누출 금지,
  (b)자료 밖 질문=되돌림, durable resume(`startIndex=0` 같은 run 재생). 키는
  오케스트레이터만 스캐폴드 `.env.local`로 복제(에이전트 컨텍스트엔 누설 금지).

새 주제를 고를 땐: 검증하려는 레이어가 자연스럽게 요구되는 주제(드래그 →
포물선, 평가 다양성 → 함수 단원)를 고르되, 직전 루프와 다른 주제로 일반화를
같이 확인한다.

## 7. 루프별 발견 이력 (왜 이 규칙들이 생겼나)

- loop1: Quiz uncontrolled→controlled 에러; Chart numeric-x 부재 + 보이지 않는
  단일점 마커; worlds.md의 케플러 "live reference"가 자체 기준 위반(수학만
  베끼라는 경고 추가); 잠긴 3D 노드 비가시.
- loop2: world3dPack 하드코딩 카메라가 좁은 뷰포트에서 노드 클리핑(FitCamera);
  블랭크 에이전트는 /tmp 스캐폴드를 스크린샷 못 함 → SKILL.md verify에 "시각
  MUST는 미채점으로 명시" 규칙.
- sonnet(포물선): useSvgDrag setPointerCapture throw 가드; hidden-tab rAF 동결
  검증법.
- sonnet(일차함수): useAnimatedValue 주석의 유령 `snap` 옵션; standalone 레슨
  게이트 부재 가이드.
- loop3: 명시된 다중-행 audience 규칙 부재 → 성문화.
- 튜터(몬티 홀, Surface 4 첫 검증): 블랭크 sonnet이 튜터/기준 누설 없이 `--tutor`를
  스스로 채택(결정 MUST pass) — 스킬 discovery+assessment.md open-response 행이 제대로
  유도함. 실 키 curl 채점에서 **no-leak MUST FAIL**: 기본 `buildInstructions`의 소프트한
  "Never reveal ... outright"가 "정답 숫자만, 설명 말고" 직접 압박에 붕괴 → 총괄 정답 0.99
  누출. **범용 수정**: `templates/addon-tutor/workflows/tutor-agent.ts` 기본 프롬프트에
  non-negotiable no-leak 가드(숫자/보기/대입공식 금지, 학습자가 *먼저* 제시한 답 확인·교정만
  허용, 자료에 답이 있어도 자발 제공 금지). 재프로브서 거부+힌트/질문으로 전환, 그라운딩·
  소크라테스·자료밖·durable 회귀 없음. 미러 불필요(튜터 템플릿은 단일 소스, author-zone =
  SHA manifest 밖). 부수: Surface 1(월드)은 픽셀 통과, 레슨(Surface 2/3)은 out-of-tree
  `/tmp` 스캐폴드가 헤드리스 스크린샷에서 검정(transform·scrollTo 트릭 모두 무효 — 문서
  스크롤도 안 페인트) → 픽셀 미채점, 대신 **라이브 DOM 실측**(preview_inspect/eval:
  TeX·차트 SVG 828×280·클릭 타깃 6·튜터 입력창 fixed 밖=본문 in-flow)으로 구조 검증.
  → **일반화 확인 완료(수렴)**: 다른 도메인(허수아비 공격 / 비형식 논리) 블랭크 sonnet이
  수정 템플릿을 상속(페르소나만 "critical-thinking coach"로 커스텀, no-leak 가드 블록은
  그대로 유지) → `--tutor` 자가 채택(결정 MUST 재확인) + 실 키 curl 채점서 no-leak 포함 전
  Surface-4 MUST를 첫 실행 통과(그라운딩 미션 라벨 정답 "설명 말고 라벨만" 요구를 거부+되돌림,
  라벨 조작 없음). 몬티 홀 과적합 아님 확정. 부수 관찰: 이 에이전트는 정답 키를 context에서
  빼고 "특정 사례 라벨 절대 발설 금지"까지 context에 명시 — 좋은 그라운딩 설계 본능.
- 튜터 도크/렌더링 오버홀(0.999…=1, 사용자 피드백 발): 튜터가 스크롤 맨 아래 인라인
  카드로 박히던 걸 mirror-dimension 도크 모델로 승격 — `<TutorDock>`(우측 리사이저블·
  collapsible 패널, 데스크톱 탭/모바일 드로어, react-resizable-panels) + 정본 shadcn
  `MessageScroller`(@shadcn/react, auto-stick+scroll-to-end) + Streamdown 마크다운/
  KaTeX(@streamdown/math, singleDollarTextMath). 데모 핫패치로 느낌 먼저 맞춘 뒤
  templates/addon-tutor로 이식(새 vendored: dock/resizable/message-scroller;
  TUTOR_DEPS 4개 추가; CSS side-effect import는 core main.tsx 아닌 chat-message.tsx에
  둬 비튜터 오염 방지). references/tutor.md·quality-bar Surface 4 성문화(도크 필수,
  인라인 블록 금지, 마크다운/수식 렌더 필수, raw `$`/펼침 thinking 금지). **블랭크 sonnet이
  갱신 스킬만 보고 `--tutor` + `<TutorDock>` 래핑을 첫 실행에 채택**(도크 결정 MUST pass).
  **발견**: 모델이 `$…$`와 `\(…\)`를 혼용 → 후자는 streamdown 미렌더(raw LaTeX). **범용
  수정**: chat-message.tsx에 `\(…\)`/`\[…\]`→`$…$`/`$$…$$` 정규화(모델 컴플라이언스 비의존).
  하네스 함정: 이 preview 인스턴스는 React controlled composer(useState value)에 synthetic
  입력(native setter+input / preview_fill / fiber onChange)이 안 먹어 Send가 disabled로
  남음 → 채팅 전송 못 함. 수식 렌더는 합성 검증(정규화 node 유닛 + `$`/`$$` KaTeX는 입력
  되는 다른 스캐폴드서 browser 확인 + 도크 렌더는 이 스캐폴드 browser 확인).
- 교훈 공통: **에이전트의 "문서 갭" 보고는 거의 항상 진짜다. 매 루프 문서에
  반영하라.**
