import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@faraday-academy/platform-contracts",
    "@faraday-academy/platform-core",
    "@faraday-academy/platform-adapter-supabase",
    "@faraday-academy/platform-artifact-router",
    "@faraday-academy/platform-studio-build",
    "@faraday-academy/platform-studio-sandbox",
  ],
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
