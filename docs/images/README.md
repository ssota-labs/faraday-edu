# README images — capture checklist

Drop images here with these exact filenames and the READMEs will pick them up
(both `README.md` and `README.ko.md` reference the same paths). Until a file
exists, GitHub shows the alt text with a broken-image icon — that's the
placeholder. **GIF > PNG** wherever motion tells the story.

Legend: 📸 = screenshot/GIF from a running lesson · 🎨 = mockup/graphic you design ·
📐 = diagram (already done in-README as mermaid, listed for completeness).

| File | Type | What to show | Notes |
|---|---|---|---|
| `hero.gif` | 📸 | The money shot: a live lesson where you drag a slider (or scrub) and the chart/3D scene updates in real time. | Landscape ~1600×900. The compound-interest workbench or the Kepler 3D orbit both work. Keep it < 5 s, looping. |
| `component-curriculum.png` | 📸 | A curriculum **world** — the 2D node map or 3D constellation with locked/unlocked nodes (`<CourseHost>`). | Square-ish ~800×600 for the table thumbnail. |
| `component-lecture.png` | 📸 | A **paged / slideshow** lesson — one idea per screen with prev/next + dot rail (`<SlideDeck>`). | ~800×600. |
| `component-quiz.png` | 📸 | A check in action — a `<Quiz>` with a hint, or a `<Challenge>` mission being cleared. | ~800×600. |
| `component-lms.png` | 📸 | The **LMS dashboard** — progress across a course (`runtime/lms`). | ~800×600. |
| `component-tutor.png` | 📸 | The docked `<Tutor>` answering a question, grounded in the lesson. | ~800×600. |
| `tutor-wide.png` | 📸 | Wider shot of the tutor beside a full lesson (for the AI-tutor section). | Landscape ~1400×800. |
| `examples-gallery.png` | 📸 | A 2×3 montage of the six example lessons (Dijkstra, compound interest, Kepler, Galton, waves course, number quest). | Or six separate GIFs — see below. |
| `example-dijkstra.gif` | 📸 | Stepping through the graph, frontier expanding (`<Scrubber>`). | Optional (montage covers it). |
| `example-galton.gif` | 📸 | 500 balls falling into a bell curve (Rapier). | Optional. |
| `why-static-vs-interactive.png` | 🎨 | Side-by-side: a flat PDF/slide page vs the same idea as an interactive. Sells the "why". | Optional; a designed graphic, not a screenshot. |
| `og-card.png` | 🎨 | Social/OG preview card (logo + tagline). | 1200×630. For repo social preview + link unfurls. |

**Already diagrams (no image needed)** — rendered as mermaid in the README:
`the loop`, `architecture (runtime + skill layers bound by packs)`.

## How the placeholders are wired
Each slot in the READMEs looks like:
```md
<!-- 📸 hero.gif — see docs/images/README.md -->
![A live Faraday lesson: dragging a slider updates the chart](docs/images/hero.gif)
```
Replace nothing but the file — the `![alt](path)` stays.
