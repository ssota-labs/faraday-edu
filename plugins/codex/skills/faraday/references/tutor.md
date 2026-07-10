# The AI tutor (`--tutor`)

`faraday new <name> --tutor` turns the lesson app into a Vite + Nitro + Workflow
hybrid and vendors a `<Tutor>` component. It follows Vercel's AI SDK design and
runs a **Workflow DevKit durable agent**: a reply survives a page refresh, a
network drop, or a serverless timeout and resumes mid-answer.

## Setup (one time, local)

The tutor calls a model through the Vercel AI Gateway, so it needs a key locally:

```bash
cp env.example .env.local     # then paste your AI_GATEWAY_API_KEY
pnpm dev
```

Get a key at https://vercel.com/dashboard → AI Gateway → API keys. `.env.local`
is git-ignored — **never commit a real key**. On Vercel, no key is needed:
deploys authenticate to the Gateway via OIDC automatically. Without a key the UI
still loads and the stream starts, but the model step fails with a Gateway auth
error — expected until you add the key.

## Embed it

Wrap the **whole lesson** in `<TutorDock>` — it hoists the tutor to a resizable,
collapsible **right-side panel** (the mirror-dimension dock model), the same across
every lesson layout. A right-edge tab opens it; on narrow screens it's a drawer.
Do **not** drop `<Tutor>` inline in the content flow — the dock is the placement.

```tsx
import { Lesson, Prose, Quiz } from "@/faraday/blocks";
import { TutorDock } from "@/faraday/tutor";

<TutorDock
  title="Binary-search tutor"
  context={LESSON_TEXT}   // the tutor answers from this and won't leak quiz answers
  greeting="Hi! Ask me anything about binary search."
>
  <Lesson title="Binary search — with a tutor" topic="Algorithms" lead="…">
    <Prose>…</Prose>
    <Quiz … />
  </Lesson>
</TutorDock>
```

Props (all optional besides `children`): `context` (grounding text), `title`,
`greeting`, `defaultOpen` (desktop starts closed by default). A full example is in
`docs/examples/tutor.tsx` — copy it into `src/lesson/lesson.tsx` to try it.
`<Tutor>` (the bare chat card) is still exported for custom placements, but the
dock is the default. **Replies render as Markdown + KaTeX** — the scaffolded prompt
tells the tutor to write math with `$…$` / `$$…$$` delimiters.

**Grounding is the point.** Pass the lesson text (or the relevant slice) as
`context`. The scaffolded system prompt instructs the tutor to answer *from* that
material, steer back when a question falls outside it, and stay Socratic — hint
and ask rather than dump answers, never leak quiz/exercise solutions.

## Wiring (rarely touched — but `workflows/` is yours)

- `workflows/tutor-agent.ts` — the durable agent **and its system prompt**. Edit
  here to change persona, rules, or the model (`MODEL_ID`) and reasoning level.
  This file is in the author zone, not the locked tree.
- `api/chat.post.ts` + `api/chat/[runId]/stream.get.ts` — server routes (start a
  run; reconnect to it). Nitro serves these under `/api/`.
- `src/faraday/tutor/**` — the chat UI + `<Tutor>` client. **Vendored + locked**
  (don't edit; `faraday check` verifies it).

Static (non-tutor) lessons stay server-free; only `--tutor` adds the `api/` +
`workflows/` layer.

## Model, thinking, caching (defaults)

The scaffolded `MODEL_ID` is a reasoning model that streams its thinking into a
collapsible "Thinking" block in the chat, and supports **implicit prompt
caching**: because `buildInstructions` is deterministic (no timestamps/random),
the system prompt + grounding prefix is byte-stable across a conversation, so each
turn cache-reads the growing prior prefix (no explicit cache breakpoints). Keep
the prefix stable when you edit the prompt. If you switch to an Anthropic model,
caching needs explicit `cache_control` breakpoints instead.

## Verifying the tutor works

The preview/browser tools don't handle SSE well — verify the API with `curl`:

```bash
curl -sS -N --max-time 90 -X POST "http://localhost:$PORT/api/chat" \
  -H 'content-type: application/json' \
  --data '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"<a question>"}]}],"context":"<lesson text>","title":"<title>"}'
```

Read the result by tier, so you know what a pass looks like in each case:

- **With a key** — expect `text-delta` tokens streaming a grounded, Socratic answer
  (and `reasoning-*` events if thinking is on). This is the full pass; also spot-check
  that the answer is actually grounded in your `context` and doesn't leak quiz answers.
- **Without a key** (common in a scaffold you haven't keyed) — the stream still
  returns **HTTP 200** and completes an *empty* envelope: `start → start-step →
  finish-step → finish → [DONE]` with **no `text-delta`**. The Gateway auth error
  surfaces **only in the dev server log**, never as an SSE event. So "200 + empty
  stream + a `GatewayAuthenticationError` in `dev.log`" is the expected keyless
  result — it confirms the whole durable pipeline works up to the model call. Don't
  read the empty stream as a failure.

Use the browser only for the visual "Thinking" block. Two gotchas:

- **ajv 500:** the tutor needs `nodeLinker: hoisted` in `pnpm-workspace.yaml` (the
  scaffold adds it) — without it, dev throws an ajv "Dynamic require … is not
  supported" 500 and the model step never responds.
- **Cold-start `ECONNRESET`:** the *first* `POST /api/chat` right after `pnpm dev`
  can return a Vite error page (`read ECONNRESET`) while the Nitro/Workflow layer
  warms up; every request after streams fine. Retry once before diagnosing.
