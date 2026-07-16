import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy } from "@phosphor-icons/react/dist/ssr";
import { BlockPreview } from "@/components/block-preview";
import { blockBySlug, catalog } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.blocks.map((block) => ({ name: block.slug }));
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const block = blockBySlug(name);
  if (!block) notFound();

  const usage = `import { ${block.name} } from "${block.importPath}";`;
  return (
    <main className="px-5 py-8 md:px-7">
      <Link href="/blocks" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All blocks
      </Link>
      <header className="mt-7 border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{block.group}</p>
        <h1 className="mt-2 font-mono text-3xl font-semibold">{block.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{block.summary}</p>
      </header>

      <div className="grid gap-8 py-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Live preview
          </p>
          <div className="min-h-80 border border-border bg-background p-4">
            <BlockPreview name={block.name} />
          </div>
        </section>
        <aside className="space-y-5">
          <section>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Import
            </p>
            <pre className="overflow-x-auto border border-border bg-card p-4 font-mono text-xs leading-5">
              {usage}
            </pre>
          </section>
          <section className="border border-border bg-card p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Copy className="size-4" />
              Registry metadata
            </div>
            <dl className="mt-4 grid gap-3 text-muted-foreground">
              <div>
                <dt className="font-mono text-[10px] uppercase">Package</dt>
                <dd className="mt-1">{block.importPath}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase">Source</dt>
                <dd className="mt-1 break-all">{block.sourcePath ?? "Generated"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
