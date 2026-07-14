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
    const { mode } = createPlatformAdapter({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });
    assert.equal(mode, "supabase");
  });
});
