// <Segmented> — a single-select segmented control (built on Tabs).
import { Label } from "@/faraday/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/faraday/ui/tabs";

export function Segmented<T extends string = string>(props: {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {props.label ? <Label>{props.label}</Label> : null}
      <Tabs value={props.value} onValueChange={(v) => props.onChange(v as T)}>
        <TabsList>
          {props.options.map((o) => (
            <TabsTrigger key={o.value} value={o.value}>
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
