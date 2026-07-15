import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// "@" -> ./src for local lesson imports ("@/lesson/…"); the runtime comes from
// the pinned @faraday-academy/kit dep. Tailwind v4 runs through its Vite plugin.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // No fixed port — Vite auto-picks a free one, so several lessons can `pnpm dev`
  // side by side. Read the URL Vite prints. (Override with `pnpm exec vite --port N`.)
  server: {
    host: true,
  },
});
