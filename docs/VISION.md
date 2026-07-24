# Faraday Academy — Vision (3d-stem pivot)

> Status: **active draft** · Replaces the prior CLI → LMS → platform stack narrative.
> Planning graph: [PRD-001](content/docs/planning/prds/prd-3d-stem-interactive-textbook-skill.mdx) ·
> [SPEC-001](content/docs/spec/spec-3d-stem-skill-and-distribution-contract.mdx) ·
> [PLAN-001](content/docs/development/plans/plan-pivot-faraday-academy-to-3d-stem.mdx)
>
> Inspiration: [img2threejs](https://github.com/hoainho/img2threejs) (skill = product + gated loop) ·
> [oh-my-docs](https://github.com/ssota-labs/oh-my-docs) (no public CLI; bundled skill runtime).

---

## 0. One-liner

**Already teaching a STEM idea? Ask your coding agent. Get a fullscreen 3D
interactive textbook you can manipulate.**

Repo stays `faraday-academy`. Skill name is **`3d-stem`**.

---

## 1. What we are (and are not)

| We are | We are not (v1) |
|---|---|
| A coding-agent **skill** that authors fullscreen 3D STEM lessons | An LMS (roster, grades, cohorts) |
| A quality-gated authoring **loop** (scripts + agent judgment) | A hosted platform / payments / marketplace |
| An **education UI** library via **shadcn registry** | An npm `@faraday-academy/*` runtime pin model |
| Visual understanding for science · engineering · math · CS | Slide decks, multi-view course shells, tutor SaaS |

---

## 2. Why this shape

img2threejs showed that putting scripts + knowledge **inside one skill** works
when the job is sharp. Oh My Docs applied the same idea to docs-first tooling
and dropped the public npm CLI.

Faraday’s previous surface (CLI publish, kit pins, packs, LMS, platform roadmap)
was the opposite of sharp. The pivot keeps the valuable parts — agent workflow,
pedagogy references, 3D craft — and cuts everything else.

### Division of labor (from img2threejs)

| Layer | Owns |
|---|---|
| Deterministic skill scripts | Scaffold, schema/structure gates, pass unlock, check |
| Agent | Topic framing, pedagogy choices, 3D clarity judgment, code authorship |
| shadcn registry | Optional education UI pieces copied into the lesson |
| Showcase app (later) | Live demos / gallery — marketing = product |

---

## 3. Target architecture

```
ssota-labs/faraday-academy
├─ skills/3d-stem/          ← product body (SKILL + scripts + references + templates)
├─ plugins/*/skills/3d-stem ← marketplace mirrors
├─ apps/
│  ├─ ui/ (or registry)     ← education component library + shadcn registry
│  └─ showcase/             ← fullscreen 3D lesson gallery
└─ docs/                    ← vision, GTM, Oh My Docs handbook
```

Legacy packages (`cli`, `kit`, `lms`, `official-packs`, npm publish scripts) are
removed or quarantined under PLAN-001 — not part of the product path.

---

## 4. Authoring loop (skill)

1. **Intake** — topic, level, “what should click?”
2. **Learning design** — outcomes, misconceptions, interaction thesis
3. **Scene spec** — 3D model of the idea, controls, feedback
4. **Scaffold** — template → local lesson project
5. **Build passes** — blockout → structure → interaction → readability → polish
6. **Verify** — scripted `check` + preview review
7. **Share** — local preview / static host (no Faraday platform required)

Pedagogy materials from the old Faraday skill are **rewritten into**
`skills/3d-stem/references/` and loaded progressively — they must not drag LMS
scope back in.

---

## 5. UI strategy

- Education-oriented components (controls, readouts, light HUD) live in the
  monorepo and are documented like a component library.
- Install path: **shadcn registry** (copy), not `npm install @faraday-academy/ui`.
- Fullscreen immersion wins: registry components must not force dashboard chrome.

---

## 6. Historical note

Earlier docs described Phase 0 CLI kit completion and GTM Stages 1–4 toward a
mirror-dimension-style education platform (LMS, managed tutor AI, Connect
payments). That roadmap is **superseded** by this pivot. Soft-launch notes under
`LAUNCH-STAGE1.md` / `STAGE1-STATUS.md` refer to the npm `0.3.0` era and should
be treated as historical until rewritten or archived.
