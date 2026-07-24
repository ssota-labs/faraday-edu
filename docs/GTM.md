# Faraday Academy — GTM (3d-stem pivot)

> Status: **active draft** · Pair with [VISION.md](VISION.md).
> Prior Stage 1–4 (CLI → non-coder platform → student marketplace → meta packs)
> narrative is **superseded**.

---

## 1. Wedge

**Fullscreen 3D interactive textbooks for STEM concepts**, authored through a
coding-agent skill (`3d-stem`).

Promise: *“Describe the concept. Get something students can orbit, scrub, and
break until it clicks.”*

---

## 2. Audience (v1)

| Persona | Why they care | Why now |
|---|---|---|
| **STEM tutors / TAs** already on Claude Code, Cursor, or Codex | Differentiate with manipulable 3D explanations | Zero new tooling purchase — skill install only |
| **Indie educators / explainers** | Turn a hard visual topic into a shareable demo | Showcase + fork path later |
| **Engineering/math content creators** | Better than a static blog diagram | Agent does the Three.js grind |

Non-goals for v1 GTM: K–12 LMS procurement, school district IT, student billing.

---

## 3. Product → go-to-market shape

```
Content / showcase clip
        ↓
Install skill 3d-stem (from faraday-academy)
        ↓
Author one fullscreen 3D lesson in an agent session
        ↓
Local preview → share URL (static host)
        ↓
Optional: pull education UI from shadcn registry
```

No npm CLI cold start. No “pin four @faraday-academy packages” story.

---

## 4. Positioning

| vs | Difference |
|---|---|
| Generic “ask agent to make a Three.js demo” | Staged gates + pedagogy references + STEM-focused template |
| img2threejs | Not image→prop reconstruction; **concept→teaching experience** |
| Full LMS / tutor platforms | Intentionally absent — sharpness is the feature |
| Component libraries alone | Skill loop is the product; registry is a supporting surface |

---

## 5. Near-term success metrics

| Gate | Signal |
|---|---|
| L0 | Dogfood: ≥3 internal fullscreen 3D lessons via `3d-stem` |
| L1 | External author completes scaffold→check→preview without npm Faraday packages |
| L2 | At least one public showcase lesson with a clear STEM “aha” |

North star stays qualitative until L2: **does the 3D interaction make the concept
clearer than a static figure?**

---

## 6. What we deliberately defer

- Managed AI tutor, auth, payments, course marketplace
- Non-coder web studio (former Stage 2)
- Pack/skill marketplace between teachers (former Stage 4)
- Broad multi-format course shells (slides + textbook + game)

Revisit only with a new PRD after the wedge works.

---

## 7. Risks

1. **Skill bloat** — pedagogy + 3D craft must stay progressive; front door stays thin.
2. **“Just another R3F template”** — gates + learning design must be felt in the loop.
3. **Registry distraction** — ship a tiny education set; do not build a second shadcn.
4. **Legacy confusion** — README must not still push `npx @faraday-academy/cli`.
