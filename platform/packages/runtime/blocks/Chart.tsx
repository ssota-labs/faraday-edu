// <Chart> — a data chart built on shadcn's ChartContainer (Recharts).
// Cartesian types (line / bar / area) and radar take rows + an x/angle key +
// one or more series. Slice types (pie / donut / radial) treat each ROW as a
// slice: `x` is the slice-name key and the first series' `key` is the value.
// Series/slice colours default to the theme's --chart-1..5 tokens (light/dark
// both work). A hover tooltip is on by default; add `legend` for a legend.
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
  Pie,
  PieChart as RPieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RRadarChart,
  RadialBar,
  RadialBarChart as RRadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/faraday/ui/chart";

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
}

export type ChartType = "line" | "bar" | "area" | "radar" | "pie" | "donut" | "radial";

export function Chart(props: {
  type?: ChartType;
  /** Row values. `null` is allowed (Recharts treats it as a gap). A point whose
   *  neighbours are both null/absent renders as a visible DOT marker — use a
   *  mostly-null series for a single "you are here" marker on a model curve. */
  data: Record<string, string | number | null>[];
  /** Cartesian/radar: the axis/angle key. Slice charts (pie/donut/radial): the
   *  key on each row that names the slice. */
  x: string;
  /** Cartesian/radar: one entry per line/bar/ring. Slice charts use only the
   *  first entry's `key` as the value. */
  series: ChartSeries[];
  height?: number;
  yAxis?: boolean;
  /** Hover tooltip. On by default. */
  tooltip?: boolean;
  /** Legend. Off by default — turn on for multi-series or slice charts. */
  legend?: boolean;
  /** "number" plots x at its true numeric position (function graphs, uneven
   *  samples). Default "category" spaces rows evenly. line/area only. */
  xType?: "category" | "number";
}) {
  const {
    type = "line",
    data,
    x,
    series,
    height = 240,
    yAxis = false,
    tooltip = true,
    legend = false,
    xType = "category",
  } = props;

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

  // pie / donut / radial: each row is a slice, coloured by index.
  const slices = type === "pie" || type === "donut" || type === "radial";
  const valueKey = series[0]?.key ?? "value";
  const sliceData = slices ? data.map((row, i) => ({ ...row, fill: `var(--chart-${(i % 5) + 1})` })) : data;

  const config: ChartConfig = slices
    ? Object.fromEntries(
        data.map((row, i) => [String(row[x]), { label: String(row[x] ?? ""), color: `var(--chart-${(i % 5) + 1})` }]),
      )
    : Object.fromEntries(
        series.map((s, i) => [s.key, { label: s.label ?? s.key, color: s.color ?? `var(--chart-${(i % 5) + 1})` }]),
      );

  const tooltipEl = tooltip ? (
    <ChartTooltip content={<ChartTooltipContent nameKey={slices ? x : undefined} />} />
  ) : null;
  const legendEl = legend ? <ChartLegend content={<ChartLegendContent nameKey={slices ? x : undefined} />} /> : null;

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
      {tooltipEl}
      {legendEl}
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

  function chart() {
    switch (type) {
      case "bar":
        return (
          <RBarChart data={data} margin={margin}>
            {axes}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} isAnimationActive={false} />
            ))}
          </RBarChart>
        );
      case "area":
        return (
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
        );
      case "radar":
        return (
          <RRadarChart data={data} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey={x} />
            {tooltipEl}
            {legendEl}
            {series.map((s) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                fill={`var(--color-${s.key})`}
                fillOpacity={0.35}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
              />
            ))}
          </RRadarChart>
        );
      case "pie":
      case "donut":
        return (
          <RPieChart>
            {tooltipEl}
            <Pie
              data={sliceData}
              dataKey={valueKey}
              nameKey={x}
              innerRadius={type === "donut" ? Math.round(height * 0.24) : 0}
              outerRadius={Math.round(height * 0.42)}
            />
            {legendEl}
          </RPieChart>
        );
      case "radial":
        return (
          <RRadialBarChart data={sliceData} innerRadius="25%" outerRadius="100%" startAngle={90} endAngle={-270}>
            {tooltipEl}
            <RadialBar dataKey={valueKey} background cornerRadius={4} />
            {legendEl}
          </RRadialBarChart>
        );
      default:
        return (
          <RLineChart data={data} margin={margin}>
            {axes}
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} stroke={`var(--color-${s.key})`} dot={isolatedDot(s.key)} strokeWidth={2} />
            ))}
          </RLineChart>
        );
    }
  }

  return (
    <div ref={ref} className="w-full" style={{ minHeight: height }}>
      {sized ? (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
          {chart()}
        </ChartContainer>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
