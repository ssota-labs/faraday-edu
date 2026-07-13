// <SlideDeck> — slide-view normal mode: one slide at a time, prev/next, dot rail.
// Each slide fills the viewport height; only the active slide is mounted (keyed).
//
//   <SlideDeck slides={[
//     { id: "hook", title: "Hook", content: <HookSlide /> },
//     { id: "demo", title: "Demo", content: <DemoSlide /> },
//   ]} />
//
// Inside a slide, split canvas/prose when landscape helps:
// `<div className="grid h-full gap-4 lg:grid-cols-[3fr_2fr]">…</div>`.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";

export interface Slide {
  id: string;
  title?: string;
  content: ReactNode;
}

export function SlideDeck(props: {
  slides: Slide[];
  /** Slide area height. Defaults to filling the viewport below typical lesson
   *  chrome, never shrinking under 24rem. */
  height?: string;
  /** Called when the learner reaches the last slide (e.g. reveal a quiz). */
  onLastSlide?: () => void;
}) {
  const { slides } = props;
  const height = props.height ?? "max(24rem, calc(100dvh - 14rem))";
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const atStart = index === 0;
  const atEnd = index === slides.length - 1;

  const go = (i: number) => setIndex(Math.max(0, Math.min(slides.length - 1, i)));

  useEffect(() => {
    if (atEnd) props.onLastSlide?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  if (!slide) return null;

  return (
    <section className="flex flex-col gap-3" aria-roledescription="slide deck">
      <div
        key={slide.id}
        className="min-h-0 overflow-y-auto rounded-xl border bg-card p-4 sm:p-6"
        style={{ height }}
        role="group"
        aria-label={`Slide ${index + 1} of ${slides.length}${slide.title ? `: ${slide.title}` : ""}`}
      >
        {slide.content}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" disabled={atStart} onClick={() => go(index - 1)}>
          <CaretLeftIcon /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}${s.title ? `: ${s.title}` : ""}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  i === index ? "bg-primary" : i < index ? "bg-primary/40" : "bg-muted",
                )}
              />
            ))}
          </div>
          {slide.title ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">{slide.title}</span>
          ) : null}
          <span className="text-xs tabular-nums text-muted-foreground">
            {index + 1}/{slides.length}
          </span>
        </div>
        <Button size="sm" disabled={atEnd} onClick={() => go(index + 1)}>
          Next <CaretRightIcon />
        </Button>
      </div>
    </section>
  );
}
