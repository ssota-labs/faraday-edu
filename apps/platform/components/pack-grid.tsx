"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass, Package } from "@phosphor-icons/react";
import type { PackCatalogItem } from "@/lib/catalog";

export function PackGrid({ packs }: { packs: PackCatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(packs.map((pack) => pack.category))];
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return packs.filter(
      (pack) =>
        (category === "All" || pack.category === category) &&
        (!normalized ||
          pack.name.includes(normalized) ||
          pack.displayName.toLowerCase().includes(normalized) ||
          pack.description.toLowerCase().includes(normalized)),
    );
  }, [category, packs, query]);

  return (
    <>
      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-w-64 items-center gap-2 border border-border bg-card px-3 py-2 text-xs">
          <MagnifyingGlass className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packs"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`border px-3 py-1.5 font-mono text-[10px] ${
                category === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((pack, index) => (
          <Link key={pack.name} href={`/packs/${pack.name}`} className="group bg-card">
            <div className="relative grid min-h-44 place-items-center overflow-hidden bg-background">
              <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className={`relative grid size-24 place-items-center border border-border ${index % 2 ? "rotate-3" : "-rotate-3"} bg-card`}>
                <Package className="size-9 text-primary" />
              </div>
            </div>
            <div className="min-h-32 border-t border-border px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-semibold">{pack.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary">{pack.category}</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{pack.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
