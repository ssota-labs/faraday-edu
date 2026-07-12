# The AI Tutor (`tutor` pack)

This lesson has the `tutor` pack added (`faraday pack add tutor`), so it ships a
**durable, grounded AI chat tutor** you can drop beside any content. It follows Vercel's AI SDK design
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

Wrap the **whole lesson** in `<TutorDock>` from `@faraday-academy/tutor`. It hoists the
tutor to a resizable, collapsible **right-side panel** (opened by a right-edge tab;
a drawer on mobile) — the same dock across every lesson layout. Don't drop `<Tutor>`
inline in the content flow.

```tsx
import { Lesson, Prose, Quiz } from "@faraday-academy/runtime/blocks";
import { TutorDock } from "@faraday-academy/tutor";

<TutorDock
  title="Binary-search tutor"
  context={LESSON_TEXT}          // the tutor answers from this, and won't leak quiz answers
  greeting="Hi! Ask me anything about binary search."
>
  <Lesson title="…" topic="…" lead="…">
    {/* your prose, interactives, quiz — the normal lesson */}
  </Lesson>
</TutorDock>
```

Props (only `children` is required): `context` (grounding text), `title`,
`greeting`, `defaultOpen` (desktop starts closed). Replies render as **Markdown +
KaTeX math**. A full example is in [`docs/examples/tutor.tsx`](examples/tutor.tsx) —
copy it into `src/lesson/lesson.tsx` to try it. (`<Tutor>`, the bare chat card, is
still exported for custom placements.)

## How it's wired (you rarely touch this)

- `workflows/tutor-agent.ts` — the durable agent + **its system prompt**. Edit
  here to change the tutor's persona, rules, or model (`MODEL_ID`).
- `api/chat.post.ts` + `api/chat/[runId]/stream.get.ts` — the server routes
  (start a run; reconnect to it). Nitro serves these under `/api/`.
- `src/faraday/tutor/**` — the chat UI + `<Tutor>` client. Vendored + locked
  (don't edit; `faraday check` verifies it).

Static (non-tutor) lessons stay server-free; only the tutor adds the `api/` +
`workflows/` server layer.
