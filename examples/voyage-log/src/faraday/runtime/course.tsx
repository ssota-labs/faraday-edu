// <Course> — bundle several lessons into a navigable textbook. Give it ordered
// chapters; it renders a chapter nav, the active chapter, prev/next, and syncs to
// the URL hash (#slug) for deep links. Render it as your lesson's default export
// (put the chapter components in src/lesson/chapters/).
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";

export interface Chapter {
  slug: string;
  title: string;
  element: ReactNode;
}

function resolveSlug(chapters: Chapter[]): string {
  const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
  return chapters.some((c) => c.slug === hash) ? hash : (chapters[0]?.slug ?? "");
}

export function Course(props: { title: string; chapters: Chapter[] }) {
  const { title, chapters } = props;
  const [slug, setSlug] = useState(() => resolveSlug(chapters));

  useEffect(() => {
    const onHash = () => setSlug(resolveSlug(chapters));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [chapters]);

  const index = Math.max(0, chapters.findIndex((c) => c.slug === slug));
  const active = chapters[index];

  const go = (next: string) => {
    window.location.hash = next;
    setSlug(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 border-b pb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {index + 1} / {chapters.length}
          </span>
        </div>
        <nav className="flex flex-wrap gap-1.5">
          {chapters.map((c, i) => (
            <Button
              key={c.slug}
              variant={c.slug === slug ? "default" : "ghost"}
              size="xs"
              onClick={() => go(c.slug)}
            >
              <span className="mr-1 tabular-nums opacity-60">{i + 1}</span>
              {c.title}
            </Button>
          ))}
        </nav>
      </header>

      <div key={active?.slug}>{active?.element}</div>

      <footer className="flex items-center justify-between border-t pt-5">
        <Button variant="outline" size="sm" disabled={index === 0} onClick={() => go(chapters[index - 1]?.slug)}>
          <CaretLeftIcon /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={index === chapters.length - 1}
          onClick={() => go(chapters[index + 1]?.slug)}
        >
          Next <CaretRightIcon />
        </Button>
      </footer>
    </div>
  );
}
