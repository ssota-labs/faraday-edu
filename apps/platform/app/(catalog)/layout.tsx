import { CatalogShell } from "@/components/catalog-shell";
import { catalog } from "@/lib/catalog";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CatalogShell
      packCount={catalog.packs.length}
      blockCount={catalog.blocks.length}
    >
      {children}
    </CatalogShell>
  );
}
