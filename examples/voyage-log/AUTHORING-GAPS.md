# Voyage Log — authoring friction log

Notes taken while building the C-B curriculum (`kepler → slingshot → elevator + dilation → lens → sync`)
as an external creator would experience Faraday. Severity legend:
**blocker** = can't ship without · **annoying** = wastes minutes per lesson ·
**nice-to-have** = polish.

> **Follow-up (same PR):** items §1, §4 (docs), §7, §10 (dev warn), §11 (dev warn)
> were patched in templates + Claude/Codex skill refs after this cold pass.

## 1. `Chart` `data` type rejects `null` — ✅ fixed

Was: `data` typed as `Record<string, string | number>[]`. Now allows `null`
(Recharts gap). Skill `blocks.md` documents it.

## 2. Chart doesn't render a visible curve in headless Chrome (nice-to-have)

At 220 px height with an area series, the curve is present in the DOM but very
low-contrast against the white card — in headless-Chrome screenshots the axes
draw but the filled area barely shows. Real browsers render it fine.

**Suggested fix (docs):** recommend `height ≥ 260` for area charts (noted in
skill `blocks.md`).

## 3. `<Planet>` is a decoration, not a Kepler integrator (annoying — but doc'd)

Scaffolded `lesson.tsx` uses `<Planet>` for "how planets orbit". Skill
`worlds.md` now points at `examples/voyage-log/.../kepler.tsx` as the correct
copy-paste path. Still worth shipping `docs/examples/kepler.tsx` later.

## 4. `<OrbitPath>` colour is a hex prop, not a theme token — ✅ docs fixed

Colour-split table added to skill `worlds.md` + starter `docs/authoring.md`.

## 5. `world3dPack` renders WebGL that headless-Chrome can't rasterise (nice-to-have)

swiftshader-webgl in `--headless=new` produces a canvas but doesn't paint to the
PNG buffer. Workaround: swap to `linearPack` for CI screenshots.

## 6. No `Chart.ReferenceLine` (nice-to-have)

Still open — optional `refX`/`refY` or children slot.

## 7. `Segmented` value type is `string` only — ✅ fixed

Now `Segmented<T extends string>` with shared `T` on value/onChange/options.

## 8. `useNode()` requires a curriculum host (annoying, correct-but-surprising)

Still open — consider no-op + warn, or `<IsolatedNodePreview>`.

## 9. `Workbench` requires a `<Card>`-style body (nice-to-have)

Still open — optional `footer` slot for Stats under the canvas.

## 10. Curriculum-object identity gotcha — ✅ soft-fixed

`CurriculumHost` now warns in dev when identity flips with the same title.
Docs/skills stress module-scope. Defensive memoise still optional.

## 11. `mood="neutral"` silent default — ✅ soft-fixed

`<Scene3D>` logs a one-shot-style dev warning when `mood === "neutral"`.

## 12. Six-lesson curriculum ⇒ 1.6 MB JS bundle (nice-to-have)

Still open — lazy `node.lesson` / Suspense for Stage 2.
