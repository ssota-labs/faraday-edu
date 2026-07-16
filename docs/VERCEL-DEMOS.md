# Deploy demos on Vercel

> **Status (0.3.0):** Workspace `examples/` were removed in Phase 1 reset. This guide is
> **deferred** until new reference lessons land. Use `apps/platform` for the catalog when
> that project is linked on Vercel.

GitHub Pages is **not** used (`gh-pages` branch removed).

## When examples return

Create Vercel projects with **Root Directory** set to each lesson folder under `examples/`.
`@faraday-academy/*@0.3.0` is on npm, so install can be a plain `pnpm install` inside the
lesson unless you intentionally link the monorepo workspace.

Typical `vercel.json` for a vinext lesson:

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "outputDirectory": ".vinext/dist"
}
```

Adjust `outputDirectory` to match the scaffold's vinext build output.

## Platform catalog (`apps/platform`)

Suggested Vercel settings when deploying the read-only catalog:

| Setting | Value |
|---|---|
| Root Directory | `apps/platform` |
| Build Command | `pnpm --filter @faraday-academy/platform build` |
| Install Command | `pnpm install` (repo root) |

## CLI deploy (token)

Cursor Secret / env에 `VERCEL_TOKEN`을 넣고:

```bash
# platform catalog (from repo root)
cd apps/platform
npx vercel@latest link --yes --token "$VERCEL_TOKEN"
npx vercel@latest --prod --token "$VERCEL_TOKEN"
```

## CTA placeholders

배포 후 `docs/CONTENT-STAGE1.md` / README의 demo URL 자리표시자를 실제 URL로 교체하세요.
