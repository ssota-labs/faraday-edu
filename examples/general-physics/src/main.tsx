// Fixed entry point. Loads the app stylesheet + the runtime and mounts the
// authored lesson. You normally don't edit this — write src/lesson/lesson.tsx.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import { LessonHost } from "@faraday-academy/kit/runtime";
import Lesson from "@/lesson/lesson";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing from index.html");

createRoot(root).render(
  <StrictMode>
    <LessonHost>
      <Lesson />
    </LessonHost>
  </StrictMode>,
);
