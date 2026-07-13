// <SlideDeck> — fullscreen slide view: one slide fills the viewport, hover toolbar
// for navigation, optional overview canvas with ink. Title/lead from <Lecture>
// become the opening slide — not fixed chrome above the deck.
//
//   <SlideDeck slides={[
//     { id: "hook", title: "Hook", content: <HookSlide /> },
//   ]} />
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  GridFourIcon,
  MapTrifoldIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";
import { useLecture } from "./lecture-context";
import { PresentationCanvas } from "./PresentationCanvas";
import { PresentationToolbar } from "./PresentationToolbar";
import { useCourseNav } from "../world/node-context";

export interface Slide {
  id: string;
  title?: string;
  content: ReactNode;
}

type DeckMode = "present" | "overview";

function ViewSwitcher() {
  const lecture = useLecture();
  if (!lecture || lecture.views.length < 2) return null;
  return (
    <>
      {lecture.views.map((v) => (
        <Button
          key={v.id}
          size="sm"
          variant={v.id === lecture.viewId ? "default" : "outline"}
          onClick={() => lecture.setViewId(v.id)}
        >
          {v.label}
        </Button>
      ))}
    </>
  );
}

export function SlideDeck(props: {
  slides: Slide[];
  /** Stable id for overview ink persistence. */
  inkKey?: string;
  /** Called when the learner reaches the last slide (e.g. reveal a quiz). */
  onLastSlide?: () => void;
}) {
  const lecture = useLecture();
  const course = useCourseNav();
  const inkKey = props.inkKey ?? lecture?.title ?? "slides";

  const slides = useMemo(() => {
    if (!lecture?.title) return props.slides;
    const opener: Slide = {
      id: "__lecture-title__",
      title: lecture.title,
      content: (
        <div className="flex h-full flex-col justify-center gap-4 px-6 sm:px-12">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{lecture.title}</h1>
          {lecture.lead ? (
            <p className="max-w-[52ch] text-lg text-muted-foreground text-pretty sm:text-xl">{lecture.lead}</p>
          ) : null}
        </div>
      ),
    };
    return [opener, ...props.slides];
  }, [props.slides, lecture?.title, lecture?.lead]);

  const [mode, setMode] = useState<DeckMode>("present");
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
      if (mode !== "present") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, mode]);

  if (!slide) return null;

  if (mode === "overview") {
    return (
      <section className="flex h-full min-h-0 flex-col" aria-roledescription="slide overview">
        <PresentationCanvas
          className="flex-1"
          inkKey={inkKey}
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
        <PresentationToolbar>
          {course?.exit ? (
            <Button size="sm" variant="outline" onClick={course.exit}>
              <MapTrifoldIcon /> Map
            </Button>
          ) : null}
          <Button size="sm" variant="default" onClick={() => setMode("present")}>
            <SquaresFourIcon /> Present
          </Button>
          <ViewSwitcher />
        </PresentationToolbar>
      </section>
    );
  }

  return (
    <section className="relative h-full min-h-0" aria-roledescription="slide deck">
      <div
        key={slide.id}
        className="h-full min-h-0 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10"
        role="group"
        aria-label={`Slide ${index + 1} of ${slides.length}${slide.title ? `: ${slide.title}` : ""}`}
      >
        {slide.content}
      </div>

      <PresentationToolbar>
        {course?.exit ? (
          <Button size="sm" variant="outline" onClick={course.exit}>
            <MapTrifoldIcon /> Map
          </Button>
        ) : null}
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
        <Button size="sm" variant="outline" onClick={() => setMode("overview")}>
          <GridFourIcon /> Overview
        </Button>
        <ViewSwitcher />
      </PresentationToolbar>
    </section>
  );
}
