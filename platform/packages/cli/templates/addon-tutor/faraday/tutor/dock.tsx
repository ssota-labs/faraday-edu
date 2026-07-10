// <TutorDock> — hoists the grounded tutor to a shell-level side panel that sits
// BESIDE the lesson, the same dockable model as mirror-dimension's studio. Wrap a
// whole lesson (any layout) in it; the tutor never lives inline in the content flow.
//
//   <TutorDock context={LESSON_TEXT} greeting="…">
//     <Lesson …>…</Lesson>
//   </TutorDock>
//
// Desktop: a full-viewport two-pane split — content | resize-handle | tutor. The
// tutor pane is collapsible and starts CLOSED; a right-edge tab opens it, a drag
// handle resizes it, and the chat stays mounted across open/close so the
// conversation survives. Narrow screens: content flows normally and the tutor
// opens as a right-side drawer from a floating button. Vendored + locked.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChatCircleIcon } from "@phosphor-icons/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";
import { usePanelRef } from "react-resizable-panels";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";
import { Tutor, type TutorProps } from "./tutor";

export interface TutorDockProps extends Omit<TutorProps, "className"> {
  children: ReactNode;
  /** Open the dock by default (desktop). Defaults to closed. */
  defaultOpen?: boolean;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

export function TutorDock({ children, defaultOpen = false, title = "Tutor", ...tutorProps }: TutorDockProps) {
  const desktop = useIsDesktop();
  return desktop ? (
    <DesktopDock defaultOpen={defaultOpen} title={title} {...tutorProps}>
      {children}
    </DesktopDock>
  ) : (
    <MobileDock title={title} {...tutorProps}>
      {children}
    </MobileDock>
  );
}

function DesktopDock({ children, defaultOpen, title, ...tutorProps }: TutorDockProps) {
  const panelRef = usePanelRef();
  const [open, setOpen] = useState(defaultOpen);

  // Start collapsed unless defaultOpen — the panel mounts, then we collapse it so
  // the chat is already alive behind the tab.
  useEffect(() => {
    if (!defaultOpen) panelRef.current?.collapse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clicks are authoritative for `open` (programmatic collapse/expand doesn't
  // always emit onResize); onResize still syncs the drag-to-collapse case.
  const openDock = () => {
    panelRef.current?.expand();
    setOpen(true);
  };
  const closeDock = () => {
    panelRef.current?.collapse();
    setOpen(false);
  };
  const syncOpen = () => setOpen(!panelRef.current?.isCollapsed());

  return (
    <div className="style-faraday fixed inset-0 z-40 bg-background text-foreground">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel minSize="40%" className="min-w-0">
          <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-4xl px-5 pb-24 pt-6">{children}</div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className={cn(!open && "pointer-events-none opacity-0")} />

        <ResizablePanel
          panelRef={panelRef}
          collapsible
          collapsedSize="0%"
          defaultSize="32%"
          minSize="24%"
          maxSize="48%"
          onResize={syncOpen}
          className="min-w-0"
        >
          <Tutor
            {...tutorProps}
            title={title}
            onClose={closeDock}
            className="h-full rounded-none border-0 border-l shadow-none"
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Right-edge tab to open the tutor when it's collapsed. */}
      {!open && (
        <button
          type="button"
          onClick={openDock}
          className="group fixed top-1/2 right-0 z-50 flex -translate-y-1/2 items-center gap-2 rounded-l-xl border border-r-0 bg-card py-3 pr-2 pl-3 text-sm font-medium shadow-md transition-transform hover:pr-3"
          aria-label="Open tutor"
        >
          <ChatCircleIcon weight="fill" className="text-primary" />
          <span className="[writing-mode:vertical-rl] rotate-180 tracking-wide">Tutor</span>
        </button>
      )}
    </div>
  );
}

function MobileDock({ children, title, ...tutorProps }: TutorDockProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {children}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 gap-2 rounded-full shadow-lg"
        aria-label="Open tutor"
      >
        <ChatCircleIcon weight="fill" />
        {title}
      </Button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      {/* Right drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(24rem,90vw)] flex-col shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label={title}
      >
        <Tutor
          {...tutorProps}
          title={title}
          onClose={() => setOpen(false)}
          className="h-full rounded-none border-0 border-l shadow-none"
        />
      </div>
    </>
  );
}
