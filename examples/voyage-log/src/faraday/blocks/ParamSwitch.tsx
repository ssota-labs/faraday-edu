// <ParamSwitch> — a labeled on/off control.
import { Label } from "@/faraday/ui/label";
import { Switch } from "@/faraday/ui/switch";

export function ParamSwitch(props: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label>{props.label}</Label>
      <Switch checked={props.checked} onCheckedChange={(c) => props.onChange(Boolean(c))} />
    </div>
  );
}
