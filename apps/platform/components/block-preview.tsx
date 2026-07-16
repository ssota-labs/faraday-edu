"use client";

import { useMemo, useState } from "react";
import {
  Callout,
  Chart,
  Compare,
  ParamSlider,
  Quiz,
  Stat,
  TeX,
} from "@faraday-academy/kit/blocks";

export function BlockPreview({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState(42);
  const chartData = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((x) => ({
        x,
        value: Math.round((value / 16) * x * x),
      })),
    [value],
  );

  let preview: React.ReactNode;
  switch (name) {
    case "ParamSlider":
      preview = (
        <ParamSlider
          label="Model strength"
          value={value}
          min={0}
          max={100}
          onChange={setValue}
          format={(next) => `${next}%`}
        />
      );
      break;
    case "Chart":
      preview = (
        <Chart
          data={chartData}
          x="x"
          series={[{ key: "value", label: "Model" }]}
          height={compact ? 150 : 240}
        />
      );
      break;
    case "Quiz":
      preview = (
        <Quiz
          question="Which change doubles the output?"
          options={[
            { label: "Double the input", correct: true, hint: "Exactly." },
            { label: "Halve the input", hint: "That moves the other way." },
          ]}
        />
      );
      break;
    case "Stat":
      preview = <Stat label="Completion" value={`${value}%`} delta={{ text: "+8%" }} />;
      break;
    case "Callout":
      preview = (
        <Callout title="The key idea">
          Change one thing, observe what stays invariant, then name the pattern.
        </Callout>
      );
      break;
    case "Compare":
      preview = (
        <Compare
          items={[
            { value: "before", label: "Before", content: <p className="text-sm">A static explanation.</p> },
            { value: "after", label: "After", content: <p className="text-sm">A model you can manipulate.</p> },
          ]}
        />
      );
      break;
    case "TeX":
      preview = <TeX block>{String.raw`f(x) = ax^2 + bx + c`}</TeX>;
      break;
    default:
      preview = <AbstractPreview name={name} />;
  }

  return (
    <div className="style-faraday h-full min-h-36 overflow-hidden bg-background p-5 text-foreground">
      {preview}
    </div>
  );
}

function AbstractPreview({ name }: { name: string }) {
  return (
    <div className="grid h-full min-h-28 place-items-center">
      <div className="relative grid size-24 place-items-center">
        <div className="absolute inset-0 rotate-6 rounded-[28%] border border-primary/30" />
        <div className="absolute inset-3 -rotate-12 rounded-[32%] border border-primary/50" />
        <span className="relative font-mono text-xs font-semibold">{name.slice(0, 10)}</span>
      </div>
    </div>
  );
}
