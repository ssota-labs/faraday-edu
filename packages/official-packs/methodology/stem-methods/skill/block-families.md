# Block families — how stem-methods maps to Faraday

Stem-methods never assigns "phase 3 = `<Quiz>`". It assigns **families** — pick
any block from the family that fits the concept. If two blocks from the same
family would do, choose the leaner one (coherence over coverage).

## Families

| Family | Role | Typical blocks & controls |
|---|---|---|
| **Manipulative** | Learner changes inputs; the system responds visibly. Core of generative STEM. | `<Workbench>`, `<Stage>`, param controls (`ParamSlider`, `ParamSwitch`, `Segmented`, `Scrubber`) |
| **Spatial** | Geometry, fields, mechanisms, 3D structure — content that *is* spatial. | `<Stage>`, `<SketchPad>`, 3D scene (via `three` pack), spatial `<Compare>` |
| **Formalism** | Symbols, definitions, derivations — *after* intuition when possible. | `<TeX>`, `<Derivation>`, `<Reveal>` |
| **Data** | Measurements, distributions, relationships over numbers. | `<Chart>`, `<Readout>`, `<Stat>`, data-driven `<Compare>` |
| **Executable** | Runnable code the learner edits or traces. | `<CodeCell>` |
| **Check** | Commitment, discrimination, numeric proof, mission gates. | `<Quiz>`, `<NumericAnswer>`, `<Challenge>` |
| **Narrative** | Framing, scenarios, warnings, hooks — short. | `<Prose>`, `<Callout>` |
| **Presentation** | One idea per screen, pacing, kiosk/exhibit. | `<SlideDeck>` inside `<Lesson>` |
| **Structure** | Multi-chapter courses, worlds, progression shells. | `<Course>`, `<CourseHost>`, world packs |

## Composition rules

- **One family carries the load per phase.** Narrative sets up; manipulative or
  spatial does the work; formalism names it; check closes the loop.
- **Match family to content type**, not to learner "style": spatial content →
  spatial family; algorithm → executable; sampling distribution → data +
  executable; law relating variables → manipulative + data + formalism.
- **Checks are learning events**, not decorative end caps — they need the
  interaction or data from earlier families to answer (see `lecture-design`
  spaced-retrieval).
- **Fade formalism** for novices: manipulative/data first, formalism thinner;
  experienced learners can open on formalism + executable (expertise-reversal —
  see `audience` cross-cutting rules).

## Quick reference — which families each discipline leans on

| Discipline | Primary families | Secondary |
|---|---|---|
| Math (procedures) | Executable, formalism, check | Narrative |
| Math (concepts) | Manipulative, spatial, formalism | Check |
| Science (laws/models) | Manipulative, data, formalism | Check, spatial |
| Engineering (design) | Narrative, manipulative/executable, check | Data |
| Computing | Executable, check, narrative | Manipulative (for algorithms) |
| Statistics | Data, executable, check | Narrative, formalism |
