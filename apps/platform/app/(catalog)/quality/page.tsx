import { CheckCircle, Eye, FileCode, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const gates = [
  {
    title: "Contract",
    description: "The pack manifest, copied files, dependencies, and project provenance agree.",
    command: "faraday pack validate <name>",
    icon: FileCode,
  },
  {
    title: "Types",
    description: "Every official example uses the current block API and passes strict TypeScript.",
    command: "pnpm typecheck",
    icon: ShieldCheck,
  },
  {
    title: "Build",
    description: "The lesson produces the same portable artifact used by Sites and self-hosts.",
    command: "pnpm build",
    icon: CheckCircle,
  },
  {
    title: "Visual",
    description: "Controls, responsive layout, and console behavior are reviewed in a real browser.",
    command: "pnpm dev",
    icon: Eye,
  },
];

export default function QualityPage() {
  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Trust</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          Quality is part of the registry.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          A card is not a promise. Faraday exposes the checks behind each block and pack so creators can distinguish an idea from a verified capability.
        </p>
      </header>
      <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        {gates.map(({ title, description, command, icon: Icon }, index) => (
          <section key={title} className="bg-card p-6">
            <div className="flex items-start justify-between">
              <Icon className="size-6 text-primary" />
              <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="mt-8 font-mono text-sm font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
            <code className="mt-5 block border border-border bg-background p-3 font-mono text-[10px]">{command}</code>
          </section>
        ))}
      </div>
    </main>
  );
}
