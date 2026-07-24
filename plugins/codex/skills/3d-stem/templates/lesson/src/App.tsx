import { LessonScene } from "./scene/LessonScene";

/**
 * Fullscreen 3D STEM lesson shell.
 * Keep the primary surface edge-to-edge; HUD may overlay the canvas.
 */
export function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <LessonScene title="STEM Lesson" />
    </div>
  );
}
