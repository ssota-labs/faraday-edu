import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import vinext from "vinext";

// vinext keeps the lesson compatible with App Router hosts while using Vite's
// fast local/build pipeline. "@" remains a project-local authoring alias.
export default defineConfig({
  plugins: [vinext(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
});
