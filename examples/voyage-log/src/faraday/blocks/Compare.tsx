// <Compare> — tabbed panels for comparing cases side by side (built on Tabs).
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/faraday/ui/tabs";

export function Compare(props: {
  items: { value: string; label: string; content: ReactNode }[];
  defaultValue?: string;
}) {
  return (
    <Tabs defaultValue={props.defaultValue ?? props.items[0]?.value} className="gap-3">
      <TabsList>
        {props.items.map((it) => (
          <TabsTrigger key={it.value} value={it.value}>
            {it.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {props.items.map((it) => (
        <TabsContent key={it.value} value={it.value}>
          {it.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
