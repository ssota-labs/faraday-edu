# Example authoring — sub-agent gaps & improvements

How we simulate real creators: sub-agent loads the Faraday skill
(`plugins/claude-code/skills/faraday/SKILL.md`) and gets a **natural user request**
only — no “scaffold / pnpm check / build” coaching in the prompt. The skill is
supposed to drive Discover → Design → Build → Verify on its own.

## Intended loop

1. Orchestrator commissions a topic in plain creator language.
2. Sub-agent reads Faraday skill first, then acts as the coding agent a user hired.
3. Orchestrator reviews the artifact, follow-ups stay user-like, gaps go here.

## Prompt style

**Bad:** “Scaffold, author, run pnpm check and pnpm build…”  
**Good:** “수능 물리 보는 고등학생용으로 「시험장의 물리」 인터랙티브 코스 만들어줘…”

## Environment gaps

| Gap | Impact | Improvement |
|---|---|---|
| `ssota-mcp` needsAuth | No real studio sandbox | Auth or isolated worktree stand-in |
| No Faraday-author Task preset | Skill path injected manually in harness | Preset that auto-attaches Faraday skill |
| Harness must still pass monorepo CLI path + `--at examples/…` | Slightly more privileged than a cold `npx` user | Separate cold-start E2E outside the monorepo |

## Run log

### 2026-07-15 — `exam-hall-physics`

**User prompt (natural):**  
수능 물리 준비하는 고등학생용으로 「시험장의 물리」… 목차형… 기출 비복사…

**Outcome:** 8-chapter `<Course>` / LinearCourse at `examples/exam-hall-physics`.  
`check` / `typecheck` / `build` ok. Packs kept: audience, lecture-design, exam, sim2d.

**Sub-agent reported gaps (skill/product):**

1. **`exam` pack example API drift** — docs example still shows `Quiz` with `prompt`/`answer`; live kit wants `question` + `options[{label,correct}]`. Skill/example stale → agents copy wrong API until they read kit source.
2. **`pack remove tutor` cleanup incomplete** — Nitro/workflow vite + tsconfig leftovers; agent had to restore plain Vite by hand. Pack remove should fully revert app shell.
3. **No CSAT item-bank pack** — fine; original scenarios only. Don’t overfit a pack.
4. **Skipped per-node `.faraday/plan/.../nodes/<id>.md`** — overview table only. For this size OK; skill says briefs help resume/sub-agents on larger curricula.
5. **Visual quality-bar ungraded** — agent verified HTTP 200 + static physics, not browser Play/charts. Skill Verify still weak on “drive the UI” in headless cloud.

**Orchestrator review:** Structure matches request (TOC, topics, mock exam). Chapters ~220–300 lines with Workbench/Chart/Derivation — acceptable first pass. `circular` thinner than peers — candidate for a later user-like “원운동만 좀 더 살집 있게” follow-up. Deploy `vercel.json` added by orchestrator (packaging, not authoring).
