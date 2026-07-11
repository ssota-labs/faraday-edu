import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// "@" -> ./src for local lesson imports (e.g. "@/lesson/…"). The kit + 3D blocks
// come from the pinned @faraday-academy/* deps. Tailwind v4 runs via its Vite plugin.
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
