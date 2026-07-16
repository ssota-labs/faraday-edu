import { BlockGrid } from "@/components/block-grid";
import { catalog } from "@/lib/catalog";

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Library</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          Lesson blocks
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Small, composable teaching primitives. Preview the real component, inspect
          its role, then import it from the pinned lesson kit.
        </p>
      </header>
      <div className="mt-7">
        <BlockGrid blocks={catalog.blocks} initialQuery={q} />
      </div>
    </main>
  );
}
