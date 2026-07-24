import { useId } from "react";

export type ParamControlProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

/**
 * Minimal education HUD control for fullscreen 3D lessons.
 * Designed to overlay a canvas — not dashboard chrome.
 */
export function ParamControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  onChange,
}: ParamControlProps) {
  const id = useId();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 200,
        padding: "12px 14px",
        background: "rgba(8, 12, 24, 0.72)",
        border: "1px solid rgba(232, 238, 252, 0.12)",
        backdropFilter: "blur(8px)",
        color: "#e8eefc",
        fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
      }}
    >
      <label htmlFor={id} style={{ fontSize: 13, opacity: 0.9 }}>
        {label}:{" "}
        <strong>
          {value}
          {unit ? ` ${unit}` : ""}
        </strong>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ width: "100%" }}
      />
    </div>
  );
}
