import type { NextConfig } from "next";

/** Direct local/remote Supabase origin for the server-side rewrite target. */
const supabaseOrigin =
  process.env.SUPABASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:54321";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@faraday-academy/kit",
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
};

export default nextConfig;
