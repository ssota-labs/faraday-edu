import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { ThemeProvider } from "@/faraday/runtime";
import { App } from "@/app/App";
import { LessonHostFrame } from "@/world-frame";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing from index.html");

// LessonHost fills the viewport, so preview it in an isolated iframe.
const frame = new URLSearchParams(window.location.search).get("frame");

// ThemeProvider + `.style-faraday` mirror LessonHost, so both the labs chrome and
// the previewed blocks render with the real theme + component style layer.
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <div className="style-faraday min-h-screen bg-background text-foreground">
        {frame === "lessonhost" ? <LessonHostFrame /> : <App />}
      </div>
    </ThemeProvider>
  </StrictMode>,
);
