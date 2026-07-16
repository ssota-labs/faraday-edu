import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Mirror a generated lesson: kit hosts blocks/runtime; ui holds
// primitives. Specific `@/faraday/ui` alias must come before the kit catch-all.
const kit = path.resolve(import.meta.dirname, "../../packages/kit");
const ui = path.resolve(import.meta.dirname, "../../packages/ui/src/components/ui");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/faraday/ui": ui,
      "@/faraday": kit,
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: { host: true },
});
