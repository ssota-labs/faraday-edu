# Pack: `tutor` — grounded AI tutor (agent guide)

Load this when the lesson should **answer learner questions from its own
content** — a grounded, Socratic chat tutor beside the material. It is the skill
half of the `tutor` pack; the runtime half is the pinned `@faraday-academy/tutor`
widget **plus** an author-editable durable server (`api/` + `workflows/`).

## What installing this pack does

The lesson becomes a Vite + Nitro + Workflow hybrid. The `<Tutor>` widget is a
pinned dependency; the durable agent that powers it lives in **author-editable**
`workflows/tutor-agent.ts` — persona, rules, and model are yours to edit.

## Embedding

```tsx
import { Tutor } from "@faraday-academy/tutor";

<Tutor
  title="Binary-search tutor"
  context={LESSON_TEXT}   // the tutor answers ONLY from this — grounding, no quiz-answer leaks
  greeting="Hi! Ask me anything about binary search."
/>
```

## Rules the tutor must hold

- **Grounded** — answer from the `context` you pass; steer back when a question
  falls outside it. Never invent facts the lesson doesn't teach.
- **Socratic** — hint and ask, don't dump answers. Never leak quiz/exercise
  solutions outright.
- **Durable** — a reply survives a page refresh, a network drop, or a serverless
  timeout and resumes mid-answer (Workflow DevKit).

## Setup

`cp env.example .env.local` and paste an `AI_GATEWAY_API_KEY` (Vercel dashboard →
AI Gateway → API keys). `.env.local` is git-ignored — never commit a real key. On
Vercel, deploys authenticate via OIDC; no key needed. Full guide: the installed
`docs/tutor.md`.

## Quality gate

See `quality.md`. Key rules: the tutor is passed a real `context`, it never leaks
quiz answers, and it's only added when a lesson genuinely benefits from Q&A.
