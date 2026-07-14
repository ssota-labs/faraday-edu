"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("smoke@faraday.academy");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(165deg, #f4f0e8 0%, #e8eef2 100%)",
        fontFamily: '"IBM Plex Sans", sans-serif',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "min(360px, 92vw)",
          background: "#fff",
          padding: "1.5rem",
          borderRadius: 12,
          border: "1px solid #ddd5c8",
          display: "grid",
          gap: "0.75rem",
        }}
      >
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", margin: 0 }}>
          Faraday sign in
        </h1>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid #cbbfae" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid #cbbfae" }}
          />
        </label>
        {error ? (
          <p role="alert" style={{ color: "#a11", margin: 0 }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          style={{
            background: "#0b6e4f",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            padding: "0.7rem",
            font: "inherit",
            cursor: "pointer",
          }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
