---
description: Build and deploy the current Faraday lesson (static, or to Vercel for tutor lessons).
argument-hint: "[preview|prod]"
allowed-tools: Bash, Read, Glob, Grep
---

Deploy the current Faraday lesson. Target: **$ARGUMENTS** (default: preview).

> `faraday deploy` is planned for Phase 1; today, deploy uses the project's own
> build + Vercel. Pick the path by whether the lesson has a tutor.

1. **Gate first.** `pnpm check` must exit 0 and the lesson must render in
   `pnpm dev`. Do not deploy a lesson you haven't driven.

2. **Static lesson (no `tutor` pack)** — pure client bundle:
   ```bash
   pnpm build            # → dist/  (deployable to any static host)
   ```
   Deploy `dist/` to any static host, or `vercel deploy` (add `--prod` for
   production).

3. **Tutor lesson (has the `tutor` pack)** — has an `api/` + `workflows/` server
   layer, so it needs a Node host. Deploy to **Vercel**:
   ```bash
   vercel deploy         # add --prod for production
   ```
   On Vercel, the tutor authenticates to AI Gateway via **OIDC** — do not set
   `AI_GATEWAY_API_KEY` in the deployment; that key is local-only. Confirm the
   project is linked (`vercel link`) first.

4. **Verify the deployment**: open the URL, drive the lesson; for a tutor, send a
   real question and confirm a grounded streamed answer.

5. Report the deployment URL and environment (preview vs prod).

Never commit `.env.local` or a real `AI_GATEWAY_API_KEY`.
