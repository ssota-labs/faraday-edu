import { createMemoryStore, type PlatformStore } from "@faraday-academy/platform-core";

export type AdapterMode = "memory" | "supabase";

export {
  SMOKE_EMAIL,
  SMOKE_PASSWORD,
  LOCAL_AUTH_USER_EMAIL,
  LOCAL_AUTH_USER_ID,
} from "./constants";

/**
 * Creates a PlatformStore. Without SUPABASE_URL + SERVICE_ROLE, uses memory
 * (local/dev without Docker). Schema + smoke seed live under /supabase and
 * `pnpm db:seed` (ssota parity).
 */
export function createPlatformAdapter(
  env: NodeJS.ProcessEnv = process.env,
): { mode: AdapterMode; store: PlatformStore } {
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    // Domain store still memory for this milestone; Auth/DB are exercised via
    // Supabase Auth + SQL migrations in e2e. Full SQL-backed PlatformStore is next.
    return { mode: "supabase", store: createMemoryStore() };
  }
  return { mode: "memory", store: createMemoryStore() };
}

export { createMemoryStore };
