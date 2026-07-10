# The AI Tutor (`--tutor`)

This lesson was scaffolded with `--tutor`, so it ships a **durable, grounded AI
chat tutor** you can drop beside any content. It follows Vercel's AI SDK design
and runs a Workflow DevKit durable agent, so a reply survives a page refresh or
network drop and resumes mid-answer.

## Setup (one time)

The tutor calls a model through the Vercel AI Gateway, so it needs a key locally:

```bash
cp env.example .env.local     # then paste your AI_GATEWAY_API_KEY
pnpm dev
```

Get a key at https://vercel.com/dashboard → AI Gateway → API keys. `.env.local`
is git-ignored — never commit a real key. On Vercel, no key is needed: deploys
authenticate to the Gateway via OIDC automatically.

Without a key, the UI still loads and streams start, but the model step fails
with a Gateway auth error — that's expected until you add the key.

## Embed it

Import `<Tutor>` from `@/faraday/tutor` and ground it in the surrounding content:

```tsx
import { Tutor } from "@/faraday/tutor";

<Tutor
  title="Binary-search tutor"
  context={LESSON_TEXT}          // the tutor answers from this, and won't leak quiz answers
  greeting="Hi! Ask me anything about binary search."
/>
```

Props (all optional except none are required): `context` (grounding text),
`title`, `greeting`, `className`. A full example is in
[`docs/examples/tutor.tsx`](examples/tutor.tsx) — copy it into
`src/lesson/lesson.tsx` to try it.

## How it's wired (you rarely touch this)

- `workflows/tutor-agent.ts` — the durable agent + **its system prompt**. Edit
  here to change the tutor's persona, rules, or model (`MODEL_ID`).
- `api/chat.post.ts` + `api/chat/[runId]/stream.get.ts` — the server routes
  (start a run; reconnect to it). Nitro serves these under `/api/`.
- `src/faraday/tutor/**` — the chat UI + `<Tutor>` client. Vendored + locked
  (don't edit; `faraday check` verifies it).

Static (non-tutor) lessons stay server-free; only the tutor adds the `api/` +
`workflows/` server layer.
