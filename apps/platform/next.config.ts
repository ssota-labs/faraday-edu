import type { NextConfig } from "next";

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
  // withWorkflow(nextConfig) will wrap this in P2/P4 when WDK is wired.
};

export default nextConfig;
