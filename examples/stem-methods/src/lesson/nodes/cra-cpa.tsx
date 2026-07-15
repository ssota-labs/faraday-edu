import { useState } from "react";
import {
  Prose,
  Quiz,
  TeX,
  Workbench,
  ControlGroup,
  ParamSlider,
  Readout,
  Stage,
  Callout,
} from "@faraday-academy/kit/blocks";
import { MethodShell } from "../_shared/MethodShell";

const W = 480;
const H = 100;
const CELL = W / 4;

function FourthBar(props: { shaded: number; caption: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={props.caption}>
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={i * CELL + 4}
          y={22}
          width={CELL - 8}
          height={48}
          rx={6}
          style={{
            fill: i < props.shaded ? "var(--primary)" : "var(--muted)",
            stroke: "var(--border)",
            strokeWidth: 2,
          }}
        />
      ))}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={12} style={{ fill: "var(--muted-foreground)" }}>
        {props.caption}
      </text>
    </svg>
  );
}

export default function CraCpa() {
  const [halfFourths, setHalfFourths] = useState(2);
  const quarterFourths = 1;
  const total = halfFourths + quarterFourths;

  return (
    <MethodShell
      method="CRA / CPA"
      discipline="Math"
      topic="Fractions"
      title="Add ½ and ¼ with tiles, bars, then symbols"
      lead="Concrete–Representational–Abstract: manipulate fraction tiles, see a bar model, then meet the notation."
      phases={["Concrete", "Representational", "Abstract"]}
      families={["manipulative", "spatial", "formalism", "check"]}
    >
      <Prose heading="Concrete — build ½ and ¼ with fourth-tiles">
        <p>
          One half equals <strong>two</strong> fourth-pieces; one quarter equals <strong>one</strong>.
          Set the first bar to show ½, then count the combined shaded fourths when you add ¼.
        </p>
      </Prose>

      <Workbench
        title="Fraction tiles"
        panelTitle="Manipulate"
        controls={
          <ControlGroup label="Show ½ as fourth-pieces">
            <ParamSlider label="Fourth-pieces in ½" value={halfFourths} min={1} max={2} step={1} onChange={setHalfFourths} />
          </ControlGroup>
        }
        hud={
          <>
            <Readout label="½ as fourths" value={`${halfFourths}/4`} />
            <Readout label="Total fourths" value={`${total}/4`} tone={total === 3 ? "primary" : "default"} />
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <FourthBar shaded={halfFourths} caption="½" />
          <FourthBar shaded={quarterFourths} caption="+ ¼" />
          <FourthBar shaded={Math.min(total, 4)} caption={`= ${total}/4`} />
        </div>
      </Workbench>

      <Prose heading="Representational — bar diagram">
        <p>Three of four equal parts are shaded — the same area the tiles showed.</p>
      </Prose>

      <Stage caption="Bar model: ½ + ¼ = ¾">
        <FourthBar shaded={3} caption="¾ of the whole" />
      </Stage>

      <Prose heading="Abstract — symbols">
        <TeX block>{String.raw`\frac{1}{2} + \frac{1}{4} = \frac{2}{4} + \frac{1}{4} = \frac{3}{4}`}</TeX>
      </Prose>

      <Quiz
        question="What is ½ + ¼?"
        options={[
          { label: "2/4", hint: "That is only the first addend." },
          { label: "3/4", correct: true, hint: "Two fourths plus one fourth equals three fourths." },
          { label: "1/3", hint: "The whole still has four equal parts — denominators do not add." },
          { label: "5/4", hint: "Three fourths is less than one whole." },
        ]}
      />

      <Callout title="CRA in one sentence">Manipulate, draw, then symbolize — never the reverse.</Callout>
    </MethodShell>
  );
}
