"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@faraday-academy/ui/components/ui/button";
import {
  Callout,
  Challenge,
  Chart,
  CodeCell,
  Compare,
  ControlGroup,
  Derivation,
  InkToolbar,
  Lecture,
  Lesson,
  NumericAnswer,
  ParamSlider,
  ParamSwitch,
  PresentationCanvas,
  PresentationToolbar,
  Prose,
  Quiz,
  Readout,
  Reveal,
  Scrubber,
  Segmented,
  SketchPad,
  SlideDeck,
  SlideInkLayer,
  Stage,
  Stat,
  TeX,
  Workbench,
  celebrate,
  type InkTool,
} from "@faraday-academy/kit/blocks";
import { useStepper } from "@faraday-academy/kit/runtime";
import { ScaledPreview } from "./scaled-frame";

export type BlockPreviewProps = { compact?: boolean };

const CHART_DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 273, mobile: 190 },
];

const CHART_SERIES = [
  { key: "desktop", label: "Desktop", color: "var(--chart-1)" },
  { key: "mobile", label: "Mobile", color: "var(--chart-2)" },
];

function ParamSliderDemo({ compact }: BlockPreviewProps) {
  const [value, setValue] = useState(42);
  return (
    <ParamSlider
      label="Model strength"
      value={value}
      min={0}
      max={100}
      onChange={setValue}
      format={(next) => `${next}%`}
    />
  );
}

function ChartDemo({ compact }: BlockPreviewProps) {
  const [value, setValue] = useState(42);
  const data = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((x) => ({
        x,
        value: Math.round((value / 16) * x * x),
      })),
    [value],
  );

  if (compact) {
    return (
      <Chart
        data={data}
        x="x"
        series={[{ key: "value", label: "Model" }]}
        height={150}
      />
    );
  }

  return (
    <Chart
      type="bar"
      data={CHART_DATA}
      x="month"
      series={CHART_SERIES}
      legend
      height={220}
    />
  );
}

function WorkbenchDemo({ compact }: BlockPreviewProps) {
  const [mass, setMass] = useState(3);
  const [vel, setVel] = useState(4);
  return (
    <Workbench
      title="Momentum"
      panelTitle="Parameters"
      onReset={() => {
        setMass(3);
        setVel(4);
      }}
      controls={
        <ControlGroup label="Inputs">
          <ParamSlider label="Mass (kg)" value={mass} min={1} max={10} onChange={setMass} />
          <ParamSlider label="Velocity (m/s)" value={vel} min={0} max={10} onChange={setVel} />
        </ControlGroup>
      }
    >
      <div className={`flex flex-col items-center justify-center gap-3 ${compact ? "h-28" : "h-40"}`}>
        <div
          className="rounded-full bg-primary transition-all"
          style={{ width: 24 + mass * 8, height: 24 + mass * 8 }}
        />
        <Readout label="p = m·v" value={`${(mass * vel).toFixed(1)} kg·m/s`} tone="primary" />
      </div>
    </Workbench>
  );
}

function ScrubberDemo({ compact }: BlockPreviewProps) {
  const s = useStepper(6);
  return (
    <div className="space-y-3">
      <Stage caption={`Frame ${s.index + 1} of ${s.total}`}>
        <div className={`flex items-end justify-center gap-1 ${compact ? "h-20" : "h-28"}`}>
          {Array.from({ length: s.index + 1 }).map((_, i) => (
            <div key={i} className="w-4 rounded-t bg-primary" style={{ height: 12 + i * 12 }} />
          ))}
        </div>
      </Stage>
      <Scrubber
        index={s.index}
        total={s.total}
        playing={s.playing}
        atStart={s.atStart}
        atEnd={s.atEnd}
        onPrev={s.prev}
        onNext={s.next}
        onTogglePlay={s.togglePlay}
        onSeek={s.setIndex}
        label="Build-up"
      />
    </div>
  );
}

function ChallengeDemo() {
  const [done, setDone] = useState(false);
  return (
    <Challenge
      title="Balance the equation"
      goal="Get both sides to 12"
      done={done}
      hint="6 + 6, or 4 × 3"
      onDone={() => setDone(true)}
    >
      <button
        type="button"
        className="rounded-md border border-border px-3 py-1.5 text-sm"
        onClick={() => setDone((d) => !d)}
      >
        {done ? "Solved ✓" : "Mark as solved"}
      </button>
    </Challenge>
  );
}

function InkToolbarDemo() {
  const [tool, setTool] = useState<InkTool>("pen");
  const [color, setColor] = useState("#2563eb");
  const [size, setSize] = useState(3);
  return (
    <InkToolbar
      tool={tool}
      color={color}
      size={size}
      onTool={setTool}
      onColor={setColor}
      onSize={setSize}
      onUndo={() => {}}
      onClear={() => {}}
    />
  );
}

