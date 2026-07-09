// <Callout> — a highlighted note (built on Alert).
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/faraday/ui/alert";

export function Callout(props: { title?: string; variant?: "default" | "destructive"; children: ReactNode }) {
  return (
    <Alert variant={props.variant ?? "default"}>
      {props.title ? <AlertTitle>{props.title}</AlertTitle> : null}
      <AlertDescription>{props.children}</AlertDescription>
    </Alert>
  );
}
