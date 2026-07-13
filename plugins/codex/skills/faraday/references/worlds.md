# Course shells, lecture presentations, 3D, LMS

Terminology: [specs/terminology.md](../../../../specs/terminology.md). Summary:

- **Curriculum** (program) → **Course** (lecture collection + graph) → **Lecture** (topic unit) → **Presentation** (slide / textbook views).
- **Course shell** — how lectures are *navigated* (`CourseHost` + `linearPack` / `map2d` / `world3d`).
- **`<LinearCourse>`** — simple linear course (chapters, no unlock graph).

## `<LinearCourse>` — linear chaptered course

Bundle several lectures into a navigable sequence (chapter nav, prev/next, `#hash`
deep links). Put chapter components in `src/lesson/chapters/`.

```tsx
import { LinearCourse } from "@faraday-academy/runtime/runtime";
export default function MyCourse() {
  return <LinearCourse title="…" chapters={[
    { slug: "intro", title: "Intro", element: <IntroChapter /> },
    { slug: "next",  title: "Next",  element: <NextChapter /> },
  ]} />;
}
```

(`Course` is a deprecated alias for `LinearCourse`.)

## `<CourseHost>` — course with unlock progression

For a **course** (lecture graph with `requires` + per-lecture `lesson`). The host
owns progress, course-shell↔lecture toggle, HUD, and LMS/tutor events. The *shell*
is a swappable **pack**:

- `linearPack` — status list (built-in: `@faraday-academy/runtime/world`)
- `map2dPack` — 2D map (**game screen**). `faraday pack add map2d`
- `world3dPack` — 3D constellation. From the `three` pack

```tsx
import { CourseHost, useNode, type Course } from "@faraday-academy/runtime/world";
import { map2dPack } from "./map2d";

const course: Course = { title: "…", nodes: [
  { id: "a", title: "A", meta: { x: 15, y: 50 }, lesson: <LessonA /> },
  { id: "b", title: "B", requires: ["a"], meta: { x: 55, y: 50 }, lesson: <LessonB /> },
]};
export default () => <CourseHost course={course} pack={map2dPack} />;
```

(`CurriculumHost` / `Curriculum` types are deprecated aliases.)

> Keep `course` at **module scope** — recreating the object each render resets progress.

## 3D lessons (`three` pack)

Import from `@faraday-academy/three`. See the `three` pack skill for moods, helpers, `<Model>`, and physics.

## LMS — progress tracking

```tsx
import { CourseHost } from "@faraday-academy/runtime/world";
import { useLmsRecorder, ProgressDashboard } from "@faraday-academy/runtime/lms";
const rec = useLmsRecorder("my-course");
<CourseHost course={c} pack={map2dPack} onEvent={rec.onEvent} />
<ProgressDashboard courseId="my-course" course={c} events={rec.events} />
```

## Rendering gotcha (3D & charts)

A `<Scene3D>` or `<Chart>` only paints once its container has non-zero width.
