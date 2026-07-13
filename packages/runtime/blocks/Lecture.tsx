// <Lecture> — lecture shell: switch between presentation views (slide, textbook, …).
// Each view component owns its own normal/free mode.
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";

export interface LectureView {
  id: string;
  label: string;
  content: ReactNode;
}

export function Lecture(props: {
  title: string;
  lead?: ReactNode;
  views: LectureView[];
  defaultView?: string;
}) {
  const { title, views } = props;
  const [viewId, setViewId] = useState(props.defaultView ?? views[0]?.id ?? "");
  const active = views.find((v) => v.id === viewId) ?? views[0];

  if (!active) return null;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 border-b pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {props.lead ? <p className="max-w-[60ch] text-lg text-muted-foreground text-pretty">{props.lead}</p> : null}
        {views.length > 1 ? (
          <nav className="flex flex-wrap gap-1.5 pt-1" role="tablist" aria-label="Presentation views">
            {views.map((v) => (
              <Button
                key={v.id}
                role="tab"
                aria-selected={v.id === viewId}
                variant={v.id === viewId ? "default" : "outline"}
                size="sm"
                onClick={() => setViewId(v.id)}
              >
                {v.label}
              </Button>
            ))}
          </nav>
        ) : null}
      </header>
      <div key={active.id} role="tabpanel" className={cn("min-h-0")}>
        {active.content}
      </div>
    </article>
  );
}
