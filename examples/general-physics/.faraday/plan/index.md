# Plan of record — General Physics

This app (a **Curriculum**) currently holds one **Course**:

- [`newtonian-mechanics/`](newtonian-mechanics/overview.md) — Newton's laws of motion, a
  6-lecture course shown as an immersive **map2d** course shell. Each lecture offers both a
  **SlideView** and a **TextbookView** presentation (`<Lecture views={…}>`).

## Layout

    newtonian-mechanics/
      overview.md      # brief · audience · methodology · pack decisions · lecture index
      nodes/
        <id>.md        # one file per lecture: outcome · interactions · check · view split

Each lecture is authored as its own file at `src/lesson/lectures/<id>.tsx` (export default a
`<Lecture>`) and assembled into the module-scope `course: Course` in `src/lesson/lesson.tsx`,
rendered by `<CourseHost course={course} pack={map2dPack} />`. Lectures are file-isolated so
they can be built independently (one sub-agent per lecture).
