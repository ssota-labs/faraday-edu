# Faraday examples

Live demos built **with** the Faraday CLI — same loop an early-adopter creator
runs (scaffold → author `src/lesson/**` → `pnpm check` → deploy). Each folder is
a self-contained Vite lesson app (its own `package.json` + lockfile).

| Example | Concept | Flags | Vercel root | Live |
|---|---|---|---|---|
| [`compound-interest/`](compound-interest/) | **S1 복리의 폭주** — sliders → compound growth chart | 2D | `examples/compound-interest` | [Vercel setup](../docs/VERCEL-DEMOS.md) |
| [`preschool-counting/`](preschool-counting/) | **유아 세기** — game-view: 대사 · 이동 · 사과 세기 미션 | 2D | `examples/preschool-counting` | local / Vercel |
| [`voyage-log/`](voyage-log/) | **C-B 항해 일지** — relativity / gravity / time as a space voyage curriculum | `--3d` | `examples/voyage-log` | [Vercel setup](../docs/VERCEL-DEMOS.md) |

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

Full walkthrough: [docs/VERCEL-DEMOS.md](../docs/VERCEL-DEMOS.md).

1. Import `ssota-labs/faraday-academy` **twice** (one project per demo).
2. Set **Root Directory** to the example (`examples/compound-interest` or `examples/voyage-log`).
3. Each folder’s `vercel.json` already runs `cd ../.. && pnpm install` so workspace
   `@faraday-academy/*` links work **before** packages are on npm.
4. After npm publish you can simplify install to plain `pnpm install` if you want.

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
