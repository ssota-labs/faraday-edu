/* Demo stories — live examples of each runtime block, rendered by the labs
   preview canvas. Kept in the labs app (NOT the runtime package) so the vendored
   runtime stays clean + SHA-lockable. Each entry: a live render + a source
   snippet shown beside it. Stateful blocks use real components with hooks. */
import { useState, type ReactNode } from "react";
import {
  Callout,
  Challenge,
  Chart,
  CodeCell,
  Compare,
  ControlGroup,
  Derivation,
  Lesson,
  NumericAnswer,
  SlideDeck,
  ParamSlider,
  ParamSwitch,
  Prose,
  Quiz,
  Readout,
  Reveal,
  Scrubber,
  Segmented,
  SketchPad,
  Stage,
  Stat,
  TeX,
  Workbench,
} from "@/faraday/blocks";
import { Course as CourseShell, useStepper } from "@/faraday/runtime";

export type Demo = { render: () => ReactNode; source: string; blurb?: string };

// ── stateful demos ───────────────────────────────────────────────────────────

function ParamSliderDemo() {
  const [v, setV] = useState(72);
  return (
    <ParamSlider label="Interest rate" value={v} min={0} max={100} step={1} onChange={setV} format={(n) => `${n}%`} />
  );
}

function ParamSwitchDemo() {
  const [on, setOn] = useState(true);
  return <ParamSwitch label="Show grid lines" checked={on} onChange={setOn} />;
}

function SegmentedDemo() {
  const [v, setV] = useState("bar");
  return (
    <Segmented
      label="Chart type"
      value={v}
      onChange={setV}
      options={[
        { value: "line", label: "Line" },
        { value: "bar", label: "Bar" },
        { value: "area", label: "Area" },
      ]}
    />
  );
}

function WorkbenchDemo() {
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
      <div className="flex h-56 flex-col items-center justify-center gap-4">
        <div
          className="rounded-full bg-primary transition-all"
          style={{ width: 30 + mass * 12, height: 30 + mass * 12 }}
        />
        <Readout label="p = m·v" value={`${(mass * vel).toFixed(1)} kg·m/s`} tone="primary" />
      </div>
    </Workbench>
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

function ScrubberDemo() {
  const s = useStepper(6);
  return (
    <div className="space-y-4">
      <Stage caption={`Frame ${s.index + 1} of ${s.total}`}>
        <div className="flex h-40 items-end justify-center gap-1.5">
          {Array.from({ length: s.index + 1 }).map((_, i) => (
            <div key={i} className="w-6 rounded-t bg-primary" style={{ height: 16 + i * 18 }} />
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
        {done ? "Solved ✓ (toggle)" : "Mark as solved"}
      </button>
    </Challenge>
  );
}

// ── static data ──────────────────────────────────────────────────────────────

const CHART_DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 264, mobile: 140 },
];
const CHART_SERIES = [
  { key: "desktop", label: "Desktop", color: "var(--chart-1)" },
  { key: "mobile", label: "Mobile", color: "var(--chart-2)" },
];
const SLICE_DATA = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 },
  { browser: "Other", visitors: 90 },
];
const SLICE_SERIES = [{ key: "visitors", label: "Visitors" }];

function ChartExample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ChartGallery() {
  return (
    <div className="flex flex-col gap-7">
      <ChartExample label="Bar · multi-series · legend + tooltip + y-axis">
        <Chart type="bar" data={CHART_DATA} x="month" series={CHART_SERIES} legend yAxis height={240} />
      </ChartExample>
      <ChartExample label="Line · multi-series · legend">
        <Chart type="line" data={CHART_DATA} x="month" series={CHART_SERIES} legend height={220} />
      </ChartExample>
      <ChartExample label="Area · single series">
        <Chart type="area" data={CHART_DATA} x="month" series={[CHART_SERIES[0]]} height={200} />
      </ChartExample>
      <ChartExample label="Radar · multi-series · legend">
        <Chart type="radar" data={CHART_DATA} x="month" series={CHART_SERIES} legend height={280} />
      </ChartExample>
      <div className="grid gap-7 sm:grid-cols-2">
        <ChartExample label="Pie · legend">
          <Chart type="pie" data={SLICE_DATA} x="browser" series={SLICE_SERIES} legend height={260} />
        </ChartExample>
        <ChartExample label="Donut">
          <Chart type="donut" data={SLICE_DATA} x="browser" series={SLICE_SERIES} height={260} />
        </ChartExample>
      </div>
      <ChartExample label="Radial">
        <Chart type="radial" data={SLICE_DATA} x="browser" series={SLICE_SERIES} legend height={260} />
      </ChartExample>
    </div>
  );
}

