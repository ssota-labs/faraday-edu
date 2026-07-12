# Faraday examples

Live demos built **with** the Faraday CLI — same loop an early-adopter creator
runs (scaffold → author `src/lesson/**` → `pnpm check` → deploy). Each folder is
a self-contained Vite lesson app (its own `package.json` + lockfile).

| Example | Concept | Flags | Vercel root | Live |
|---|---|---|---|---|
| [`compound-interest/`](compound-interest/) | **S1 복리의 폭주** — sliders → compound growth chart | 2D | `examples/compound-interest` | see [docs/STAGE1-STATUS.md](../docs/STAGE1-STATUS.md) |
| [`voyage-log/`](voyage-log/) | **C-B 항해 일지** — relativity / gravity / time as a space voyage curriculum | `--3d` | `examples/voyage-log` | see [docs/STAGE1-STATUS.md](../docs/STAGE1-STATUS.md) |

## Install Faraday (creator CTA)

```text
/plugin marketplace add ssota-labs/faraday-academy
/plugin install faraday@faraday

Then say:
  “Turn this topic into an interactive Faraday lesson: <topic>.
   Scaffold, author, run pnpm check and pnpm dev, then give me the URL.”

Repo: https://github.com/ssota-labs/faraday-academy
```

## Deploy on Vercel (this monorepo)

1. Import `ssota-labs/faraday-academy`.
2. Set **Root Directory** to the example (e.g. `examples/voyage-log`).
3. Framework: Vite. Build: `pnpm build`. Output: `dist`.
4. Requires `@faraday-academy/*` on npm (or build from the monorepo workspace).
5. Each example ships a `vercel.json` with those defaults.

Local (from repo root, after `pnpm install`):

```bash
pnpm --filter compound-interest check && pnpm --filter compound-interest build
pnpm --filter voyage-log check && pnpm --filter voyage-log build
```

Or inside an example:

```bash
cd examples/compound-interest
pnpm install   # links workspace @faraday-academy/* when installed from monorepo root
pnpm check && pnpm build && pnpm preview
```

Scaffold a new example from the repo root:

```bash
node packages/cli/bin/faraday.mjs new <name> [--3d|--physics] [--tutor] --at examples/<name>
```
