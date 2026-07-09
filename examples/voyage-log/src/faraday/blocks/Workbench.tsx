// <Workbench> — mirror-dimension's workbench layout: a live canvas (center) with a
// floating control panel (right). Put the visualization in `children` and the
// controls in `controls` — ideally as <ControlGroup> sections so the panel reads
// as labeled, collapsible groups. The panel floats (elevated card), sticks while
// scrolling, and stacks under the canvas on narrow screens. Drop the whole block
// into the middle of a lesson.
import type { ReactNode } from "react";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/faraday/ui/card";
import { Button } from "@/faraday/ui/button";

export function Workbench(props: {
  children: ReactNode;
  controls: ReactNode;
  title?: string;
  panelTitle?: string;
  onReset?: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <Card className="min-w-0 overflow-hidden py-0">
        {props.title ? (
          <div className="flex items-center border-b px-4 py-2.5 text-sm text-muted-foreground">
            {props.title}
          </div>
        ) : null}
        <CardContent className="min-w-0 p-4 [&_canvas]:w-full [&_svg]:h-auto [&_svg]:w-full">
          {props.children}
        </CardContent>
      </Card>

      {/* Floating control panel */}
      <Card className="h-fit gap-0 py-0 shadow-xl ring-1 ring-black/5 lg:sticky lg:top-4 dark:ring-white/5">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-medium">{props.panelTitle ?? "Controls"}</span>
          {props.onReset ? (
            <Button variant="ghost" size="icon-xs" aria-label="Reset all" onClick={props.onReset}>
              <ArrowCounterClockwiseIcon />
            </Button>
          ) : null}
        </div>
        <CardContent className="flex flex-col px-4 py-0">{props.controls}</CardContent>
      </Card>
    </div>
  );
}