function LectureShellDemo({ compact }: BlockPreviewProps) {
  return (
    <ScaledPreview compact={compact}>
      <div className="relative h-64 w-full bg-background">
        <Lecture
          title="Mechanics"
          lead="Two presentation views share one lecture shell."
          views={[
            {
              id: "slides",
              label: "Slides",
              content: (
                <div className="px-6 pt-14">
                  <Prose heading="Momentum">Equal areas in equal times.</Prose>
                </div>
              ),
            },
            {
              id: "textbook",
              label: "Textbook",
              content: (
                <div className="px-6 pt-14">
                  <Prose>Denser paragraphs for reading mode.</Prose>
                </div>
              ),
            },
          ]}
        />
      </div>
    </ScaledPreview>
  );
}

function SlideDeckDemo({ compact }: BlockPreviewProps) {
  return (
    <ScaledPreview compact={compact}>
      <div className="relative h-64 w-full bg-background">
        <SlideDeck
          inkKey="catalog-preview"
          slides={[
            { id: "1", title: "Setup", content: <Prose>Two carts on a frictionless track.</Prose> },
            { id: "2", title: "Result", content: <Prose>Momentum before equals momentum after.</Prose> },
          ]}
        />
      </div>
    </ScaledPreview>
  );
}

function PresentationCanvasDemo({ compact }: BlockPreviewProps) {
  return (
    <ScaledPreview compact={compact}>
      <div className="relative h-64 w-full bg-background">
        <PresentationCanvas
          inkKey="catalog-canvas"
          cardLayout="landscape"
          items={[
            { id: "a", title: "Idea A", content: <Prose>First card on the canvas.</Prose> },
            { id: "b", title: "Idea B", content: <Prose>Pan, zoom, and ink.</Prose> },
          ]}
        />
      </div>
    </ScaledPreview>
  );
}

function PresentationToolbarDemo() {
  return (
    <div className="flex h-full min-h-28 items-end justify-center pb-2">
      <PresentationToolbar pinned>
        <Button size="sm" variant="outline">
          Prev
        </Button>
        <Button size="sm" variant="outline">
          Next
        </Button>
      </PresentationToolbar>
    </div>
  );
}

function PresentationTopBarDemo({ compact }: BlockPreviewProps) {
  return (
    <ScaledPreview compact={compact}>
      <div className="relative h-64 w-full bg-background">
        <Lecture
          title="Top bar chrome"
          views={[
            {
              id: "slides",
              label: "Slides",
              content: <Prose>Presentation top bar with view tabs.</Prose>,
            },
            {
              id: "notes",
              label: "Notes",
              content: <Prose>Switch views from the fixed header.</Prose>,
            },
          ]}
        />
      </div>
    </ScaledPreview>
  );
}

function CelebrateDemo() {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div className="grid place-items-center gap-3 py-2">
      <p className="text-center text-xs text-muted-foreground">Confetti burst when a check passes.</p>
      <Button ref={ref} type="button" size="sm" onClick={() => celebrate(ref.current)}>
        Celebrate
      </Button>
    </div>
  );
}

function UseLectureDemo() {
  return (
    <Prose>
      <p className="text-sm">
        <code className="font-mono text-xs">useLecture()</code> reads view-switcher state from{" "}
        <code className="font-mono text-xs">&lt;Lecture&gt;</code>. Presentation blocks (SlideDeck,
        PresentationTopBar) consume it automatically.
      </p>
    </Prose>
  );
}

