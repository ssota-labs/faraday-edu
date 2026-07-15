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

**Bad (ops coaching):** “Scaffold, author, run pnpm check and pnpm build…”  
**Good:** “수능 물리 보는 고등학생용으로 「시험장의 물리」 인터랙티브 코스 만들어줘…”

## Environment gaps

| Gap | Impact | Improvement |
|---|---|---|
| `ssota-mcp` needsAuth | No real studio sandbox yet | Auth or use isolated worktree as stand-in |
| No Faraday-author Task preset | Skill path must be injected in prompt | Preset that auto-attaches Faraday skill |

## Run log

_(starts with first skill-driven commission)_
