import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { catalog } from "@/lib/catalog";

export default function ExamplesPage() {
  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Reference builds</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          Interactive examples
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Full lesson projects that exercise the same packages and validation path as generated courseware.
        </p>
      </header>
      <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        {catalog.examples.map((example, index) => (
          <article key={example.slug} className="bg-card">
            <div className="relative grid min-h-52 place-items-center overflow-hidden bg-background">
              <div className="absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
              <span className={`relative font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl ${index % 2 ? "rotate-2" : "-rotate-2"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="border-t border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-sm font-semibold">{example.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{example.description}</p>
                </div>
                <Link
                  href={`https://github.com/ssota-labs/faraday-academy/tree/main/examples/${example.slug}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowSquareOut className="size-5" />
                </Link>
              </div>
              {example.packs.length ? (
                <div className="mt-4 flex flex-wrap gap-1">
                  {example.packs.map((pack) => (
                    <span key={pack} className="border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground">
                      {pack}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
