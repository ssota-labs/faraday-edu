// <Stat> — a compact metric read-out (built on Card + Badge).
import type { ReactNode } from "react";
import { Card, CardContent } from "@/faraday/ui/card";
import { Badge } from "@/faraday/ui/badge";

export function Stat(props: {
  label: string;
  value: ReactNode;
  delta?: { text: string; tone?: "default" | "secondary" | "destructive" };
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-sm text-muted-foreground">{props.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tabular-nums">{props.value}</span>
          {props.delta ? <Badge variant={props.delta.tone ?? "secondary"}>{props.delta.text}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