// ── runtime demos ─────────────────────────────────────────────────────────────

function CourseChapterA() {
  const [n, setN] = useState(6);
  return (
    <Lesson topic="Numbers · Chapter 1" title="Counting in groups" lead="Slide to change the count.">
      <Prose>
        <p>A number is just a count of things.</p>
      </Prose>
      <Stage caption={`${n} dots`}>
        <svg viewBox="0 0 640 120" className="w-full">
          {Array.from({ length: n }).map((_, i) => (
            <circle key={i} cx={40 + (i * 560) / Math.max(1, n - 1)} cy={60} r={16} style={{ fill: "var(--primary)" }} />
          ))}
        </svg>
      </Stage>
      <ParamSlider label="How many" value={n} min={1} max={12} onChange={setN} />
    </Lesson>
  );
}

function CourseChapterB() {
  const [steps, setSteps] = useState(8);
  const data = Array.from({ length: steps }, (_, i) => ({ step: `${i}`, doubling: 2 ** i, linear: i * 8 }));
  return (
    <Lesson topic="Numbers · Chapter 2" title="Doubling gets big, fast" lead="Compare doubling with steady growth.">
      <Prose>
        <p>Double each step and you rocket upward — exponential growth.</p>
      </Prose>
      <Chart
        type="line"
        data={data}
        x="step"
        yAxis
        legend
        series={[
          { key: "doubling", label: "Doubling" },
          { key: "linear", label: "Add 8 each step" },
        ]}
      />
      <ParamSlider label="Steps" value={steps} min={3} max={12} onChange={setSteps} />
    </Lesson>
  );
}

function CourseDemo() {
  return (
    <CourseShell
      title="A tiny numbers course"
      chapters={[
        { slug: "counting", title: "Counting", element: <CourseChapterA /> },
        { slug: "doubling", title: "Doubling", element: <CourseChapterB /> },
      ]}
    />
  );
}

