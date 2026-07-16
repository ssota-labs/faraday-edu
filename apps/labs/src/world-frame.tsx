import { LessonHost } from "@/faraday/runtime";
import { Callout, Lesson, Prose, Stat } from "@/faraday/blocks";

// LessonHost fills the viewport (min-h-screen) and owns its own theme toggle, so
// like the world it previews best in an isolated `?frame=lessonhost` iframe.
export function LessonHostFrame() {
  return (
    <LessonHost>
      <Lesson
        title="Inside the lesson frame"
        topic="Runtime"
        lead="LessonHost is the shell every generated lesson mounts inside."
      >
        <Prose>
          <p>
            It provides the <code>.style-faraday</code> style layer, a centered reading column, the light/dark toggle
            (top-right), and an error boundary — so an author throw renders a message instead of a blank page. Your{" "}
            <code>src/lesson/lesson.tsx</code> default export renders right here.
          </p>
        </Prose>
        <div className="flex flex-wrap gap-3">
          <Stat label="Reading width" value="max-w-4xl" />
          <Stat label="Theme" value="light / dark toggle" />
        </div>
        <Callout title="Fixed entry">You normally don't edit this — it lives in the app shell.</Callout>
      </Lesson>
    </LessonHost>
  );
}
