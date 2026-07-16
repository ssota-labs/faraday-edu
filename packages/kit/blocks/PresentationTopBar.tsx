// Fixed top bar — presentation view tabs (Slides / Textbook) + mode actions.
import type { ReactNode } from "react";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { cn } from "@faraday-academy/ui/lib/utils";
import { useLecture } from "./lecture-context";

export function PresentationTopBar(props: {
  children?: ReactNode;
  className?: string;
}) {
  const lecture = useLecture();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between gap-2 border-b border-border/60 bg-background/92 px-3 backdrop-blur-md sm:px-4",
        props.className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        {lecture && lecture.views.length > 1 ? (
          <nav className="flex items-center gap-1" role="tablist" aria-label="Presentation views">
            {lecture.views.map((v) => (
              <Button
                key={v.id}
                role="tab"
                size="sm"
                aria-selected={v.id === lecture.viewId}
                variant={v.id === lecture.viewId ? "default" : "outline"}
                onClick={() => lecture.setViewId(v.id)}
              >
                {v.label}
              </Button>
            ))}
          </nav>
        ) : null}
      </div>
      {props.children ? (
        <div className="flex shrink-0 items-center gap-1">{props.children}</div>
      ) : null}
    </header>
  );
}

/** Offset content below the fixed top bar. */
export const PRESENTATION_TOP_PAD = "pt-12";
