# Faraday examples

Live demos built **with** the Faraday CLI — same loop an early-adopter creator
runs (scaffold → author `src/lesson/**` → `pnpm check` → deploy). Each folder is
a self-contained Vite lesson app (its own `package.json` + lockfile).

| Example | Concept | Flags | Vercel root |
|---|---|---|---|
| [`voyage-log/`](voyage-log/) | **C-B 항해 일지** — relativity / gravity / time as a space voyage curriculum | `--3d` | `platform/examples/voyage-log` |

## Deploy on Vercel (this monorepo)

1. Import `ssota-labs/faraday-edu`.
2. Set **Root Directory** to the example (e.g. `platform/examples/voyage-log`).
3. Framework: Vite. Build: `pnpm build`. Output: `dist`.
4. Each example ships a `vercel.json` with those defaults.

Local:

```bash
cd platform/examples/voyage-log
pnpm install   # if needed
pnpm check && pnpm build && pnpm preview
```

Scaffold a new example from the repo root:

```bash
node platform/packages/cli/bin/faraday.mjs new <name> [--3d|--physics] [--tutor] --at platform/examples/<name>
```
