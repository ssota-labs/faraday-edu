import Lesson from "@/lesson/lesson";
import { LessonHost } from "@faraday-academy/kit/runtime";

export default function Page() {
  return (
    <LessonHost>
      <Lesson />
    </LessonHost>
  );
}
