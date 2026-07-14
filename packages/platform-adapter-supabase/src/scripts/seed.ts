/**
 * Seed local Supabase for Faraday e2e (ssota-parity).
 * Creates smoke@faraday.academy / 1234 and a profile row.
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import {
  LOCAL_AUTH_USER_EMAIL,
  LOCAL_AUTH_USER_ID,
  SMOKE_EMAIL,
  SMOKE_PASSWORD,
} from "../constants";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1]!;
    const val = m[2]!;
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(new URL("../../../../.env.local", import.meta.url).pathname);
loadEnvFile(
  new URL("../../../../apps/platform/.env.local", import.meta.url).pathname,
);

async function seedSmokeUser(): Promise<string | undefined> {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "[db:seed] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; skip smoke user",
    );
    return undefined;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((user) => user.email === SMOKE_EMAIL);
  if (found) {
    await admin.auth.admin.updateUserById(found.id, {
      password: SMOKE_PASSWORD,
    });
    console.log(`[db:seed] Updated smoke password for ${SMOKE_EMAIL}`);
    return found.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: SMOKE_EMAIL,
    password: SMOKE_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Smoke Operator" },
  });

  if (error) throw error;
  console.log(`[db:seed] Created smoke user ${SMOKE_EMAIL}`);
  return data.user?.id;
}

async function upsertProfile(
  sql: ReturnType<typeof postgres>,
  userId: string,
  email: string,
  displayName: string,
) {
  await sql`
    insert into profiles (id, email, display_name, created_at, updated_at)
    values (${userId}::uuid, ${email}, ${displayName}, now(), now())
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name,
      updated_at = now()
  `;
}

async function ensureLocalAuthUser(sql: ReturnType<typeof postgres>) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === LOCAL_AUTH_USER_EMAIL);
  if (found) {
    await upsertProfile(sql, found.id, LOCAL_AUTH_USER_EMAIL, "Local Dev");
    return;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: LOCAL_AUTH_USER_EMAIL,
    password: "dev-local-password",
    email_confirm: true,
    user_metadata: { name: "Local Dev" },
  });
  if (error) {
    console.warn("[db:seed] local auth user:", error.message);
    return;
  }
  if (data.user?.id) {
    await upsertProfile(sql, data.user.id, LOCAL_AUTH_USER_EMAIL, "Local Dev");
  }
  void LOCAL_AUTH_USER_ID;
}

async function main() {
  const databaseUrl =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    const smokeId = await seedSmokeUser();
    if (smokeId) {
      await upsertProfile(sql, smokeId, SMOKE_EMAIL, "Smoke Operator");
    }
    await ensureLocalAuthUser(sql);

    const courses = await sql`select count(*)::int as n from courses`;
    console.log(`[db:seed] courses rows=${courses[0]?.n ?? 0}`);
    console.log(`[db:seed] Done. Smoke: ${SMOKE_EMAIL} / ${SMOKE_PASSWORD}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[db:seed] failed", err);
  process.exit(1);
});