function SlideInkLayerDemo({ compact }: BlockPreviewProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-md border border-border bg-muted/30 ${compact ? "h-28" : "h-40"}`}>
      <Prose>Annotate the active slide.</Prose>
      <SlideInkLayer inkKey="catalog-slide-ink" active={false} />
    </div>
  );
}

function ControlGroupDemo() {
  const [a, setA] = useState(5);
  return (
    <ControlGroup label="Wave" defaultOpen onReset={() => setA(5)}>
      <ParamSlider label="Amplitude" value={a} min={0} max={10} onChange={setA} />
    </ControlGroup>
  );
}

function ParamSwitchDemo() {
  const [on, setOn] = useState(true);
  return <ParamSwitch label="Show grid lines" checked={on} onChange={setOn} />;
}

function SegmentedDemo() {
  const [value, setValue] = useState("bar");
  return (
    <Segmented
      label="Chart type"
      value={value}
      onChange={setValue}
      options={[
        { value: "line", label: "Line" },
        { value: "bar", label: "Bar" },
        { value: "area", label: "Area" },
      ]}
    />
  );
}

export const BLOCK_PREVIEW_DEMOS: Record<string, (props: BlockPreviewProps) => ReactNode> = {
  Callout: () => (
    <Callout title="The key idea">
      Change one thing, observe what stays invariant, then name the pattern.
    </Callout>
  ),
  celebrate: () => <CelebrateDemo />,
  Challenge: () => <ChallengeDemo />,
  Chart: (props) => <ChartDemo {...props} />,
  CodeCell: () => (
    <CodeCell
      code={"for (let i = 1; i <= 3; i++) {\n  console.log('step', i);\n}"}
      caption="Edit the loop and press Run."
    />
  ),
  Compare: () => (
    <Compare
      items={[
        {
          value: "before",
          label: "Before",
          content: <p className="text-sm">A static explanation.</p>,
        },
        {
          value: "after",
          label: "After",
          content: <p className="text-sm">A model you can manipulate.</p>,
        },
      ]}
    />
  ),
  ControlGroup: () => <ControlGroupDemo />,
  Derivation: () => (
    <Derivation
      title="Impulse–momentum"
      defaultOpen
      steps={[
        { tex: "F = m a", note: "Newton's second law" },
        { tex: "J = \\Delta p", note: "Integrate" },
      ]}
    />
  ),
  InkToolbar: () => <InkToolbarDemo />,
  Lecture: (props) => <LectureShellDemo {...props} />,
  Lesson: () => (
    <Lesson title="Kepler's Second Law" topic="Orbital mechanics" lead="Equal areas in equal times.">
      <Prose>The line from the Sun to a planet sweeps equal areas over equal intervals.</Prose>
    </Lesson>
  ),
  NumericAnswer: () => (
    <NumericAnswer
      question="A 2 kg cart moves at 3 m/s. What is its momentum?"
      answer={6}
      tolerance={0.1}
      unit="kg·m/s"
      hint="p = m × v"
    />
  ),
  Paged: (props) => <SlideDeckDemo {...props} />,
  ParamSlider: (props) => <ParamSliderDemo {...props} />,
  ParamSwitch: () => <ParamSwitchDemo />,
  PresentationCanvas: (props) => <PresentationCanvasDemo {...props} />,
  PresentationToolbar: () => <PresentationToolbarDemo />,
  PresentationTopBar: (props) => <PresentationTopBarDemo {...props} />,
  Prose: () => (
    <Prose heading="What is momentum?">
      Momentum is mass in motion — the product of an object&apos;s mass and its velocity.
    </Prose>
  ),
  Quiz: () => (
    <Quiz
      question="Which change doubles the output?"
      options={[
        { label: "Double the input", correct: true, hint: "Exactly." },
        { label: "Halve the input", hint: "That moves the other way." },
      ]}
    />
  ),
  Readout: () => (
    <div className="flex flex-wrap gap-3">
      <Readout label="Kinetic energy" value="18 J" tone="primary" />
      <Readout label="Error" value="out of range" tone="destructive" />
    </div>
  ),
  Reveal: () => (
    <Reveal label="Show the derivation">
      <Prose>Integrating force over time gives the impulse–momentum theorem.</Prose>
    </Reveal>
  ),
  Scrubber: (props) => <ScrubberDemo {...props} />,
  Segmented: () => <SegmentedDemo />,
  SketchPad: ({ compact }) => (
    <SketchPad
      prompt="Sketch velocity vs time for free fall."
      viewBox="0 0 320 200"
      background={
        <g stroke="var(--border)" strokeWidth="1">
          <line x1="30" y1="10" x2="30" y2="180" />
          <line x1="30" y1="180" x2="310" y2="180" />
        </g>
      }
      overlay={
        <line x1="30" y1="180" x2="300" y2="30" stroke="var(--primary)" strokeWidth="3" strokeDasharray="6 4" />
      }
    />
  ),
  SlideDeck: (props) => <SlideDeckDemo {...props} />,
  SlideInkLayer: (props) => <SlideInkLayerDemo {...props} />,
  Stage: ({ compact }) => (
    <Stage caption="A parabolic trajectory">
      <svg viewBox="0 0 200 100" className={compact ? "h-24 w-full" : "h-32 w-full"}>
        <path d="M10 90 Q100 -20 190 90" fill="none" stroke="var(--primary)" strokeWidth="3" />
      </svg>
    </Stage>
  ),
  Stat: () => <Stat label="Completion" value="72%" delta={{ text: "+8%" }} />,
  TeX: () => <TeX block>{String.raw`f(x) = ax^2 + bx + c`}</TeX>,
  useLecture: () => <UseLectureDemo />,
  Workbench: (props) => <WorkbenchDemo {...props} />,
};
