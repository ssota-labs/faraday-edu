# Module Packs — 설계 스펙

> 상태: **구현됨**. `faraday pack list/add/validate` + 네 개 공식 팩(`three`·
> `tutor`·`srs`·`lecture-design`). 팩은 CLI에서 분리돼 `packages/official-packs/`에
> 살고, `prepack` 빌드 스텝이 CLI에 번들한다. `pack add`는 공식명·로컬경로·github
> (`owner/repo`)·npm(`npm:@scope/pack`) 소스를 해석하므로 **누구나 팩을 배포**할 수
> 있다. `--3d`/`--physics`/`--tutor`는 `installPack`을 호출하는 얇은 별칭이고, 옛
> `templates/addon-*`는 제거됐다. 나머지 팩(exam·deck·kids·notes)은 로드맵.

## 1. 배경 — 왜 "팩"인가

Faraday는 이미 **두 개의 층**으로 모듈화되어 있다:

- **런타임 층** (코드) — `packages/*`의 블록·월드팩·LMS·3D·튜터.
- **스킬 층** (에이전트 지식) — `plugins/*/skills/faraday/references/*.md`.

그리고 `--3d`/`--tutor`는 이미 "런타임 모듈을 레슨에 설치"한다 — 템플릿 폴더 복사
+ deps pin + CSS 주입 + 문서 포인터 append ([generate.mjs](../packages/cli/src/generate.mjs)).
하지만 두 가지가 빠져 있다:

1. 그 로직이 `generate.mjs`에 **하드코딩** → 팩마다 코드를 고쳐야 한다.
2. **스킬 쪽 설치가 없다** — 애드온과 스킬 지식이 연결돼 있지 않다.

**모듈 팩**은 이 둘을 메운다: 팩을 자기완결 폴더 + 선언적 매니페스트로 빼내고,
`faraday pack add`가 **런타임 쪽과 스킬 쪽 양쪽에** 설치한다.

## 2. 팩 = 자기완결 폴더

```
packs/<name>/
├─ pack.json          # 매니페스트 — 설치기가 읽는 유일한 진입점
├─ runtime/           # (선택) 레슨에 복사되는 런타임 소스 (author-editable)
├─ skill/             # 스킬 절반 — 에이전트가 로드하는 지식 (폴더 가능)
│   └─ pack.md
├─ examples/          # (선택) 데모 레슨 → docs/examples/ 로 복사
└─ quality.md         # (선택) 이 팩의 quality-bar 항목
```

이 폴더는 **저자/소비자 대칭**이다:
- **저자**는 `packs/<name>/`를 만들고 편집한다 (팩 추가 = 폴더 하나 추가).
- **소비자**는 `faraday pack add <name>`으로 그 폴더를 설치한다.

## 3. 매니페스트 (`pack.json`)

`generate.mjs`에 박혀 있던 애드온 로직을 **선언**으로 옮긴 것:

```json
{
  "name": "three",
  "displayName": "3D scenes (React Three Fiber)",
  "description": "...",
  "aliasFlags": ["--3d"],
  "runtime": {
    "dependencies": { "@faraday-academy/three": "0.1.0", "@react-three/fiber": "^9.0.0" },
    "devDependencies": { "@types/three": "^0.171.0" },
    "variants": { "physics": { "dependencies": { "@react-three/rapier": "^2.1.0" } } },
    "cssImports": ["@faraday-academy/three/styles.css"],
    "copy": [{ "from": "examples", "to": "docs/examples" }]
  },
  "skill": {
    "reference": "skill/pack.md",
    "loadWhen": "the lesson needs a 3D scene, an orbital/spatial model, or a 3D curriculum world"
  },
  "quality": "quality.md"
}
```

- **런타임 절반**은 두 가지를 섞어 담는다: 무거운 코드는 게시된 패키지를 **pin**
  (`dependencies`), 가벼운 글루·예제·author-editable 코드는 **copy**. 매니페스트가
  둘 다 지원한다.
- **스킬 절반**은 `reference`(파일 또는 폴더)와 `loadWhen`(언제 로드할지 힌트).

