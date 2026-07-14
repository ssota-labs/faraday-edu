import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% -10%, #d8efe4 0%, transparent 55%), linear-gradient(165deg, #f4f0e8 0%, #e8eef2 100%)",
        color: "#1a1f2e",
        padding: "4rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Faraday
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 500, marginTop: "1rem" }}>
          Interactive courses, built with an agent, learned on a trusted shell.
        </h1>
        <p style={{ opacity: 0.8, maxWidth: 520, lineHeight: 1.5 }}>
          Stage 2 platform scaffold — Studio, Artifact Router, LMS, assessments,
          tutor, payments, and community APIs.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          <Link
            href="/login"
            style={{
              background: "#0b6e4f",
              color: "#fff",
              padding: "0.7rem 1.1rem",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/studio"
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid #c9c2b5",
              color: "inherit",
            }}
          >
            Open Studio
          </Link>
          <Link
            href="/legal/terms"
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid #c9c2b5",
              color: "inherit",
            }}
          >
            Terms (draft)
          </Link>
        </div>
      </div>
    </main>
  );
}
