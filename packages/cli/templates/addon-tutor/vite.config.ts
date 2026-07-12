import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { workflow } from "workflow/vite";

// Tutor-enabled variant. Vite still builds the front end; Nitro adds the server
// framework that serves the `api/**` routes, and the `workflow()` plugin compiles
// the `"use workflow"` / `"use step"` directives into durable runs. `pnpm dev`
// runs both together (default http://localhost:3000). Deploys to Vercel with no
// extra config. See node_modules/workflow/docs/getting-started/vite.mdx.
export default defineConfig({
  plugins: [react(), tailwindcss(), nitro(), workflow()],
  // Nitro scans the project root for `api/**` route handlers + `workflows/`.
  nitro: {
    serverDir: "./",
  },
  resolve: {
    // "@" -> ./src for local lesson imports; the runtime/tutor come from the
    // pinned @faraday-academy/* deps.
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
});
