// <ParamSlider> — a labeled slider with a live value read-out. Exposes a plain
// number (the underlying Base UI slider is array-capable; we unwrap it).
import { Label } from "@/faraday/ui/label";
import { Slider } from "@/faraday/ui/slider";

export function ParamSlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const { label, value, min, max, step = 1, onChange, format } = props;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-sm tabular-nums text-primary">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(typeof v === "number" ? v : v[0])}
      />
    </div>
  );
}
