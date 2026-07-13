// <TextbookView> — textbook presentation: title + lead ARE the reading layout in
// normal mode (not a card inside a lecture header). Free mode: pan/zoom canvas
// with page thumbnails and ink drawn on the workspace.
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { cn } from "@faraday-academy/runtime/lib/utils";
import {
  useLecture,
  PresentationCanvas,
  PresentationToolbar,
} from "@faraday-academy/runtime/blocks";
import { useCourseNav } from "@faraday-academy/runtime/world";

export interface TextbookPage {
  id: string;
  title?: string;
  content: ReactNode;
}

type ViewMode = "normal" | "free";

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

export function TextbookView(props: {
  pages: TextbookPage[];
  /** Stable id for overview ink persistence. */
  notesKey: string;
  title?: string;
  lead?: ReactNode;
  className?: string;
}) {
  const lecture = useLecture();
  const course = useCourseNav();
  const title = props.title ?? lecture?.title ?? "";
  const lead = props.lead ?? lecture?.lead;
  const [mode, setMode] = useState<ViewMode>("normal");
  const [focusId, setFocusId] = useState(props.pages[0]?.id ?? "");

  const canvasItems = useMemo(
    () => props.pages.map((p) => ({ id: p.id, title: p.title, content: p.content })),
    [props.pages],
  );

  if (mode === "free") {
    return (
      <section
        className={cn("flex h-full min-h-0 flex-col", props.className)}
        aria-roledescription="textbook overview"
      >
        <PresentationCanvas
          className="flex-1"
          inkKey={props.notesKey}
          items={canvasItems}
          activeId={focusId}
          onSelectItem={(id) => {
            setFocusId(id);
            setMode("normal");
            requestAnimationFrame(() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        />
        <PresentationToolbar>
          {course?.exit ? (
            <Button size="sm" variant="outline" onClick={course.exit}>
              Map
            </Button>
          ) : null}
          <Button size="sm" variant="default" onClick={() => setMode("normal")}>
            Read
          </Button>
          <ViewSwitcher />
        </PresentationToolbar>
      </section>
    );
  }

  return (
    <section className={cn("relative h-full min-h-0", props.className)} aria-roledescription="textbook view">
      <div className="h-full overflow-y-auto">
        <article className="mx-auto flex w-full max-w-[48rem] flex-col gap-10 px-6 py-10 sm:px-10 sm:py-14">
          {title ? (
            <header className="flex flex-col gap-3 border-b border-border/60 pb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
              {lead ? <p className="max-w-[60ch] text-lg text-muted-foreground text-pretty">{lead}</p> : null}
            </header>
          ) : null}
          {props.pages.map((page) => (
            <section key={page.id} id={page.id} className="flex flex-col gap-4 scroll-mt-8">
              {page.title ? <h2 className="text-xl font-semibold tracking-tight">{page.title}</h2> : null}
              <div className="text-pretty">{page.content}</div>
            </section>
          ))}
        </article>
      </div>

      <PresentationToolbar>
        {course?.exit ? (
          <Button size="sm" variant="outline" onClick={course.exit}>
            Map
          </Button>
        ) : null}
        <Button size="sm" variant="default" onClick={() => setMode("normal")}>
          Read
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMode("free")}>
          Overview
        </Button>
        <ViewSwitcher />
      </PresentationToolbar>
    </section>
  );
}
