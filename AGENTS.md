# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Faraday** CLI (`@faraday-kit/cli`, codename "Primer" in `README.md`): a
zero-dependency Node.js ESM scaffolder that stamps out self-contained Vite + React
interactive lessons. There is no long-running service for the repo itself — the CLI runs to
completion. See `README.md` for the command reference; notes below cover non-obvious caveats.

### Toolchain / dependencies
- Node **v22** and **pnpm** are pre-installed on the base image. The CLI has **zero** runtime
  dependencies (root `package.json` declares none), so the startup update script is a near
  no-op; nothing extra needs installing to run or test the CLI.
- There is no committed lockfile at the repo root, and running `npm install` here creates a
  stray `package-lock.json` — avoid committing it.

### Running / testing the CLI (from repo root)
- Tests: `node --test src/*.test.mjs` (Node's built-in runner; no ports, no services).
- Scaffold a lesson: `node bin/faraday.mjs new <name>` — this shells out to `pnpm install`
  inside the generated lesson (needs npm-registry access). Skip installing with
  `--skip-install` or `FARADAY_SKIP_INSTALL=1` (handy in CI / offline).
- Verify a lesson's locked tree: `node bin/faraday.mjs check --dir <lesson>`.
- Exit codes: `0` ok · `1` check failed · `2` usage error · `4` environment error.

### Working inside a generated lesson (2D / `--3d` / `--physics`)
- `pnpm check` (structure + SHA-256 integrity gates), `pnpm typecheck`, `pnpm build`,
  `pnpm dev`, `pnpm preview` (fixed port 4173).
- **Non-obvious:** `pnpm dev` (Vite) deliberately uses **no fixed port** — it auto-selects a
  free one and prints the URL. Pin it for testing with `pnpm dev --port <port> --host`.
- Only `src/lesson/**` is editable; everything under `src/faraday/**` is locked by the
  integrity manifest and will fail `check` if modified.

### Tutor mode (`--tutor`)
- Adds a server-backed AI chat tutor: the generated app becomes a Vite + Nitro + Workflow
  hybrid serving on `http://localhost:3000`. It needs an `AI_GATEWAY_API_KEY` in the
  generated lesson's `.env.local` (Vercel AI Gateway) only for live model responses; it boots
  and compiles without one. This key belongs in the generated lesson, not this repo.
