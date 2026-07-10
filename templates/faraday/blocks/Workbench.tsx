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
  /** The floating side panel. OPTIONAL — a canvas whose interactions all live
   *  on the canvas itself (drag handles, overlay buttons) needs no panel; omit
   *  it and the canvas takes the full width. Reserve the panel for secondary
   *  or numerous parameters. */
  controls?: ReactNode;
  title?: string;
  panelTitle?: string;
  /** Overlaid on the canvas (top-right): live <Readout> chips AND on-canvas
   *  actions (Play/Pause, mode toggles, presets as <Button size="sm">). This
   *  is where measured numbers and primary actions belong — don't stack <Stat>
   *  cards below, don't exile Play to the side panel. */
  hud?: ReactNode;
  onReset?: () => void;
}) {
  const hasPanel = props.controls != null;
  return (
    <div className={hasPanel ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]" : "grid gap-4"}>
      <Card data-flush className="min-w-0 overflow-hidden">
        {props.title || (!hasPanel && props.onReset) ? (
          <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm text-muted-foreground">
            <span>{props.title}</span>
            {!hasPanel && props.onReset ? (
              <Button variant="ghost" size="icon-xs" aria-label="Reset" onClick={props.onReset}>
                <ArrowCounterClockwiseIcon />
              </Button>
            ) : null}
          </div>
        ) : null}
        <CardContent className="relative min-w-0 p-4 [&_canvas]:w-full [&_svg]:h-auto [&_svg]:w-full">
          {props.hud ? (
            <div className="pointer-events-none absolute top-6 right-6 z-10 flex max-w-[70%] flex-wrap justify-end gap-2 [&>*]:pointer-events-auto">
              {props.hud}
            </div>
          ) : null}
          {props.children}
        </CardContent>
      </Card>

      {/* Floating control panel — only when secondary parameters need one */}
      {hasPanel ? (
        <Card data-flush className="h-fit shadow-xl ring-1 ring-black/5 lg:sticky lg:top-4 dark:ring-white/5">
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
      ) : null}
    </div>
  );
}
