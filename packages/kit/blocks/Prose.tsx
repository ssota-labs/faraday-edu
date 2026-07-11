// <Prose> — a readable text section, optionally titled.
import type { ReactNode } from "react";

export function Prose(props: { heading?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {props.heading ? (
        <h2 className="text-xl font-semibold tracking-tight">{props.heading}</h2>
      ) : null}
      <div className="flex max-w-[68ch] flex-col gap-3 leading-relaxed text-foreground/90 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_strong]:font-semibold [&_strong]:text-foreground">
        {props.children}
      </div>
    </section>
  );
}
