// <Chart> — a data chart built on shadcn's ChartContainer (Recharts).
// Pass rows of data, the x-axis key, and one or more series. Series colours
// default to the theme's --chart-1..5 tokens (so light/dark both work).
//
// Rendering is deferred until the container has a real width. Recharts'
// ResponsiveContainer never recovers if it mounts at 0px (e.g. inside a
// collapsed group, a hidden tab, or an off-screen panel), so we gate on a
// ResizeObserver — the chart always mounts at its true size.
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/faraday/ui/chart";

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
}

export function Chart(props: {
  type?: "line" | "bar" | "area";
  /** Row values. `null` is allowed (Recharts treats it as a gap). A point whose
   *  neighbours are both null/absent renders as a visible DOT marker — use a
   *  mostly-null series for a single "you are here" marker on a model curve. */
  data: Record<string, string | number | null>[];
  x: string;
  series: ChartSeries[];
  height?: number;
  yAxis?: boolean;
  /** "number" plots x at its true numeric position (function graphs, uneven
   *  samples). Default "category" spaces rows evenly. line/area only. */
  xType?: "category" | "number";
}) {
  const { type = "line", data, x, series, height = 240, yAxis = false, xType = "category" } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [sized, setSized] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.clientWidth > 0) setSized(true);
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setSized(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label ?? s.key, color: s.color ?? `var(--chart-${(i % 5) + 1})` },
    ]),
  );

  const axes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey={x}
        type={xType}
        domain={xType === "number" ? ["dataMin", "dataMax"] : undefined}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
      />
      {yAxis ? <YAxis tickLine={false} axisLine={false} width={32} /> : null}
      <ChartTooltip content={<ChartTooltipContent />} />
    </>
  );

  // A gap-isolated point (null/absent on both sides) would be INVISIBLE with
  // dot={false} — render just those as explicit markers so "you are here"
  // single-point series work as documented.
  const isolatedDot =
    (key: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dotProps: any) => {
      const { index, cx, cy } = dotProps;
      const prev = index > 0 ? data[index - 1]?.[key] : null;
      const next = index < data.length - 1 ? data[index + 1]?.[key] : null;
      const isolated = prev == null && next == null;
      if (!isolated || cx == null || cy == null) return <g key={`d-${index}`} />;
      return <circle key={`d-${index}`} cx={cx} cy={cy} r={4.5} fill={`var(--color-${key})`} stroke="var(--background)" strokeWidth={1.5} />;
    };

  const margin = { left: 4, right: 8, top: 8, bottom: 0 };

  return (
    <div ref={ref} className="w-full" style={{ minHeight: height }}>
      {sized ? (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      {type === "bar" ? (
        <RBarChart data={data} margin={margin}>
          {axes}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={`var(--color-${s.key})`}
              radius={4}
              isAnimationActive={false}
            />
          ))}
        </RBarChart>
      ) : type === "area" ? (
        <RAreaChart data={data} margin={margin}>
          {axes}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              fill={`var(--color-${s.key})`}
              fillOpacity={0.18}
              strokeWidth={2}
            />
          ))}
        </RAreaChart>
      ) : (
        <RLineChart data={data} margin={margin}>
          {axes}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              dot={isolatedDot(s.key)}
              strokeWidth={2}
            />
          ))}
        </RLineChart>
      )}
        </ChartContainer>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
