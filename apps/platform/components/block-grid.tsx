"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import type { BlockCatalogItem } from "@/lib/catalog";
import { BlockPreview } from "./block-preview";

export function BlockGrid({
  blocks,
  initialQuery = "",
}: {
  blocks: BlockCatalogItem[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState("All");
  const groups = ["All", ...new Set(blocks.map((block) => block.group))];
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return blocks.filter(
      (block) =>
        (group === "All" || block.group === group) &&
        (!normalized ||
          block.name.toLowerCase().includes(normalized) ||
          block.summary.toLowerCase().includes(normalized)),
    );
  }, [blocks, group, query]);

  return (
    <>
      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-w-64 items-center gap-2 border border-border bg-card px-3 py-2 text-xs">
          <MagnifyingGlass className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blocks"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {groups.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGroup(item)}
              className={`border px-3 py-1.5 font-mono text-[10px] ${
                group === item
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
        {visible.map((block) => (
          <Link key={block.name} href={`/blocks/${block.slug}`} className="group bg-card">
            <div className="min-h-44 bg-background">
              <BlockPreview name={block.name} compact />
            </div>
            <div className="flex min-h-24 items-start justify-between border-t border-border px-4 py-3">
              <div>
                <p className="font-mono text-sm font-semibold">{block.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {block.summary}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="border-x border-b border-border p-10 text-center text-sm text-muted-foreground">
          No blocks match this search.
        </p>
      ) : null}
    </>
  );
}
