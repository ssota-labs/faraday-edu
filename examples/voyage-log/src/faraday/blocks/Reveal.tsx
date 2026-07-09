// <Reveal> — a collapsible hint / spoiler (built on Accordion).
import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/faraday/ui/accordion";

export function Reveal(props: { label?: string; children: ReactNode }) {
  return (
    <Accordion className="rounded-xl border px-3">
      <AccordionItem value="reveal">
        <AccordionTrigger className="py-3 text-sm font-medium">
          {props.label ?? "Reveal hint"}
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground">{props.children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
