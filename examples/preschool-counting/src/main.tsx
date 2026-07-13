// Immersive game lesson — full viewport, no reading column.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import { ThemeProvider } from "@faraday-academy/runtime/runtime";
import Lesson from "@/lesson/lesson";

const root = document.getElementById("app");
if (!root) throw new Error("#app root element missing from index.html");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <div className="style-faraday min-h-screen overflow-hidden bg-black text-foreground">
        <Lesson />
      </div>
    </ThemeProvider>
  </StrictMode>,
);