## 4. `faraday pack` 명령

```
faraday pack list [--json]                     # 공식 팩 나열 (라이브 카탈로그)
faraday pack add <name|source> [--physics] [--dir <lesson>] [--json]
faraday pack remove <name> [--dir <lesson>] [--json]
faraday pack show <name|source> [--json]        # 스킬 가이드를 stdout으로 (설계 타임)
faraday pack validate <name|source> [--json]    # pack.json 계약 검증
```

**Default 팩** — `pack.json`에 `"default": true`인 팩(`lecture-design`·`audience`)은
`faraday new`가 자동 설치한다(`--no-defaults`로 opt-out). 유일 소스는 팩이고, 설계
타임엔 `faraday pack show <name>`으로, 빌드 타임엔 레슨의 `.faraday/packs/<name>/`
에서 읽는다. 베이스 스킬의 `references/pedagogy.md`·`audience.md`는 제거되고 SKILL.md가
이 팩들을 가리킨다.

**`pack remove`** — un-register(스킬 디렉터리 + AGENTS 포인터 + provenance 엔트리)는
항상 안전하게 제거하고, deps/css는 **다른 설치된 팩이 공유하지 않는 것만** 되돌린다.
복사된 소스/append(예: `src/lesson/srs/`)는 저자가 편집했을 수 있어 **삭제하지 않고
보고만** 한다.

**소스(`<name|source>`)** — `resolvePack()`이 해석해 로컬 팩 디렉터리로 만든 뒤
기존 `installPack()`에 넘긴다:
- **공식명** — `three` → 번들/official-packs
- **로컬 경로** — `./my-pack`, `/abs/path` (pack.json 포함 디렉터리)
- **github** — `owner/repo[/sub]` (tarball 다운로드 → `~/.faraday/cache` → 해석)
- **npm** — `npm:@scope/pack` (`npm pack` → cache → 해석)

`pack add`가 하는 일 (한 명령, 두 절반):

| 절반 | 목적지 | 동작 |
|---|---|---|
| **런타임** | 레슨 | `runtime.dependencies`/`devDependencies`(+variant) 를 `package.json`에 병합·정렬 → `cssImports`를 `src/app.css`에 주입 → `copy` 파일 복사 |
| **스킬** | `.faraday/packs/<name>/` | `skill.reference`를 복사 → `AGENTS.md`·`docs/authoring.md`에 포인터 append (에이전트가 그 지식을 로드) |
| **기록** | `.faraday/provenance.json` | 설치된 팩 목록에 추가 |

설치 후 소비자는 `pnpm install`로 새 deps를 받는다.

**하위호환:** `--3d`/`--physics`/`--tutor`는 `pack add three [--physics]` /
`pack add tutor`의 별칭으로 흡수한다 (기존 `new` 플래그 유지).

## 5. 스킬 쪽 설치 위치 — 레슨 로컬

스킬 절반은 **레슨 안**(`.faraday/packs/`)에 설치하고, `AGENTS.md`에 포인터를
남긴다. 이유:

- 자기완결 — 글로벌 스킬이 어디 설치됐든 무관하게 에이전트가 레슨 안에서 찾는다.
- `--tutor`가 지금 `AGENTS.md`에 포인터를 append하는 것과 동일한 패턴.

(향후: 글로벌 스킬 폴더에도 등록하는 `--global` 옵션은 로드맵.)

## 6. references 폴더화

`references/pedagogy.md`처럼 커진 평면 파일은 두 방향으로 쪼갠다:

1. **스킬 내부 쪼개기** — `references/pedagogy/{overview,5e,cra,peer-instruction,
   mayer,merrill}.md`. 에이전트가 필요한 교수법만 로드.
2. **팩으로 승격** — `lecture-design` 팩이 `skill/pedagogy/` 폴더를 소유. 팩 설치
   = 그 교수법 지식 설치.

## 7. 품질 관리

각 팩은 `quality.md`(quality-bar 항목)를 함께 배포한다. 지향점은 평가 루프:
에이전트가 팩 프롬프트로 N개 레슨 생성 → 다른 에이전트가 `quality.md`로 채점 →
팩은 통과율로 게이팅. `faraday-author` 서브에이전트가 그 생성 단계를 담당.

