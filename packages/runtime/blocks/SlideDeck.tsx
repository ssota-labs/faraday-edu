// <SlideDeck> — fullscreen slide view: one slide fills the viewport, hover toolbar
// for navigation, optional overview canvas with ink. The author supplies every
// slide — including the opening title card (see slide-view skill).
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  GridFourIcon,
  PencilSimpleIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";
import { useLecture } from "./lecture-context";
import { PresentationCanvas } from "./PresentationCanvas";
import { PresentationToolbar } from "./PresentationToolbar";
import { PresentationTopBar, PRESENTATION_TOP_PAD } from "./PresentationTopBar";
import { SlideInkLayer } from "./SlideInkLayer";

export interface Slide {
  id: string;
  title?: string;
  content: ReactNode;
}

type DeckMode = "present" | "overview";

export function SlideDeck(props: {
  slides: Slide[];
  /** Stable id for overview ink persistence. */
  inkKey?: string;
  /** Called when the learner reaches the last slide (e.g. reveal a quiz). */
  onLastSlide?: () => void;
}) {
  const lecture = useLecture();
  const inkKey = props.inkKey ?? lecture?.title ?? "slides";
  const slides = props.slides;

  const [mode, setMode] = useState<DeckMode>("present");
  const [inkMode, setInkMode] = useState(false);
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const atStart = index === 0;
  const atEnd = index === slides.length - 1;

  const go = (i: number) => setIndex(Math.max(0, Math.min(slides.length - 1, i)));

  useEffect(() => {
    setInkMode(false);
  }, [index, mode]);

  useEffect(() => {
    if (atEnd) props.onLastSlide?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== "present" || inkMode) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, mode, inkMode]);

  if (!slide) return null;

  if (mode === "overview") {
    return (
      <section className="flex h-full min-h-0 flex-col" aria-roledescription="slide overview">
        <PresentationTopBar>
          <Button size="sm" variant="default" onClick={() => setMode("present")}>
            <SquaresFourIcon />
            <span className="hidden sm:inline">Present</span>
          </Button>
        </PresentationTopBar>
        <PresentationCanvas
          className={cn("flex-1", PRESENTATION_TOP_PAD)}
          inkKey={inkKey}
          cardLayout="landscape"
          items={slides.map((s) => ({ id: s.id, title: s.title, content: s.content }))}
          activeId={slide.id}
          onSelectItem={(id) => {
            const i = slides.findIndex((s) => s.id === id);
            if (i >= 0) {
              setIndex(i);
              setMode("present");
            }
          }}
        />
      </section>
    );
  }

  return (
    <section className="relative h-full min-h-0" aria-roledescription="slide deck">
      <PresentationTopBar>
        <Button size="sm" variant="outline" onClick={() => setMode("overview")}>
          <GridFourIcon />
          <span className="hidden sm:inline">Overview</span>
        </Button>
      </PresentationTopBar>

      <div className={cn("relative h-full min-h-0 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 sm:py-10", PRESENTATION_TOP_PAD)}
        key={slide.id}
        role="group"
        aria-label={`Slide ${index + 1} of ${slides.length}${slide.title ? `: ${slide.title}` : ""}`}
      >
        {slide.content}
        <SlideInkLayer
          inkKey={`slide:${inkKey}:${slide.id}`}
          active={inkMode}
          onDone={() => setInkMode(false)}
        />
      </div>

      {!inkMode ? (
        <PresentationToolbar>
          <Button size="sm" variant="outline" disabled={atStart} onClick={() => go(index - 1)}>
            <CaretLeftIcon />
          </Button>
          <div className="flex items-center gap-1.5 px-1">
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
            <span className="ml-1 text-xs tabular-nums text-muted-foreground">
              {index + 1}/{slides.length}
            </span>
          </div>
          <Button size="sm" variant="outline" disabled={atEnd} onClick={() => go(index + 1)}>
            <CaretRightIcon />
          </Button>
          <Button
            size="sm"
            variant={inkMode ? "default" : "outline"}
            aria-label="Annotate slide"
            aria-pressed={inkMode}
            onClick={() => setInkMode(true)}
          >
            <PencilSimpleIcon />
          </Button>
        </PresentationToolbar>
      ) : null}
    </section>
  );
}
