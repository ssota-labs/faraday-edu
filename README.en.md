# Faraday Academy

[*한국어*](README.md) · **English**

> **Already teaching a STEM idea? Ask your coding agent.**
> Get a **fullscreen 3D interactive textbook** learners can manipulate.

Skill name: **`3d-stem`** · Repo: `ssota-labs/faraday-academy`

---

## Start here

**You need:** [Cursor](https://cursor.com) · [Claude Code](https://claude.ai/code) · or [Codex](https://openai.com/codex)

Paste into your agent chat:

```text
Install the 3d-stem skill and make a fullscreen 3D STEM lesson where I can
manipulate orbital period.
Run: npx skills add ssota-labs/faraday-academy
Skill name: 3d-stem
```

The agent installs → designs → scaffolds → authors → `check` → local preview.

### More prompts

```text
Make a fullscreen 3D lesson that shows binary-search-tree rotations.
```

```text
Explain the intuition behind Maxwell’s equations in fullscreen 3D.
```

<details>
<summary>Per-agent plugin install</summary>

| Agent | Steps |
|---|---|
| **Claude Code** | `/plugin marketplace add ssota-labs/faraday-academy` → `/plugin install 3d-stem@faraday-academy` |
| **Codex** | `codex plugin marketplace add ssota-labs/faraday-academy` |
| **skills (any)** | `npx skills add ssota-labs/faraday-academy` |

See [`plugins/claude-code/`](plugins/claude-code/) and [`plugins/codex/`](plugins/codex/).

</details>

<details>
<summary>Run skill scripts from this monorepo</summary>

```bash
node skills/3d-stem/scripts/stem.mjs scaffold my-orbit --json --skip-install
cd my-orbit && pnpm install && pnpm dev
node skills/3d-stem/scripts/stem.mjs check --dir my-orbit --json
```

`npx @faraday-academy/cli` is **not** the product path.

</details>

---

## What Faraday is (one line)

The coding-agent skill **`3d-stem`** turns a STEM concept into a local, previewable
**fullscreen 3D** lesson. Optional education UI copies from the **shadcn registry**
(`apps/ui`).

Vision / GTM: [vision](docs/content/docs/vision.mdx) · [GTM](docs/content/docs/planning/gtm.mdx)

---

## Layout

```
skills/3d-stem/     ← product body
plugins/*/skills/   ← marketplace mirrors
apps/ui/            ← education UI + shadcn registry
docs/content/docs/  ← Oh My Docs handbook
```

Legacy npm / LMS / pack surfaces: [`legacy/QUARANTINE.md`](legacy/QUARANTINE.md)

---

## Developer notes

```bash
pnpm install
pnpm sync:skills
pnpm test
pnpm --filter @faraday-academy/edu-ui dev
pnpm check:planning
```
