// Demo lesson: an interactive walk-through of bubble sort, in a workbench layout
// (center canvas + right control dock, like mirror-dimension) plus a shadcn chart.
// AUTHOR AREA — rewrite this file. Everything under src/faraday/ is vendored and locked.
import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  Scrubber,
  ParamSlider,
  Callout,
  Quiz,
  Reveal,
  Stat,
} from "@/faraday/blocks";
import { Button } from "@/faraday/ui/button";
import { useStepper } from "@/faraday/runtime";

interface Frame {
  array: number[];
  a: number;
  b: number;
  swapped: boolean;
  sortedFrom: number;
  done: boolean;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeValues(count: number, seed: number): number[] {
  const rand = mulberry32(seed * 2654435761);
  const heights = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = heights.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [heights[i], heights[j]] = [heights[j], heights[i]];
  }
  return heights;
}

function bubbleFrames(values: number[]): Frame[] {
  const arr = values.slice();
  const n = arr.length;
  const frames: Frame[] = [];
  let sortedFrom = n;
  frames.push({ array: arr.slice(), a: -1, b: -1, swapped: false, sortedFrom, done: false });
  for (let pass = 0; pass < n - 1; pass++) {
    for (let i = 0; i < sortedFrom - 1; i++) {
      frames.push({ array: arr.slice(), a: i, b: i + 1, swapped: false, sortedFrom, done: false });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        frames.push({ array: arr.slice(), a: i, b: i + 1, swapped: true, sortedFrom, done: false });
      }
    }
    sortedFrom--;
  }
  frames.push({ array: arr.slice(), a: -1, b: -1, swapped: false, sortedFrom: 0, done: true });
  return frames;
}

/** Comparisons + swaps done in each pass — data for the bar chart. */
function passStats(values: number[]) {
  const arr = values.slice();
  const n = arr.length;
  const rows: { pass: string; comparisons: number; swaps: number }[] = [];
  for (let pass = 0; pass < n - 1; pass++) {
    let comparisons = 0;
    let swaps = 0;
    for (let i = 0; i < n - 1 - pass; i++) {
      comparisons++;
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
      }
    }
    rows.push({ pass: `P${pass + 1}`, comparisons, swaps });
  }
  return rows;
}

const W = 560;
const H = 240;

function Bars({ frame }: { frame: Frame }) {
  const n = frame.array.length;
  const gap = 10;
  const barW = (W - gap * (n - 1)) / n;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Array being sorted">
      {frame.array.map((value, i) => {
        const h = (value / n) * (H - 28);
        const x = i * (barW + gap);
        const active = i === frame.a || i === frame.b;
        const sorted = i >= frame.sortedFrom || frame.done;
        const fill = sorted
          ? "var(--chart-3)"
          : active
            ? frame.swapped
              ? "var(--destructive)"
              : "var(--primary)"
            : "var(--muted-foreground)";
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} rx={5} style={{ fill }} />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize={12} style={{ fill: "var(--muted-foreground)" }}>
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function BubbleSortLesson() {
  const [size, setSize] = useState(7);
  const [seed, setSeed] = useState(1);

  const values = useMemo(() => makeValues(size, seed), [size, seed]);
  const frames = useMemo(() => bubbleFrames(values), [values]);
  const stats = useMemo(() => passStats(values), [values]);
  const step = useStepper(frames.length, { fps: 3 });
  const frame = frames[step.index];

  const totalSwaps = stats.reduce((s, r) => s + r.swaps, 0);
  const totalComparisons = stats.reduce((s, r) => s + r.comparisons, 0);

  return (
    <Lesson
      topic="Algorithms"
      title="Watch bubble sort work"
      lead="Bubble sort repeatedly compares neighbours and swaps the bigger one rightward. Drive it from the control dock and watch the largest values 'bubble' to the end."
    >
      <Prose>
        <p>
          On each step we compare the two <strong>highlighted</strong> neighbours. If the left one is
          larger they <em>swap</em> (red). Bars that reached their final position turn green.
        </p>
      </Prose>

      <Workbench
        title="Array"
        panelTitle="Bubble Sort"
        onReset={() => {
          setSize(7);
          setSeed(1);
          step.reset();
        }}
        controls={
          <>
            <ControlGroup label="Playback">
              <Scrubber
                index={step.index}
                total={step.total}
                playing={step.playing}
                atStart={step.atStart}
                atEnd={step.atEnd}
                onPrev={step.prev}
                onNext={step.next}
                onTogglePlay={step.togglePlay}
                onSeek={step.setIndex}
              />
            </ControlGroup>
            <ControlGroup label="Data" onReset={() => setSeed((s) => s + 1)}>
              <ParamSlider label="List size" value={size} min={4} max={11} onChange={setSize} />
              <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
                Shuffle ↻
              </Button>
            </ControlGroup>
            <ControlGroup label="Metrics" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Comparisons" value={totalComparisons} />
                <Stat label="Swaps" value={totalSwaps} />
              </div>
            </ControlGroup>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Bars frame={frame} />
          <p className="text-center text-sm text-muted-foreground">
            Step {step.index + 1} of {frames.length}
          </p>
        </div>
      </Workbench>

      <Prose heading="Work per pass">
        <p>
          Each pass does one fewer comparison than the last, and swaps taper off as the list gets
          sorted. Here is the work done in every pass:
        </p>
      </Prose>

      <Chart
        type="bar"
        data={stats}
        x="pass"
        yAxis
        series={[
          { key: "comparisons", label: "Comparisons" },
          { key: "swaps", label: "Swaps" },
        ]}
      />

      <Callout title="Why it is slow">
        Up to <code>n − 1</code> passes of up to <code>n − 1</code> comparisons each — about{" "}
        <code>n²/2</code> comparisons for <code>n</code> items. Fine for a handful, painful for thousands.
      </Callout>

      <Reveal label="Hint: when can it stop early?">
        If a full pass makes zero swaps, the list is already sorted and bubble sort can stop — an
        optimization this demo doesn't apply.
      </Reveal>

      <Quiz
        question="Roughly how many comparisons does bubble sort make in the worst case for n items?"
        options={[
          { label: "About n", hint: "That would be a single pass." },
          { label: "About n log n", hint: "That's mergesort/quicksort, not bubble sort." },
          { label: "About n² / 2", correct: true, hint: "Right — nested passes over the list." },
          { label: "About 2ⁿ", hint: "Exponential is far worse than bubble sort actually is." },
        ]}
      />
    </Lesson>
  );
}