export const DEMOS: Record<string, Demo> = {
  Lesson: {
    render: () => (
      <Lesson title="Kepler's Second Law" topic="Orbital mechanics" lead="A planet sweeps equal areas in equal times.">
        <Prose>The line from the Sun to a planet covers equal areas over equal intervals — so a planet speeds up near the Sun and slows down far away.</Prose>
      </Lesson>
    ),
    source: `<Lesson title="Kepler's Second Law" topic="Orbital mechanics"
  lead="A planet sweeps equal areas in equal times.">
  <Prose>…</Prose>
</Lesson>`,
  },
  Prose: {
    render: () => (
      <Prose heading="What is momentum?">
        Momentum is mass in motion — the product of an object's mass and its velocity. It's conserved in every collision.
      </Prose>
    ),
    source: `<Prose heading="What is momentum?">Momentum is mass in motion…</Prose>`,
  },
  Stage: {
    render: () => (
      <Stage caption="A parabolic trajectory">
        <svg viewBox="0 0 200 100" className="h-40 w-full">
          <path d="M10 90 Q100 -20 190 90" fill="none" stroke="var(--primary)" strokeWidth="3" />
        </svg>
      </Stage>
    ),
    source: `<Stage caption="A parabolic trajectory"><svg>…</svg></Stage>`,
  },
  Workbench: {
    render: () => <WorkbenchDemo />,
    source: `<Workbench title="Momentum" controls={<ControlGroup label="Inputs">
  <ParamSlider label="Mass (kg)" value={mass} min={1} max={10} onChange={setMass} />
</ControlGroup>}>
  <canvas … />
</Workbench>`,
  },
  ControlGroup: {
    render: () => <ControlGroupDemo />,
    source: `<ControlGroup label="Wave" defaultOpen onReset={reset}>
  <ParamSlider label="Amplitude" value={a} min={0} max={10} onChange={setA} />
</ControlGroup>`,
  },
  Chart: {
    render: () => <ChartGallery />,
    source: `<Chart type="bar" data={data} x="month" legend yAxis
  series={[
    { key: "desktop", label: "Desktop", color: "var(--chart-1)" },
    { key: "mobile",  label: "Mobile",  color: "var(--chart-2)" },
  ]}
/>
// cartesian/radar: type "line"|"bar"|"area"|"radar", x + series
// slices: type "pie"|"donut"|"radial", x = slice name, series[0] = value
// tooltip on by default · legend opt-in`,
  },
  ParamSlider: {
    render: () => <ParamSliderDemo />,
    source: `<ParamSlider label="Interest rate" value={v} min={0} max={100}
  onChange={setV} format={(n) => \`\${n}%\`} />`,
  },
  ParamSwitch: {
    render: () => <ParamSwitchDemo />,
    source: `<ParamSwitch label="Show grid lines" checked={on} onChange={setOn} />`,
  },
  Segmented: {
    render: () => <SegmentedDemo />,
    source: `<Segmented label="Chart type" value={v} onChange={setV}
  options={[{ value: "line", label: "Line" }, …]} />`,
  },
  Scrubber: {
    render: () => <ScrubberDemo />,
    source: `const s = useStepper(6);
<Scrubber index={s.index} total={s.total} playing={s.playing}
  onPrev={s.prev} onNext={s.next} onTogglePlay={s.togglePlay} onSeek={s.setIndex} />`,
  },
  Quiz: {
    render: () => (
      <Quiz
        question="Which quantity is conserved in an elastic collision?"
        options={[
          { label: "Kinetic energy and momentum", correct: true, hint: "Elastic = kinetic energy preserved too." },
          { label: "Only momentum", hint: "True for inelastic collisions." },
          { label: "Only kinetic energy" },
        ]}
      />
    ),
    source: `<Quiz question="Which quantity is conserved…?" options={[
  { label: "Kinetic energy and momentum", correct: true, hint: "…" }, …
]} />`,
  },
  Callout: {
    render: () => (
      <div className="space-y-3">
        <Callout title="Key idea">Energy is conserved — it only changes form.</Callout>
        <Callout title="Watch out" variant="destructive">
          Don't confuse mass and weight.
        </Callout>
      </div>
    ),
    source: `<Callout title="Key idea">Energy is conserved…</Callout>
<Callout title="Watch out" variant="destructive">…</Callout>`,
  },
  Reveal: {
    render: () => (
      <Reveal label="Show the derivation">
        <Prose>Starting from F = ma and integrating over time gives the impulse–momentum theorem.</Prose>
      </Reveal>
    ),
    source: `<Reveal label="Show the derivation"><Prose>…</Prose></Reveal>`,
  },
  Compare: {
    render: () => (
      <Compare
        items={[
          { value: "transverse", label: "Transverse", content: <Prose>Oscillation is perpendicular to travel — like a light wave.</Prose> },
          { value: "longitudinal", label: "Longitudinal", content: <Prose>Oscillation is along the direction of travel — like sound.</Prose> },
        ]}
      />
    ),
    source: `<Compare items={[
  { value: "transverse", label: "Transverse", content: <Prose>…</Prose> }, …
]} />`,
  },
  Stat: {
    render: () => (
      <div className="flex flex-wrap gap-3">
        <Stat label="Speed of light" value="299,792 km/s" />
        <Stat label="Final balance" value="$1,428" delta={{ text: "+42%", tone: "default" }} />
      </div>
    ),
    source: `<Stat label="Final balance" value="$1,428" delta={{ text: "+42%" }} />`,
  },
  TeX: {
    render: () => <TeX block>{"\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}"}</TeX>,
    source: `<TeX block>{"\\\\oint \\\\vec{E}\\\\cdot d\\\\vec{A} = \\\\frac{Q}{\\\\varepsilon_0}"}</TeX>`,
  },
  SlideDeck: {
    render: () => (
      <SlideDeck
        slides={[
          { id: "1", title: "Setup", content: <Prose>Two carts sit on a frictionless track.</Prose> },
          { id: "2", title: "Collision", content: <Prose>They collide and stick together.</Prose> },
          { id: "3", title: "Result", content: <Prose>Momentum before equals momentum after.</Prose> },
        ]}
      />
    ),
    source: `<SlideDeck slides={[{ id: "1", title: "Setup", content: <Prose>…</Prose> }, …]} />`,
  },
  NumericAnswer: {
    render: () => (
      <NumericAnswer
        question="A 2 kg cart moves at 3 m/s. What is its momentum?"
        answer={6}
        tolerance={0.1}
        unit="kg·m/s"
        hint="p = m × v"
      />
    ),
    source: `<NumericAnswer question="…momentum?" answer={6} tolerance={0.1} unit="kg·m/s" hint="p = m × v" />`,
  },
  Derivation: {
    render: () => (
      <Derivation
        title="Impulse–momentum theorem"
        defaultOpen
        steps={[
          { tex: "F = m a", note: "Newton's second law" },
          { tex: "F = m \\frac{dv}{dt}" },
          { tex: "F\\,dt = m\\,dv", note: "Rearrange" },
          { tex: "J = \\Delta p", note: "Integrate" },
        ]}
      />
    ),
    source: `<Derivation title="Impulse–momentum theorem" steps={[
  { tex: "F = m a", note: "Newton's second law" }, …
]} />`,
  },
  SketchPad: {
    render: () => (
      <SketchPad
        prompt="Sketch how velocity changes over time for free fall."
        viewBox="0 0 320 200"
        background={
          <g stroke="var(--border)" strokeWidth="1">
            <line x1="30" y1="10" x2="30" y2="180" />
            <line x1="30" y1="180" x2="310" y2="180" />
          </g>
        }
        overlay={<line x1="30" y1="180" x2="300" y2="30" stroke="var(--primary)" strokeWidth="3" strokeDasharray="6 4" />}
      />
    ),
    source: `<SketchPad prompt="Sketch velocity vs time…" background={<axes/>} overlay={<answer/>} />`,
  },
  Challenge: {
    render: () => <ChallengeDemo />,
    source: `<Challenge title="Balance the equation" goal="Get both sides to 12" done={done} onDone={…}>
  …interactive content…
</Challenge>`,
  },
  CodeCell: {
    render: () => (
      <CodeCell
        code={"// Try changing the count\nfor (let i = 1; i <= 3; i++) {\n  console.log('step', i);\n}"}
        caption="Edit the loop and press Run."
      />
    ),
    source: `<CodeCell code={"console.log('hello')"} caption="Edit and Run." />`,
  },
  Readout: {
    render: () => (
      <div className="flex flex-wrap gap-3">
        <Readout label="Kinetic energy" value="18 J" tone="primary" />
        <Readout label="Error" value="out of range" tone="destructive" />
      </div>
    ),
    source: `<Readout label="Kinetic energy" value="18 J" tone="primary" />`,
  },

  // ── runtime ────────────────────────────────────────────────────────────────
  Course: {
    render: () => <CourseDemo />,
    source: `<Course title="…" chapters={[{ slug, title, element: <Chapter/> }, …]} />`,
  },
  "lesson-host": {
    blurb: "LessonHost — the shell every lesson mounts inside: the .style-faraday layer, a centered reading column, the light/dark toggle, and an error boundary. Shown in an isolated frame (it fills the viewport).",
    render: () => (
      <iframe
        title="LessonHost frame"
        src="/?frame=lessonhost"
        className="h-[520px] w-full rounded-lg border border-border bg-background"
      />
    ),
    source: `createRoot(root).render(<LessonHost><Lesson>…</Lesson></LessonHost>)`,
  },
};
