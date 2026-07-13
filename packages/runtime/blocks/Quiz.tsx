// <Quiz> — a self-check multiple-choice question. Reveals correctness + hint
// after the learner picks an option and presses Check. Optional callbacks let a
// lesson react to a pass — e.g. inside a <CourseHost>, wire `onCorrect` to
// `useNode().complete()` so answering correctly unlocks the next node.
import { useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { celebrate } from "./celebrate";

export interface QuizOption {
  label: string;
  correct?: boolean;
  hint?: string;
}

export function Quiz(props: {
  question: string;
  options: QuizOption[];
  /** Fires when the learner checks a CORRECT answer. Wire to `useNode().complete()`
   *  in a course to unlock the next node, or trigger any "passed" side effect. */
  onCorrect?: () => void;
  /** Fires on every Check with the result — for analytics or custom UI. */
  onChecked?: (correct: boolean) => void;
}) {
  // "" = nothing picked yet. Keep the RadioGroup CONTROLLED from first render —
  // passing undefined first (uncontrolled) then a string (controlled) makes
  // Base UI log an uncontrolled→controlled error on every first selection.
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const chosen = selected !== "" ? props.options[Number(selected)] : null;

  const pick = (i: number) => {
    setSelected(String(i));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (!chosen) return;
    const correct = Boolean(chosen.correct);
    props.onChecked?.(correct);
    if (correct) {
      celebrate(rootRef.current);
      props.onCorrect?.();
    }
  };

  return (
    <section ref={rootRef} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <p className="font-medium">{props.question}</p>
      <RadioGroup value={selected} onValueChange={(v) => pick(Number(v))}>
        <div className="flex flex-col gap-2">
          {props.options.map((o, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
              onClick={() => pick(i)}
            >
              <RadioGroupItem value={String(i)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </RadioGroup>
      <div>
        <Button size="sm" disabled={selected === ""} onClick={check}>
          Check answer
        </Button>
      </div>
      {checked && chosen ? (
        <Alert variant={chosen.correct ? "default" : "destructive"}>
          <AlertTitle>{chosen.correct ? "Correct" : "Not quite"}</AlertTitle>
          <AlertDescription>
            {chosen.hint ?? (chosen.correct ? "Nice work." : "Try another option.")}
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
