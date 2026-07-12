# map2d quality bar

An immersive presentation is only correct if it reads as a **game screen**, not a
document with a widget in it:

- **Full-bleed.** The map fills the viewport — no page header, no reading column
  around it. The host mounts it immersive; don't wrap it in a `<Lesson>`.
- **Every node frames.** All nodes — especially the current objective (the pulsing
  active node) — are on screen at laptop AND narrow/portrait aspect ratios. A node
  clipped off-canvas is a defect.
- **HUD reads.** Give each node a `summary` + `reward.xp` so the briefing panel isn't
  empty. Status is legible: locked/available/active/complete visibly differ.
- **Theme tokens only.** Colors come from `var(--primary)`, `var(--chart-3)`, etc.
  — never hardcoded hex, so light/dark both work.

Grade by screenshotting a real, non-zero viewport — an HTTP 200 can't see any of this.
