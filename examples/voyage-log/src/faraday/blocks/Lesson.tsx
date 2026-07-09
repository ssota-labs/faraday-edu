// <Lesson> — titled header + vertical flow the sections sit in.
import type { ReactNode } from "react";
import { Badge } from "@/faraday/ui/badge";

export function Lesson(props: { title: string; lead?: ReactNode; topic?: string; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        {props.topic ? (
          <Badge variant="secondary" className="w-fit">
            {props.topic}
          </Badge>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{props.title}</h1>
        {props.lead ? <p className="max-w-[60ch] text-lg text-muted-foreground text-pretty">{props.lead}</p> : null}
      </header>
      <div className="flex flex-col gap-8">{props.children}</div>
    </article>
  );
}
