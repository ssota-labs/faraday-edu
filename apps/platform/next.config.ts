import type { NextConfig } from "next";

/** Direct local/remote Supabase origin for the server-side rewrite target. */
const supabaseOrigin =
  process.env.SUPABASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:54321";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@faraday-academy/platform-contracts",
    "@faraday-academy/platform-core",
    "@faraday-academy/platform-adapter-supabase",
    "@faraday-academy/platform-artifact-router",
    "@faraday-academy/platform-studio-build",
    "@faraday-academy/platform-studio-sandbox",
    "@faraday-academy/ui",
  ],
  // Same-origin proxy so browser auth works through Server Preview / cloud
  // port tunnels (only :3100 needs forwarding). Server code still talks to
  // SUPABASE_URL directly via the adapter.
  async rewrites() {
    const target = supabaseOrigin.replace(/\/$/, "");
    return [
      {
        source: "/supabase-api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
  // Workflow step bundles: keep CJS-only deps external so esbuild/Turbopack do
  // not emit broken dynamic-require stubs (same list as ssota / mirror-dimension).
  // Do NOT list `rxjs` — it conflicts with Turbopack transpile.
  serverExternalPackages: [
    "@vercel/oidc",
    "@vercel/connect",
    "semver",
    "cbor-x",
    "cbor-extract",
    "reflect-metadata",
    "@nestjs/common",
    "@nestjs/core",
    "ajv",
  ],
};

// Workflow DevKit transform — required for `"use workflow"` / WorkflowAgent.
// Local World works without a Vercel deploy.
export default async function config(
  phase: string,
  ctx: { defaultConfig: NextConfig },
): Promise<NextConfig> {
  const { withWorkflow } = await import("workflow/next");
  let result: NextConfig | ((p: string, c: typeof ctx) => Promise<NextConfig>) =
    withWorkflow(nextConfig) as
      | NextConfig
      | ((p: string, c: typeof ctx) => Promise<NextConfig>);
  if (typeof result === "function") {
    result = await result(phase, ctx);
  }
  return result;
}
