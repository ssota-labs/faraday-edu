import {
  Prose,
  Quiz,
  Chart,
  CodeCell,
  Callout,
  TeX,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

// Static dataset: study hours per week vs exam score (0–100).
// Realistic but synthetic — a moderate positive trend with natural scatter.
const DATA = [
  { hours: 1, score: 42 },
  { hours: 2, score: 51 },
  { hours: 2, score: 55 },
  { hours: 3, score: 58 },
  { hours: 3, score: 63 },
  { hours: 4, score: 60 },
  { hours: 4, score: 67 },
  { hours: 5, score: 70 },
  { hours: 5, score: 74 },
  { hours: 6, score: 72 },
  { hours: 6, score: 78 },
  { hours: 7, score: 75 },
  { hours: 7, score: 82 },
  { hours: 8, score: 80 },
  { hours: 8, score: 85 },
  { hours: 9, score: 84 },
  { hours: 10, score: 88 },
  { hours: 10, score: 91 },
  { hours: 11, score: 87 },
  { hours: 12, score: 93 },
];

// Pre-compute summary stats for the Callout.
const n = DATA.length;
const meanH = DATA.reduce((s, d) => s + d.hours, 0) / n;
const meanS = DATA.reduce((s, d) => s + d.score, 0) / n;

export default function GAISEInvestigation() {
  return (
    <MethodShell
      method="GAISE Investigation Cycle"
      discipline="Statistics"
      topic="Bivariate data"
      title="Do study hours predict exam scores?"
      lead="The GAISE framework moves statistical investigation through five phases: Formulate Question → Collect Data → Analyse → Interpret → Communicate. We follow that arc for a real-world question: does weekly study time predict exam performance?"
      phases={["Question", "Data", "Analyse", "Interpret", "Communicate"]}
      families={["prose", "chart", "quiz", "code"]}
    >
      <Prose heading="Phase 1 — Formulate the question">
        <p>
          A good statistical question anticipates variability and can be
          answered with data. Vague questions like "does studying help?" are
          not statistical — they have no unit of measurement and no way to
          quantify the relationship.
        </p>
      </Prose>

      <Quiz
        question="Which phrasing is the best statistical question for this investigation?"
        options={[
          {
            label: "Is there a linear association between weekly study hours and exam score among students in this class?",
            correct: true,
            hint: "This specifies the variables, the expected relationship type (linear), and the population — all three are needed for a GAISE question.",
          },
          {
            label: "Does studying help students do better?",
            hint: "Too vague — 'help' and 'better' are not measured quantities.",
          },
          {
            label: "What score did the student who studied 10 hours get?",
            hint: "This is a lookup question, not a statistical one — it asks about an individual, not a pattern across the group.",
          },
          {
            label: "Which is the best way to study?",
            hint: "This is an opinion question; it cannot be answered by a scatter plot of hours vs score.",
          },
        ]}
      />

      <Prose heading="Phase 2 — Collect and display data">
        <p>
          The scatter plot below shows 20 students' self-reported weekly study
          hours and their end-of-term exam score (out of 100). Each point is
          one student. Look at the overall shape before reading any statistics.
        </p>
      </Prose>

      <Chart
        type="line"
        data={DATA}
        x="hours"
        xType="number"
        yAxis
        series={[{ key: "score", label: "Exam score" }]}
        height={280}
      />

      <Callout title="Dataset summary">
        <p className="text-sm">
          <strong>n = {n} students</strong> · mean study hours{" "}
          <TeX>{String.raw`\bar{x} = ${meanH.toFixed(1)}`}</TeX> · mean score{" "}
          <TeX>{String.raw`\bar{y} = ${meanS.toFixed(1)}`}</TeX>
        </p>
      </Callout>

      <Prose heading="Phase 3 — Analyse">
        <p>
          The Pearson correlation coefficient{" "}
          <TeX>{String.raw`r`}</TeX> quantifies the strength and direction of
          the linear association. It ranges from{" "}
          <TeX>{String.raw`-1`}</TeX> (perfect negative) through{" "}
          <TeX>{String.raw`0`}</TeX> (none) to{" "}
          <TeX>{String.raw`+1`}</TeX> (perfect positive).
        </p>
        <TeX block>{String.raw`r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum(x_i-\bar{x})^2\,\sum(y_i-\bar{y})^2}}`}</TeX>
        <p>Run the cell below to compute <TeX>{String.raw`r`}</TeX> and the group means.</p>
      </Prose>

      <CodeCell
        label="Compute Pearson r and group means"
        code={`const data = [
  [1,42],[2,51],[2,55],[3,58],[3,63],[4,60],[4,67],
  [5,70],[5,74],[6,72],[6,78],[7,75],[7,82],[8,80],
  [8,85],[9,84],[10,88],[10,91],[11,87],[12,93],
];

const n = data.length;
const mx = data.reduce((s,[x])=>s+x,0)/n;
const my = data.reduce((s,[,y])=>s+y,0)/n;

let num=0, dx2=0, dy2=0;
for (const [x,y] of data) {
  num += (x-mx)*(y-my);
  dx2 += (x-mx)**2;
  dy2 += (y-my)**2;
}
const r = num / Math.sqrt(dx2*dy2);

console.log("Mean hours:", mx.toFixed(2));
console.log("Mean score:", my.toFixed(2));
console.log("Pearson r:", r.toFixed(3));
console.log("r²:", (r**2).toFixed(3));`}
        caption="r² tells you the fraction of score variance explained by study hours. How large is it?"
      />

      <Prose heading="Phase 4 — Interpret in context">
        <p>
          A correlation near <TeX>{String.raw`r = 0.97`}</TeX> is strong, but
          statistics never proves causation from observational data alone.
          Consider what other variables might drive both study hours and scores.
        </p>
      </Prose>

      <Quiz
        question="Which statement is the most defensible interpretation of a strong positive r between study hours and exam score?"
        options={[
          {
            label: "Students who study more tend to score higher, but this does not prove that studying causes the higher score",
            correct: true,
            hint: "Correct — correlation quantifies association; confounders (motivation, prior knowledge) could explain part of the pattern.",
          },
          {
            label: "Studying more directly causes better exam scores",
            hint: "This overclaims — observational data cannot establish causation without controlling for confounders.",
          },
          {
            label: "The relationship is too scattered to draw any conclusion",
            hint: "A strong r (near ±1) indicates a clear pattern despite scatter; some variability is expected and doesn't invalidate the finding.",
          },
          {
            label: "Every student who studies 10 hours will score above 88",
            hint: "Correlation describes averages and trends, not guarantees for individuals — natural variability remains.",
          },
        ]}
      />

      <Prose heading="Phase 5 — Communicate the findings">
        <p>
          A complete statistical report connects the question, the evidence, and
          the limitations in plain language a non-statistician can act on. The
          summary below models that structure.
        </p>
        <blockquote className="border-l-4 pl-4 text-muted-foreground">
          <p>
            We asked whether weekly study hours predict exam scores among{" "}
            {n} students in this class. The scatter plot shows a strong, positive
            linear association (<TeX>{String.raw`r \approx 0.97`}</TeX>), with
            students who study more generally scoring higher. Study hours account
            for approximately 94 % of the variability in scores (
            <TeX>{String.raw`r^2 \approx 0.94`}</TeX>). However, because this
            is observational data, we cannot rule out confounders such as prior
            knowledge or motivation. The finding is consistent with study hours
            being a useful predictor, but controlled experiments would be needed
            to establish a causal link.
          </p>
        </blockquote>
      </Prose>
    </MethodShell>
  );
}
