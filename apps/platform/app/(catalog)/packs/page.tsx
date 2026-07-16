import { PackGrid } from "@/components/pack-grid";
import { catalog } from "@/lib/catalog";

export default function PacksPage() {
  return (
    <main className="px-5 py-8 md:px-7">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Registry</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          Capability packs
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Packs install focused runtime code and project-local teaching knowledge.
          Nothing is installed by default; choose only what the lesson needs.
        </p>
      </header>
      <div className="mt-7">
        <PackGrid packs={catalog.packs} />
      </div>
    </main>
  );
}
