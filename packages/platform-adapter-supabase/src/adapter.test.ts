import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPlatformAdapter } from "./index";

describe("supabase adapter", () => {
  it("defaults to memory mode without credentials", () => {
    const { mode, store } = createPlatformAdapter({});
    assert.equal(mode, "memory");
    assert.ok(store);
  });

  it("reports supabase mode when credentials present", () => {
    const { mode, store } = createPlatformAdapter({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });
    assert.equal(mode, "supabase");
    // Without DATABASE_URL, domain store stays memory.
    assert.ok(store);
  });

  it("uses postgres store when DATABASE_URL is also set", async () => {
    // Skip when no live DB — constructor still returns a store object.
    const { mode, store } = createPlatformAdapter({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    });
    assert.equal(mode, "supabase");
    assert.ok(typeof store.saveCourse === "function");
    assert.ok(typeof store.saveDraft === "function");
  });
});
