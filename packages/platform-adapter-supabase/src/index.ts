import {
  createMemoryStore,
  type PlatformStore,
} from "@faraday-academy/platform-core";
import { createPostgresStore } from "./postgres-store";

export type AdapterMode = "memory" | "supabase";

export {
  SMOKE_EMAIL,
  SMOKE_PASSWORD,
  LOCAL_AUTH_USER_EMAIL,
  LOCAL_AUTH_USER_ID,
} from "./constants";

/**
 * Creates a PlatformStore.
 * - With SUPABASE_URL + SERVICE_ROLE + DATABASE_URL → Postgres store
 * - With SUPABASE credentials but no DATABASE_URL → memory (Auth-only)
 * - Otherwise → memory
 */
export function createPlatformAdapter(
  env: NodeJS.ProcessEnv = process.env,
): { mode: AdapterMode; store: PlatformStore } {
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = env.DATABASE_URL;

  if (url && key && databaseUrl) {
    return { mode: "supabase", store: createPostgresStore(databaseUrl) };
  }
  if (url && key) {
    return { mode: "supabase", store: createMemoryStore() };
  }
  return { mode: "memory", store: createMemoryStore() };
}

export { createMemoryStore, createPostgresStore };
