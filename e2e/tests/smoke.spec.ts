import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  SMOKE_EMAIL,
  SMOKE_PASSWORD,
} from "@faraday-academy/platform-adapter-supabase/constants";
import { loginAsSmoke } from "../helpers/auth";

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "http://127.0.0.1:54321";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

test.describe("Faraday platform", () => {
  test("smoke: home renders Faraday brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Faraday", { exact: true }).first()).toBeVisible();
  });

  test("smoke: login → Studio", async ({ page }) => {
    await loginAsSmoke(page);
    await expect(
      page.getByRole("heading", { name: "Faraday Studio" }),
    ).toBeVisible();
  });
});

test.describe("Supabase auth (API)", () => {
  test("smoke: password login succeeds", async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: SMOKE_EMAIL,
      password: SMOKE_PASSWORD,
    });
    expect(error).toBeNull();
    expect(data.user?.email).toBe(SMOKE_EMAIL);
  });

  test("smoke: auth health is up", async ({ request }) => {
    const res = await request.get(`${supabaseUrl}/auth/v1/health`);
    expect(res.ok()).toBeTruthy();
  });
});
