// Example — a multi-chapter COURSE (a small textbook). Copy this into
// src/lesson/lesson.tsx to try it. Each chapter is a normal lesson (composes
// <Lesson> + blocks); <Course> adds the chapter nav, prev/next, and #hash routing.
// Keep chapter components in src/lesson/chapters/ in a real course.
import { useMemo, useState } from "react";
import { Course } from "@/faraday/runtime";
import { Lesson, Prose, Stage, Chart, ParamSlider, Callout, Quiz } from "@/faraday/blocks";

function CountingChapter() {
  const [n, setN] = useState(6);
  const dots = Array.from({ length: n });
  return (
    <Lesson topic="Numbers · Chapter 1" title="Counting in groups" lead="Adjust the count and watch the row grow.">
      <Prose>
        <p>A number is just a count of things. Slide to change how many dots there are.</p>
      </Prose>
      <Stage caption={`${n} dots`}>
        <svg viewBox="0 0 640 120" role="img" aria-label="A row of dots">
          {dots.map((_, i) => (
            <circle key={i} cx={40 + (i * 560) / Math.max(1, n - 1)} cy={60} r={16} style={{ fill: "var(--primary)" }} />
          ))}
        </svg>
      </Stage>
      <ParamSlider label="How many" value={n} min={1} max={12} onChange={setN} />
      <Quiz
        question="If you add one more dot to a row of 6, how many are there?"
        options={[
          { label: "6" },
          { label: "7", correct: true, hint: "Counting on by one." },
          { label: "12" },
        ]}
      />
    </Lesson>
  );
}

function DoublingChapter() {
  const [steps, setSteps] = useState(8);
  const data = useMemo(
    () => Array.from({ length: steps }, (_, i) => ({ step: `${i}`, doubling: 2 ** i, linear: i * 8 })),
    [steps],
  );
  return (
    <Lesson topic="Numbers · Chapter 2" title="Doubling gets big, fast" lead="Compare doubling with steady growth.">
      <Prose>
        <p>
          Add one each step and you climb slowly. <strong>Double</strong> each step and you rocket
          upward — that's exponential growth.
        </p>
      </Prose>
      <Chart
        type="line"
        data={data}
        x="step"
        yAxis
        series={[
          { key: "doubling", label: "Doubling" },
          { key: "linear", label: "Add 8 each step" },
        ]}
      />
      <ParamSlider label="Steps" value={steps} min={3} max={12} onChange={setSteps} />
      <Callout title="Why it matters">
        Compound interest, viral spread, and Moore's law are all doubling curves — small at first,
        overwhelming later.
      </Callout>
      <Quiz
        question="After 10 steps, which is larger?"
        options={[
          { label: "Adding 8 each step (= 80)", hint: "Steady but slow." },
          { label: "Doubling (= 1024)", correct: true, hint: "Exponential wins decisively." },
        ]}
      />
    </Lesson>
  );
}

export default function NumbersCourse() {
  return (
    <Course
      title="A tiny numbers course"
      chapters={[
        { slug: "counting", title: "Counting", element: <CountingChapter /> },
        { slug: "doubling", title: "Doubling", element: <DoublingChapter /> },
      ]}
    />
  );
}