## 8. 로드맵 카탈로그

| 부문 | 팩 | 상태 | 무엇으로 · 검증한 패턴 |
|---|---|---|---|
| 커리큘럼 | `three` (3D 우주/RPG) | ✅ 구현 | `@faraday-academy/three` pin + scaffold 데모 + variant |
| 튜터 | `tutor` (근거기반 AI) | ✅ 구현 | pin + author-editable 서버 copy + `appends`(pnpm) |
| 암기 | `srs` (플래시카드) | ✅ 구현 | **소스 copy**(`src/lesson/srs/`) + deps 0개 |
| 렉쳐구성 | `lecture-design` (교수법) | ✅ 구현 | **스킬-온리** + 스킬 **폴더** 설치 |
| 렉쳐 | `deck` (슬라이드쇼) | 🔜 | `<Paged>` + `runtime/motion` |
| 아이들 | `kids` (태블릿 게임) | 🔜 | `<SketchPad>`+`<Challenge>`+`<Paged>`+CRA |
| 시험 | `exam` | 🔜 | `<Quiz>`/`<NumericAnswer>`/`<Challenge>`+assessment |
| 노트 | `notes` (펜 슬라이드쇼) | 🔜 | `<SketchPad>` → 풀페이지 잉크 캔버스 |

네 팩이 매니페스트의 서로 다른 경로를 한 번씩 검증한다: **pin**(three/tutor) ·
**소스 copy**(srs) · **appends**(tutor) · **scaffold 데모**(three) ·
**스킬 파일**(three/tutor/srs) · **스킬 폴더**(lecture-design) ·
**variant**(three --physics) · **deps 0개**(srs/lecture-design).

## 9. 구현 요약

- `packages/official-packs/{three,tutor,srs,lecture-design}/` — 네 개 공식 팩
  (pack.json + skill + examples/runtime + quality.md) + `pack.schema.json`(계약).
- `packages/cli/scripts/bundle-packs.mjs` — `prepack` 빌드: official-packs → `<cli>/packs`
  번들. `cli/package.json` `files`에 `packs` 추가, `<cli>/packs`는 gitignore.
- `packages/cli/src/pack.mjs`:
  - `packsRoot()` — official-packs(소스) 우선, 번들 폴백.
  - `resolvePack(source)` — 공식명·로컬·github·npm 해석 → 로컬 packDir.
  - `installPack()` — `packDir`/`source` 인자 지원. 매니페스트 지원: `dependencies`/
    `devDependencies`/`variants` · `cssImports` · `copy`(파일/폴더) · `appends`(멱등) ·
    `scaffold`(new 전용) · `skill`(파일/폴더). provenance: 공식=문자열 태그,
    외부=`{name, source}`.
  - `validateManifest()` — zero-dep 구조 검증 (ajv 없이).
- `generate.mjs` — 애드온 로직 제거, `--3d`/`--physics`/`--tutor`는 `installPack` 위임.
  - `removePack()` — un-register(항상) + 비공유 deps/css 되돌리기; 복사 파일은 보고만.
- `cli.mjs` — `faraday pack list [--json]` / `add <name|source> [--physics] [--dir] [--json]`
  / `remove <name> [--dir] [--json]` / `validate <name|source> [--json]`.
- `pack.test.mjs` — 설치·멱등성·거부 + 해석기·검증·외부(로컬) + 제거·공유deps (총 26개 통과).

**설치 위치** (예: `pack add srs`):
```
<lesson>/
├─ package.json / src/app.css       ← 런타임 (deps·css, 해당 시)
├─ src/lesson/srs/*                 ← 런타임 (소스 copy, srs)
├─ docs/examples/*                  ← 예제
├─ .faraday/packs/<name>/           ← 스킬 (파일 또는 폴더)
├─ AGENTS.md · docs/authoring.md    ← 스킬 포인터 append
└─ .faraday/provenance.json         ← packs[] 기록
```
