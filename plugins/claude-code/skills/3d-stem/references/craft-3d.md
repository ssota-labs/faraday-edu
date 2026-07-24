# 3D craft notes (STEM lessons)

## Framing

- Default camera should show the relationship, not a heroic product shot.
- Limit orbit so learners can’t lose the subject under the floor forever.
- Scale helpers (grid, axes, unit cues) only while they teach; remove when noise.

## Materials & light

- Prefer clear silhouettes over heavy PBR showcases.
- Emissive accents for “active” elements; keep the rest quieter.
- Avoid purple neon defaults — pick a palette that fits the domain.

## Performance

- Prefer transforms and simple geometries before SDF/raymarch flex.
- Dispose geometries/materials on hot-reload paths when replacing meshes.
- Keep HUD DOM minimal; don’t portal a design system into the canvas.

## Accessibility

- Every range/button needs a name.
- Don’t convey state by color alone — pair with labels/motion.
- Honor reduced motion.
