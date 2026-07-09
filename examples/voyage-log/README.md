# Voyage Log — 항해 일지

GTM Stage 1 curriculum demo (**C-B**): a six-stop 3D star-map that walks from
Kepler orbits to gravitational time dilation and clock synchronisation. Film
motif only — no titles, no dialogue, no score. Physics concept names only.

- Scaffolded with `faraday new voyage-log --3d` from the Faraday CLI.
- World: `<CurriculumHost>` + `world3dPack` (`mood="space"`).
- No `--tutor`: node 6 uses a `Quiz` mission so the whole demo stays
  static-deployable on Vercel.

## What's inside — six labs

Progression graph (arrows = `requires`):

```
kepler ─→ slingshot ─┬─→ elevator ─┐
                     ↓             ├─→ lens ─→ sync
                     └─→ dilation ─┘
```

| # | Node       | Concept                        | Interactivity                                                            | Flag     |
|---|------------|--------------------------------|--------------------------------------------------------------------------|----------|
| 1 | `kepler`   | Kepler's 2nd law               | 3D orbit, real M→E solver; two wedges of equal Δt swept over the same orbit — shoelace-area proof they stay equal | `--3d`   |
| 2 | `slingshot`| Gravity assist                 | 2D vector diagram; approach speed, approach angle, deflection δ in planet frame; live `\|v_in\|` / `\|v_out\|` / `\|Δv\|` | 2D       |
| 3 | `elevator` | Equivalence principle          | Segmented "accelerating deep space ↔ at rest in gravity"; identical ball + light-ray parabolas either way | 2D       |
| 4 | `dilation` | Gravitational time dilation    | Schwarzschild toy rate `√(1 − r_s/r)`; area chart of the curve + a "you are here" spike; drift stats | 2D + chart |
| 5 | `lens`     | Light bending & Einstein ring  | 3D lens plane; thin-lens equation `β = θ − θ_E²/θ`; two image points that merge as `β → 0`  | `--3d`   |
| 6 | `sync`     | Clock synchronisation finale   | Ship-vs-home clock after a deep hover; dial in the offset until they agree within 1 %      | 2D quiz  |

Every node ends with a `<Quiz onCorrect={complete} />` (from `useNode()`), so
answering correctly unlocks the next lab in the world.

## Structure

```
src/lesson/
  lesson.tsx          # default export = <CurriculumHost curriculum pack={world3dPack} />
  nodes/
    kepler.tsx        # 1  Kepler orbit
    slingshot.tsx     # 2  gravity assist
    elevator.tsx      # 3  equivalence
    dilation.tsx      # 4  time dilation
    lens.tsx          # 5  light bending
    sync.tsx          # 6  clock sync mission
```

The `Curriculum` object lives at module scope in `lesson.tsx` (stable identity,
so `CurriculumHost` can key progress on it). Only `src/lesson/**` is editable;
`src/faraday/**` is SHA-256 locked and will fail `pnpm check` if touched.

## Working with it

```bash
pnpm check          # structure + integrity gates
pnpm typecheck      # tsc -b
pnpm dev            # picks a free port; use --port 5188 --host to pin
pnpm build          # → dist/ for Vercel (root directory: examples/voyage-log)
pnpm preview        # serves dist/ on 4173
```

Testing tip: to walk the curriculum with headless Chrome (where WebGL doesn't
paint), temporarily swap `pack={world3dPack}` → `pack={linearPack}` — the
`linearPack` renders each node as an ordinary `<button>` you can drive from
CDP. See `AUTHORING-GAPS.md` §5.

## Related

- Root spec: [`DEMO-IDEATION.md`](../../DEMO-IDEATION.md) §4 (C-B)
- Authoring reference: [`docs/authoring.md`](docs/authoring.md)
- Friction log from building this demo: [`AUTHORING-GAPS.md`](AUTHORING-GAPS.md)
