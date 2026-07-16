import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { catalog, packByName } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.packs.map((pack) => ({ name: pack.name }));
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const pack = packByName(name);
  if (!pack) notFound();

  return (
    <main className="px-5 py-8 md:px-7">
      <Link href="/packs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All packs
      </Link>
      <header className="mt-7 border-b border-border pb-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{pack.category}</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-4xl tracking-[-0.03em]">
          {pack.displayName}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{pack.name}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{pack.description}</p>
      </header>
      <div className="grid gap-8 py-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-7">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Install</h2>
            <pre className="mt-3 overflow-x-auto border border-border bg-foreground p-4 font-mono text-xs text-background">
              {pack.installCommand}
            </pre>
          </div>
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Quality contract</h2>
            <div className="mt-3 whitespace-pre-wrap border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
              {pack.quality ?? "This pack has no quality contract yet."}
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="size-5 text-primary" />
              Registry details
            </div>
            <dl className="mt-5 grid gap-4 text-xs">
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">Requires</dt>
                <dd className="mt-1">{pack.requires.join(", ") || "None"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-muted-foreground">Variants</dt>
                <dd className="mt-1">{pack.variants.join(", ") || "None"}</dd>
              </div>
            </dl>
          </div>
          {pack.dependencies.length ? (
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TerminalWindow className="size-5 text-primary" />
                Dependencies
              </div>
              <ul className="mt-4 space-y-2 font-mono text-[11px] text-muted-foreground">
                {pack.dependencies.map((dependency) => (
                  <li key={dependency.packageName}>
                    {dependency.packageName}@{dependency.version}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
