"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  BookOpen,
  Cube,
  Flask,
  MagnifyingGlass,
  ShieldCheck,
  SignIn,
  SquaresFour,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

const primary = [
  { href: "/", label: "Explore", icon: SquaresFour },
  { href: "/packs", label: "Packs", icon: Cube },
  { href: "/blocks", label: "Blocks", icon: Flask },
  { href: "/examples", label: "Examples", icon: BookOpen },
];

const resources = [
  { href: "/quality", label: "Quality", icon: ShieldCheck },
  { href: "/compatibility", label: "Compatibility", icon: ArrowSquareOut },
];

export function CatalogShell({
  children,
  packCount,
  blockCount,
}: {
  children: ReactNode;
  packCount: number;
  blockCount: number;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-background text-foreground md:grid md:grid-cols-[224px_1fr]">
      <aside className="border-b border-border bg-card md:sticky md:top-0 md:h-svh md:border-r md:border-b-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-border px-5">
            <span className="grid size-7 place-items-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
              F
            </span>
            <span className="font-mono text-sm font-semibold tracking-wide">Faraday</span>
            <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
              catalog
            </span>
          </div>

          <div className="p-3">
            <label className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              <MagnifyingGlass className="size-4" />
              <input
                aria-label="Search catalog"
                placeholder="Search the catalog"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  const query = event.currentTarget.value.trim();
                  window.location.href = query
                    ? `/blocks?q=${encodeURIComponent(query)}`
                    : "/blocks";
                }}
              />
              <kbd className="font-mono text-[10px]">↵</kbd>
            </label>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <NavGroup title="Explore" items={primary} pathname={pathname} />
            <NavGroup title="Resources" items={resources} pathname={pathname} />
            <div className="mt-6 border-t border-border pt-5">
              <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Registry
              </p>
              <div className="mt-3 grid gap-2 px-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Blocks</span>
                  <span className="font-mono">{blockCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Packs</span>
                  <span className="font-mono">{packCount}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-border p-3">
            <Link
              href="/login"
              className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              <SignIn className="size-4" />
              Sign in
            </Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: typeof primary;
  pathname: string;
}) {
  return (
    <div className="mt-4">
      <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 grid gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-2 py-2 text-xs transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
