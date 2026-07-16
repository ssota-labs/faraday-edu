import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { BlockPreview } from "@/components/block-preview";
import { catalog } from "@/lib/catalog";

export default function HomePage() {
  const featuredNames = [
    "ParamSlider",
    "Chart",
    "Quiz",
    "Compare",
    "TeX",
    "Callout",
    "Stat",
    "Workbench",
    "SketchPad",
  ];
  const featured = featuredNames
    .map((name) => catalog.blocks.find((block) => block.name === name))
    .filter((block) => block !== undefined);

  return (
    <main className="px-5 py-5 md:px-7">
      <div className="border border-border bg-muted/50 px-4 py-2 font-mono text-[11px] text-muted-foreground">
        Faraday Catalog is being rebuilt around explicit packs and portable lesson blocks.
      </div>

      <header className="flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            <Sparkle className="size-4" />
            Build less infrastructure
          </div>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl leading-tight tracking-[-0.035em] md:text-5xl">
            Find the right teaching primitive.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Browse live blocks, install focused packs, and give your coding agent
            a reliable surface for interactive courseware.
          </p>
        </div>
        <Link
          href="/blocks"
          className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-muted"
        >
          Browse all blocks
          <ArrowRight className="size-4" />
        </Link>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Featured</h2>
          <span className="font-mono text-[10px] text-muted-foreground">{featured.length} components</span>
        </div>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((block) => (
            <Link
              key={block.name}
              href={`/blocks/${block.slug}`}
              className="group bg-card"
            >
              <div className="min-h-48 bg-background">
                <BlockPreview name={block.name} compact />
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-semibold">{block.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{block.group}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
