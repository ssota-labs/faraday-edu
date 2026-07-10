// <Paged> — a tablet-style, screen-at-a-time lesson layout. Instead of the
// default book-like vertical scroll, content is split into PAGES: each page
// fills the available viewport height, one is shown at a time, and the learner
// moves with prev/next, the dot rail, or arrow keys. Use it when the audience
// wants "one idea per screen" (young learners, kiosk/tablet contexts) — see
// audience.md; layout is a per-request choice, not a hard audience rule.
//
//   <Paged pages={[
//     { id: "push",    title: "Push",    content: <PushPage /> },
//     { id: "squeeze", title: "Squeeze", content: <SqueezePage /> },
//   ]} />
//
// Only the active page is mounted (keyed), so per-page state (sliders,
// steppers) resets cleanly when the learner returns — same rule as <Course>
// chapters. Inside a page, split canvas/prose yourself when landscape helps:
// `<div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">…</div>`.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";

export interface PagedPage {
  id: string;
  title?: string;
  content: ReactNode;
}

export function Paged(props: {
  pages: PagedPage[];
  /** Page area height. Defaults to filling the viewport below typical lesson
   *  chrome, never shrinking under 24rem. */
  height?: string;
  /** Called when the learner reaches the last page (e.g. reveal a quiz). */
  onLastPage?: () => void;
}) {
  const { pages } = props;
  const height = props.height ?? "max(24rem, calc(100dvh - 14rem))";
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const atStart = index === 0;
  const atEnd = index === pages.length - 1;

  const go = (i: number) => setIndex(Math.max(0, Math.min(pages.length - 1, i)));

  useEffect(() => {
    if (atEnd) props.onLastPage?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      // don't hijack arrows from inputs/sliders/textareas
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(pages.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length]);

  if (!page) return null;

  return (
    <section className="flex flex-col gap-3" aria-roledescription="paged lesson">
      <div
        key={page.id} // remount per page → per-page state resets cleanly
        className="min-h-0 overflow-y-auto rounded-xl border bg-card p-4 sm:p-6"
        style={{ height }}
        role="group"
        aria-label={`Page ${index + 1} of ${pages.length}${page.title ? `: ${page.title}` : ""}`}
      >
        {page.content}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" disabled={atStart} onClick={() => go(index - 1)}>
          <CaretLeftIcon /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Go to page ${i + 1}${p.title ? `: ${p.title}` : ""}`}
                aria-current={i === index ? "page" : undefined}
                onClick={() => go(i)}
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  i === index ? "bg-primary" : i < index ? "bg-primary/40" : "bg-muted",
                )}
              />
            ))}
          </div>
          {page.title ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">{page.title}</span>
          ) : null}
          <span className="text-xs tabular-nums text-muted-foreground">
            {index + 1}/{pages.length}
          </span>
        </div>
        <Button size="sm" disabled={atEnd} onClick={() => go(index + 1)}>
          Next <CaretRightIcon />
        </Button>
      </div>
    </section>
  );
}
