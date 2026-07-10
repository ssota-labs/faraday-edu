// <ControlGroup> — a collapsible, labeled section inside a control panel dock.
// Group related controls semantically (like the sections in a design-tool panel):
// header shows the label, an optional per-group reset, and a collapse chevron.
import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowCounterClockwiseIcon, CaretDownIcon } from "@phosphor-icons/react";
import { Collapsible, CollapsibleContent } from "@/faraday/ui/collapsible";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";

export function ControlGroup(props: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onReset?: () => void;
}) {
  const [open, setOpen] = useState(props.defaultOpen ?? true);
  const toggle = () => setOpen((o) => !o);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border/60 last:border-b-0">
      <div className="flex items-center gap-0.5 py-1">
        <button
          type="button"
          onClick={toggle}
          className="flex-1 py-1.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase outline-none transition-colors hover:text-foreground"
        >
          {props.label}
        </button>
        {props.onReset ? (
          <Button variant="ghost" size="icon-xs" aria-label={`Reset ${props.label}`} onClick={props.onReset}>
            <ArrowCounterClockwiseIcon />
          </Button>
        ) : null}
        <Button variant="ghost" size="icon-xs" aria-label={open ? "Collapse" : "Expand"} onClick={toggle}>
          <CaretDownIcon className={cn("transition-transform duration-200", open && "rotate-180")} />
        </Button>
      </div>
      <CollapsibleContent className="overflow-hidden">
        <div className="flex flex-col gap-4 pb-4">{props.children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
