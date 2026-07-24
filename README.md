# Faraday Academy

**한국어** · [English](README.en.md)

> **이미 가르치고 있는 STEM 개념이 있나요? 코딩 에이전트에게 말하세요.**
> 조작 가능한 **풀스크린 3D 인터랙티브 교과서**가 나옵니다.

스킬 이름: **`3d-stem`** · 저장소: `ssota-labs/faraday-academy`

---

## 지금 바로 시작하기

**준비물:** [Cursor](https://cursor.com) · [Claude Code](https://claude.ai/code) · [Codex](https://openai.com/codex) 중 하나

에이전트 채팅에 붙여넣기:

```text
아래 스킬을 설치하고, 궤도 주기를 조작할 수 있는 풀스크린 3D STEM 레슨을 만들어줘.
실행: npx skills add ssota-labs/faraday-academy
스킬 이름: 3d-stem
```

에이전트가 설치 → 설계 → scaffold → 작성 → `check` → 로컬 미리보기까지 진행합니다.

### 다른 주제 예시

```text
이진 탐색 트리 회전을 3D로 보여주는 레슨을 만들어줘.
```

```text
맥스웰 방정식의 직관을 풀스크린 3D로 설명해줘.
```

<details>
<summary>에이전트별 플러그인 설치</summary>

| 에이전트 | 하는 일 |
|---|---|
| **Claude Code** | `/plugin marketplace add ssota-labs/faraday-academy` → `/plugin install 3d-stem@faraday-academy` |
| **Codex** | `codex plugin marketplace add ssota-labs/faraday-academy` |
| **공통 (skills)** | `npx skills add ssota-labs/faraday-academy` |

자세한 내용: [`plugins/claude-code/`](plugins/claude-code/) · [`plugins/codex/`](plugins/codex/)

</details>

<details>
<summary>모노레포에서 스킬 스크립트 직접 실행</summary>

```bash
node skills/3d-stem/scripts/stem.mjs scaffold my-orbit --json --skip-install
cd my-orbit && pnpm install && pnpm dev
node skills/3d-stem/scripts/stem.mjs check --dir my-orbit --json
```

공개 npm CLI(`npx @faraday-academy/cli`)는 **제품 경로가 아닙니다.**

</details>

---

## Faraday가 하는 일 (한 줄)

코딩 에이전트 스킬 **`3d-stem`**이 STEM 개념을 **풀스크린 3D**로 조작 가능한 로컬 레슨으로 만듭니다.
교육 UI는 선택적으로 **shadcn registry**(`apps/ui`)에서 복사합니다.

비전·GTM: [vision](docs/content/docs/vision.mdx) · [GTM](docs/content/docs/planning/gtm.mdx)

---

## 제품 구조

```
skills/3d-stem/     ← 제품 본체 (SKILL + scripts + references + templates)
plugins/*/skills/   ← 마켓플레이스 미러
apps/ui/            ← 교육 UI 카탈로그 + shadcn registry
docs/content/docs/  ← Oh My Docs 핸드북
```

레거시 npm 패키지·LMS·팩 마켓 서피스: [`legacy/QUARANTINE.md`](legacy/QUARANTINE.md)

---

## 개발자 메모

```bash
pnpm install
pnpm sync:skills
pnpm test                 # 3d-stem script tests (+ setup-env)
pnpm --filter @faraday-academy/edu-ui dev   # registry site :4300
pnpm check:planning
```
