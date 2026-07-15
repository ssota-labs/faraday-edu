import type { ReactNode } from "react";
import { Lesson, Callout } from "@faraday-academy/kit/blocks";

export function MethodShell(props: {
  method: string;
  discipline: string;
  topic: string;
  title: string;
  lead: string;
  phases: string[];
  families: string[];
  children: ReactNode;
}) {
  const { method, discipline, topic, title, lead, phases, families, children } = props;
  return (
    <Lesson topic={topic} title={title} lead={lead}>
      <Callout title={`Method: ${method}`}>
        <p className="text-sm">
          <strong>Discipline:</strong> {discipline}
          {" · "}
          <strong>Phases:</strong> {phases.join(" → ")}
          {" · "}
          <strong>Block families:</strong> {families.join(", ")}
        </p>
      </Callout>
      {children}
    </Lesson>
  );
}
