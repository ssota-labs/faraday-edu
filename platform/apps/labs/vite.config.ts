import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Recreate a generated lesson's environment so previews render EXACTLY like
// production: "@/faraday/*" resolves to the runtime package (the same alias a
// lesson's tsconfig/vite provide, where it points at the vendored src/faraday),
// and Tailwind v4 runs through its Vite plugin. "@" -> ./src for labs app code.
const runtime = path.resolve(import.meta.dirname, "../../packages/runtime");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/faraday": runtime,
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: { host: true },
});
