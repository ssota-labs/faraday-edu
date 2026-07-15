import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 *
 * Uses a same-origin `/supabase-api` rewrite (see next.config.ts) so Cursor
 * Server Preview / cloud port tunnels only need the Next port (3100). Hitting
 * `http://127.0.0.1:54321` from the browser would talk to the *client* machine,
 * not the cloud VM where `pnpm cloud:prepare` started Supabase.
 *
 * Override with `NEXT_PUBLIC_SUPABASE_BROWSER_URL` when you intentionally want
 * a direct URL (local native browser + exposed 54321).
 */
export function createBrowserClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_BROWSER_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/supabase-api`
      : (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321"));

  return createSupabaseBrowserClient(url, key);
}
