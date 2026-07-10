// <Quiz> — a self-check multiple-choice question. Reveals correctness + hint
// after the learner picks an option and presses Check. Optional callbacks let a
// lesson react to a pass — e.g. inside a <CurriculumHost>, wire `onCorrect` to
// `useNode().complete()` so answering correctly unlocks the next node.
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/faraday/ui/radio-group";
import { Button } from "@/faraday/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/faraday/ui/alert";

export interface QuizOption {
  label: string;
  correct?: boolean;
  hint?: string;
}

export function Quiz(props: {
  question: string;
  options: QuizOption[];
  /** Fires when the learner checks a CORRECT answer. Wire to `useNode().complete()`
   *  in a curriculum to unlock the next node, or trigger any "passed" side effect. */
  onCorrect?: () => void;
  /** Fires on every Check with the result — for analytics or custom UI. */
  onChecked?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const chosen = selected !== null ? props.options[Number(selected)] : null;

  const pick = (i: number) => {
    setSelected(String(i));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (!chosen) return;
    const correct = Boolean(chosen.correct);
    props.onChecked?.(correct);
    if (correct) props.onCorrect?.();
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <p className="font-medium">{props.question}</p>
      <RadioGroup value={selected ?? undefined} onValueChange={(v) => pick(Number(v))}>
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
        <Button size="sm" disabled={selected === null} onClick={check}>
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
