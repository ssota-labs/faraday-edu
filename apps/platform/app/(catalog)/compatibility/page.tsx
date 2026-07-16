const rows = [
  ["Node", "22+", "CLI and generated lesson toolchain"],
  ["pnpm", "11.5.2", "Pinned by the workspace packageManager field"],
  ["React", "19.2", "Peer dependency for kit and UI"],
  ["@faraday-academy/ui", "0.2.x", "Published design primitives"],
  ["@faraday-academy/kit", "0.2.x", "Blocks and runtime"],
];

export default function CompatibilityPage() {
  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Compatibility</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          A small, explicit substrate.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Generated projects pin their runtime. Packs declare additions instead of silently changing the host.
        </p>
      </header>
      <div className="mt-8 overflow-hidden border border-border">
        {rows.map(([name, version, role], index) => (
          <div
            key={name}
            className={`grid gap-2 bg-card px-5 py-4 md:grid-cols-[180px_140px_1fr] ${
              index ? "border-t border-border" : ""
            }`}
          >
            <span className="font-mono text-xs font-semibold">{name}</span>
            <span className="font-mono text-xs text-primary">{version}</span>
            <span className="text-xs text-muted-foreground">{role}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
        {[
          ["check", "Project structure and exact runtime pins"],
          ["doctor", "Local environment and installed dependency health"],
          ["upgrade", "Explicit runtime migration"],
        ].map(([command, description]) => (
          <section key={command} className="bg-card p-5">
            <code className="font-mono text-sm">faraday {command}</code>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
