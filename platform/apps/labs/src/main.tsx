import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { ThemeProvider } from "@/faraday/runtime";
import { App } from "@/app/App";
import { WorldFrame } from "@/world-frame";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing from index.html");

// `?frame=world` mounts just the immersive world (embedded via <iframe> from the
// hud/host previews, since it renders fixed-fullscreen). Everything else is the app.
const frame = new URLSearchParams(window.location.search).get("frame");

// ThemeProvider + `.style-faraday` mirror LessonHost, so both the labs chrome and
// the previewed blocks render with the real theme + component style layer.
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <div className="style-faraday min-h-screen bg-background text-foreground">
        {frame === "world" ? <WorldFrame /> : <App />}
      </div>
    </ThemeProvider>
  </StrictMode>,
);
