# Cursor Cloud environment (this repo)

## Why there is no committed `environment.json`

If `.cursor/environment.json` is **committed to the repo**, Cursor treats the environment as
**code-managed**. The dashboard then shows:

> *This environment is managed by a `.cursor/environment.json` file in the repository.*

In that mode the **environment page cannot edit Runtime Secrets in the web UI** (install/start are
read-only from git). That blocks the workflow we want: teammates add `NPM_TOKEN` / `VERCEL_TOKEN`
in the dashboard without a code change.

**This repo intentionally omits `.cursor/environment.json`.** Configure the environment from the
[Cloud Agents dashboard](https://cursor.com/dashboard?tab=cloud-agents) instead.

## Dashboard setup (recommended)

1. Open your environment for this repo  
   (`…/environments/r/github.com/ssota-labs/faraday-academy` or pick it from the list).
2. **Update script** (runs on every agent boot):

   ```sh
   pnpm install
   test -f scripts/setup-env-local.mjs && node scripts/setup-env-local.mjs || true
   ```

3. **Runtime Secrets** (right sidebar) — names must match `.env.example` exactly:
   - `NPM_TOKEN` — npm publish (`scripts/publish-packages.mjs`)
   - `VERCEL_TOKEN` — optional demo deploys
   - `FARADAY_SKIP_INSTALL` — set to `1` to skip install after `faraday new` in CI

4. After changing secrets, use **Start Setup Agent → Update Existing Env** (or **Start Fresh**)
   so the VM picks up new values.

`scripts/setup-env-local.mjs` copies matching secrets from `process.env` into `.env.local`
(git-ignored). Manual rerun: `pnpm setup:env`.

## Optional: code-managed install (trade-off)

You *can* commit `.cursor/environment.json` if you want install/start versioned in git — but you
lose dashboard secret editing for that environment. Use only when secrets are not needed or you
inject them another way (e.g. global user secrets, external secret manager).

Example (do **not** commit unless you accept that trade-off):

```json
{
  "install": "pnpm install",
  "start": "test -f scripts/setup-env-local.mjs && node scripts/setup-env-local.mjs || true"
}
```

See `environment.json.example` in this folder.
