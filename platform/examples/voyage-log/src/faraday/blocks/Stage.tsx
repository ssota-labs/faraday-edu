// <Stage> — a Card-framed host for a visualization (SVG, canvas, DOM) + caption.
import type { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/faraday/ui/card";

export function Stage(props: { children: ReactNode; caption?: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex justify-center p-4 [&_svg]:h-auto [&_svg]:w-full">
        {props.children}
      </CardContent>
      {props.caption ? (
        <CardFooter className="justify-center border-t px-4 py-2.5 text-sm text-muted-foreground">
          {props.caption}
        </CardFooter>
      ) : null}
    </Card>
  );
}
