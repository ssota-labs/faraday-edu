// Vendored from mirror-dimension (components/ui/resizable.tsx) — the canonical
// resizable panel primitive. react-resizable-panels + shadcn styling. Locked.
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/faraday/lib/utils";

function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        // Transparent by default; the bar reveals on hover/drag.
        "group/rz relative flex w-px items-center justify-center bg-border/60 ring-offset-background transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 hover:bg-primary/60 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden data-[resize-handle-state=drag]:bg-primary aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-8 w-1.5 shrink-0 items-center justify-center rounded-full bg-border opacity-0 transition-opacity duration-150 group-hover/rz:opacity-100 group-data-[resize-handle-state=drag]/rz:opacity-100" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
