import { Suspense } from "react";
import StudioCourseClient from "./studio-course-client";

export default function StudioCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-svh items-center justify-center bg-background text-sm text-muted-foreground">
          Studio 준비 중…
        </div>
      }
    >
      <StudioCourseClient params={params} />
    </Suspense>
  );
}
