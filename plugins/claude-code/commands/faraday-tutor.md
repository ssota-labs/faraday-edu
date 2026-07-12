---
description: Add or embed the durable grounded AI tutor in a Faraday lesson, and verify it streams.
argument-hint: "[grounding context or 'embed in current lesson']"
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Add / embed the Faraday AI tutor. Context: **$ARGUMENTS**

Follow the `faraday` skill's `references/tutor.md`. Steps:

1. **Ensure the tutor server layer exists.** If the current project has no
   `workflows/tutor-agent.ts` / `api/chat.post.ts`, the `tutor` pack hasn't been
   added yet. Run `faraday pack add tutor` to install it. Do **not** hand-add the
   server layer — it's a pinned dependency the pack manages.

2. **Key setup** (local): ensure `.env.local` exists with `AI_GATEWAY_API_KEY`:
   ```bash
   cp env.example .env.local   # then the user pastes their key
   ```
   Never print or commit the key. On Vercel, no key is needed (OIDC).

3. **Embed `<Tutor>`** in `src/lesson/lesson.tsx`, grounded in the lesson text:
   ```tsx
   import { Tutor } from "@faraday-academy/tutor";
   <Tutor title="…" context={LESSON_TEXT} greeting="…" />
   ```
   Pass the actual lesson content (or the relevant slice) as `context` so answers
   are grounded and quiz answers don't leak.

4. **Tune persona/model (optional)**: edit `workflows/tutor-agent.ts`
   (`buildInstructions`, `MODEL_ID`, reasoning). Keep the prompt prefix
   deterministic so implicit caching keeps working.

5. **Verify with curl** (preview tools mishandle SSE). Start `pnpm dev`, read the
   PORT, then POST to `/api/chat` and confirm `text-delta` tokens stream a
   grounded, Socratic answer (and `reasoning-*` events if thinking is on). If the
   model step 500s with an ajv "Dynamic require" error, check
   `pnpm-workspace.yaml` has `nodeLinker: hoisted` and reinstall.

6. Optionally open the dev URL in a browser to confirm the collapsible "Thinking"
   block renders above answers.
